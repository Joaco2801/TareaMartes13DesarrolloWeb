import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioForm } from '../../../components/usuario/usuario.form';
import { UsuarioDatos } from '../../../model/usuario';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-crear-usuario',
  styleUrl: './crear-usuario.page.css',
  templateUrl: './crear-usuario.page.html',
  imports: [UsuarioForm],
})
export class CrearUsuarioPage {
  private router = inject(Router);
  private usuarioService = inject(UsuarioService);

  public error = signal<string | null>(null);

  public onGuardarUsuario(usuario: UsuarioDatos) {
    try {
      this.usuarioService.crear(usuario);
      this.volver();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'No se pudo crear el usuario.');
    }
  }

  public volver() {
    this.router.navigate(['/', 'usuarios']);
  }
}

export default CrearUsuarioPage;
