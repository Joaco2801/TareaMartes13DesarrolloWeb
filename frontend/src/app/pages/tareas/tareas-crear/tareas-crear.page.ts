import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TareaCard } from '../../../components/tarea/tarea.card';
import { TareaDatos } from '../../../model/tarea';
import { TareaService } from '../../../services/tarea.service';

@Component({
  selector: 'app-tareas-crear',
  styleUrl: './tareas-crear.page.css',
  templateUrl: './tareas-crear.page.html',
  imports: [TareaCard],
})
export class TareasCrearPage {
  private router = inject(Router);
  private tareaService = inject(TareaService);

  public onGuardarTarea(tarea: TareaDatos) {
    this.tareaService.crear(tarea);
    this.volver();
  }

  public volver() {
    this.router.navigate(['/', 'tareas']);
  }
}

export default TareasCrearPage;
