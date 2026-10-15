import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TareaCard } from '../../components/tarea-card/tarea-card';
import type { TareaDatos } from '../../models/tarea';
import { TareaService } from '../../services/tarea-service';

/** Sirve para `/tareas/crear` (sin id) y `/tareas/:id_tarea` (edición). */
@Component({
  selector: 'app-tarea-form-page',
  imports: [TareaCard, RouterLink],
  templateUrl: './tarea-form-page.html',
})
export class TareaFormPage {
  private readonly service = inject(TareaService);
  private readonly router = inject(Router);

  /** Parámetro de ruta (enlazado con withComponentInputBinding). */
  readonly id_tarea = input<string>();

  protected readonly editando = computed(() => this.id_tarea() !== undefined);
  protected readonly tarea = computed(() => {
    const id = this.id_tarea();
    return id === undefined ? null : (this.service.obtenerPorId(Number(id)) ?? null);
  });

  protected guardar(datos: TareaDatos): void {
    const actual = this.tarea();
    if (actual) this.service.actualizar(actual.id_tarea, datos);
    else this.service.crear(datos);
    this.volver();
  }

  protected volver(): void {
    this.router.navigate(['/tareas']);
  }
}
