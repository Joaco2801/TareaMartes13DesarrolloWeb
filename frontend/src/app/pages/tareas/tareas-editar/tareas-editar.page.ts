import { Component, computed, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { TareaCard } from '../../../components/tarea/tarea.card';
import { TareaDatos } from '../../../model/tarea';
import { TareaService } from '../../../services/tarea.service';

@Component({
  selector: 'app-tareas-editar',
  styleUrl: './tareas-editar.page.css',
  templateUrl: './tareas-editar.page.html',
  imports: [TareaCard],
})
export class TareasEditarPage {
  private router = inject(Router);
  private tareaService = inject(TareaService);

  /** Parámetro de la ruta `tareas/:id_tarea` (withComponentInputBinding). */
  public id_tarea = input.required<string>();

  public tarea = computed(() => this.tareaService.obtenerPorId(Number(this.id_tarea())) ?? null);

  constructor() {
    // Si el id no existe (p. ej. /tareas/frutilla) volvemos al listado
    effect(() => {
      if (this.tarea() === null) this.volver();
    });
  }

  public onGuardarTarea(datos: TareaDatos) {
    const tarea = this.tarea();
    if (!tarea) return;
    this.tareaService.actualizar(tarea.id_tarea, datos);
    this.volver();
  }

  public volver() {
    this.router.navigate(['/', 'tareas']);
  }
}

export default TareasEditarPage;
