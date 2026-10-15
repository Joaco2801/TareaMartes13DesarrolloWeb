import { DatePipe } from '@angular/common';
import { Component, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PRIORIDADES } from '../../models/tarea';
import type { Tarea, TareaDatos } from '../../models/tarea';
import { GRUPOS } from '../../models/usuario';

/**
 * Tarjeta de tarea con dos modos:
 *  - `ver`: muestra la tarea con botones Editar / Eliminar.
 *  - `editar`: la misma tarjeta se convierte en formulario (alta o edición).
 *
 * No conoce ningún servicio: todo sale por eventos y lo resuelve la página.
 */
@Component({
  selector: 'app-tarea-card',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './tarea-card.html',
  styleUrl: './tarea-card.css',
})
export class TareaCard {
  /** Tarea a mostrar/editar; `null` en modo `editar` para crear una nueva. */
  readonly tarea = input<Tarea | null>(null);
  readonly modo = input<'ver' | 'editar'>('ver');
  /** Nombre del creador (lo resuelve la página; opcional). */
  readonly creador = input<string | null>(null);

  readonly editar = output<Tarea>();
  readonly eliminar = output<Tarea>();
  readonly guardar = output<TareaDatos>();
  readonly cancelar = output<void>();

  protected readonly grupos = GRUPOS;
  protected readonly prioridades = PRIORIDADES;

  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly form = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: [''],
    grupo: this.fb.control<TareaDatos['grupo']>('user'),
    prioridad: this.fb.control<TareaDatos['prioridad']>('1:media'),
  });

  constructor() {
    effect(() => {
      const t = this.tarea();
      if (t) {
        this.form.reset({
          titulo: t.titulo,
          descripcion: t.descripcion ?? '',
          grupo: t.grupo,
          prioridad: t.prioridad,
        });
      }
    });
  }

  protected etiquetaPrioridad(valor: Tarea['prioridad']): string {
    return PRIORIDADES.find((p) => p.valor === valor)?.etiqueta ?? valor;
  }

  protected get tituloInvalido(): boolean {
    const c = this.form.controls.titulo;
    return c.invalid && (c.touched || c.dirty);
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { titulo, descripcion, grupo, prioridad } = this.form.getRawValue();
    this.guardar.emit({
      titulo: titulo.trim(),
      descripcion: descripcion.trim() === '' ? null : descripcion.trim(),
      grupo,
      prioridad,
    });
  }
}
