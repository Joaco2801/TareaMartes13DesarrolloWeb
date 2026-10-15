import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TareaCard } from '../../components/tarea-card/tarea-card';
import type { Tarea } from '../../models/tarea';
import { TareaService } from '../../services/tarea-service';
import { UsuarioService } from '../../services/usuario-service';

/** Única que habla con los servicios: las tarjetas sólo emiten eventos. */
@Component({
  selector: 'app-tareas-page',
  imports: [RouterLink, TareaCard],
  templateUrl: './tareas-page.html',
  styleUrl: './tareas-page.css',
})
export class TareasPage {
  private readonly tareaService = inject(TareaService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly router = inject(Router);

  protected readonly tareas = this.tareaService.tareas;
  private readonly nombres = computed(
    () => new Map(this.usuarioService.usuarios().map((u) => [u.id_usuario, u.nombre_completo])),
  );

  protected creador(t: Tarea): string | null {
    return this.nombres().get(t.id_creador) ?? null;
  }

  protected editar(t: Tarea): void {
    this.router.navigate(['/tareas', t.id_tarea]);
  }

  protected eliminar(t: Tarea): void {
    if (confirm(`¿Eliminar la tarea "${t.titulo}"?`)) {
      this.tareaService.eliminar(t.id_tarea);
    }
  }
}
