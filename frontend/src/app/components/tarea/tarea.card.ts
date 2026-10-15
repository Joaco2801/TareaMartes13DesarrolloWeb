import { DatePipe, NgClass } from '@angular/common';
import { Component, input, linkedSignal, output } from '@angular/core';
import { form, FormField, maxLength, required, submit } from '@angular/forms/signals';
import { PRIORIDADES } from '../../model/tarea';
import type { Tarea, TareaDatos } from '../../model/tarea';
import { GRUPOS } from '../../model/usuario';

/** Modelo del formulario: la descripción es un string ('' equivale a null). */
interface TareaModel {
  titulo: string;
  descripcion: string;
  grupo: TareaDatos['grupo'];
  prioridad: TareaDatos['prioridad'];
}

/**
 * Tarjeta de tarea con dos modos:
 *  - `ver`: muestra la tarea con botones Editar / Eliminar.
 *  - `editar`: la misma tarjeta se convierte en formulario (alta o edición).
 *
 * No conoce ningún servicio: todo sale por `output` y lo resuelve la page.
 */
@Component({
  imports: [FormField, DatePipe, NgClass],
  selector: 'app-tarea-card',
  styleUrl: './tarea.card.css',
  templateUrl: './tarea.card.html',
})
export class TareaCard {
  /** Tarea a mostrar/editar; `null` en modo `editar` para crear una nueva. */
  public tarea = input<Tarea | null>(null);
  public modo = input<'ver' | 'editar'>('ver');

  public editar = output<Tarea>();
  public eliminar = output<Tarea>();
  public guardarTarea = output<TareaDatos>();
  public cancelar = output<void>();

  public grupos = GRUPOS;
  public prioridades = PRIORIDADES;

  public tareaModel = linkedSignal<TareaModel>(() => {
    const t = this.tarea();
    return t
      ? { titulo: t.titulo, descripcion: t.descripcion ?? '', grupo: t.grupo, prioridad: t.prioridad }
      : { titulo: '', descripcion: '', grupo: 'user', prioridad: '1:media' };
  });

  public tareaForm = form(this.tareaModel, (p) => {
    required(p.titulo, { message: 'El título es obligatorio.' });
    maxLength(p.titulo, 100, { message: 'Máximo 100 caracteres.' });
  });

  public etiquetaPrioridad(valor: Tarea['prioridad']): string {
    return PRIORIDADES.find((p) => p.valor === valor)?.etiqueta ?? valor;
  }

  public submitForm(event: Event) {
    event.preventDefault();
    submit(this.tareaForm, async () => {
      const { titulo, descripcion, grupo, prioridad } = this.tareaForm().value();
      this.guardarTarea.emit({
        titulo: titulo.trim(),
        descripcion: descripcion.trim() === '' ? null : descripcion.trim(),
        grupo,
        prioridad,
      });
    });
  }
}
