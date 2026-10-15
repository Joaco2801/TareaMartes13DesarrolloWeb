import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TareaCard } from '../../../components/tarea/tarea.card';
import { Tarea } from '../../../model/tarea';
import { TareaService } from '../../../services/tarea.service';

/** Sólo la page habla con los servicios: las tarjetas únicamente emiten eventos. */
@Component({
  selector: 'app-tareas-listar',
  styleUrl: './tareas-listar.page.css',
  templateUrl: './tareas-listar.page.html',
  imports: [TareaCard],
})
export class TareasListarPage {
  private router = inject(Router);
  private tareaService = inject(TareaService);

  public tareas = this.tareaService.tareas;

  public goToCrear() {
    this.router.navigate(['/', 'tareas', 'crear']);
  }

  public onEditar(tarea: Tarea) {
    this.router.navigate(['/', 'tareas', tarea.id_tarea]);
  }

  public onEliminar(tarea: Tarea) {
    if (confirm(`¿Eliminar la tarea "${tarea.titulo}"?`)) {
      this.tareaService.eliminar(tarea.id_tarea);
    }
  }
}

export default TareasListarPage;
