import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import type { Usuario } from '../../models/usuario';
import { UsuarioService } from '../../services/usuario-service';

@Component({
  selector: 'app-usuarios-page',
  imports: [RouterLink, DatePipe],
  templateUrl: './usuarios-page.html',
  styleUrl: './usuarios-page.css',
})
export class UsuariosPage {
  private readonly service = inject(UsuarioService);
  private readonly router = inject(Router);

  protected readonly usuarios = this.service.usuarios;

  protected editar(u: Usuario): void {
    this.router.navigate(['/usuarios', u.id_usuario]);
  }

  protected borrar(u: Usuario): void {
    if (confirm(`¿Borrar al usuario "${u.nombre_completo}" (${u.username})?`)) {
      this.service.eliminar(u.id_usuario);
    }
  }
}
