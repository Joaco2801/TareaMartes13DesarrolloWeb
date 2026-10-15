import { DatePipe, NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from '../../../model/usuario';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-listar-usuarios',
  styleUrl: './listar-usuarios.page.css',
  templateUrl: './listar-usuarios.page.html',
  imports: [DatePipe, NgClass],
})
export class ListarUsuariosPage {
  private router = inject(Router);
  private usuarioService = inject(UsuarioService);

  // Señal del servicio: la tabla se actualiza sola cuando cambian los datos
  public usuarios = this.usuarioService.usuarios;

  public goToCrear() {
    this.router.navigate(['/', 'usuarios', 'crear']);
  }

  public goToEditar(usuario: Usuario) {
    this.router.navigate(['/', 'usuarios', usuario.id_usuario]);
  }

  public borrar(usuario: Usuario) {
    if (confirm(`¿Borrar al usuario "${usuario.nombre_completo}" (${usuario.username})?`)) {
      this.usuarioService.eliminar(usuario.id_usuario);
    }
  }
}

export default ListarUsuariosPage;
