import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioForm } from '../../../components/usuario/usuario.form';
import { UsuarioDatos } from '../../../model/usuario';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-editar-usuario',
  styleUrl: './editar-usuario.page.css',
  templateUrl: './editar-usuario.page.html',
  imports: [UsuarioForm],
})
export class EditarUsuarioPage {
  private router = inject(Router);
  private usuarioService = inject(UsuarioService);

  /** Parámetro de la ruta `usuarios/:id_usuario` (withComponentInputBinding). */
  public id_usuario = input.required<string>();

  public usuario = computed(() => this.usuarioService.obtenerPorId(Number(this.id_usuario())) ?? null);
  public error = signal<string | null>(null);

  constructor() {
    // Si el id no existe (p. ej. /usuarios/frutilla) volvemos al listado
    effect(() => {
      if (this.usuario() === null) this.volver();
    });
  }

  public onGuardarUsuario(datos: UsuarioDatos) {
    const usuario = this.usuario();
    if (!usuario) return;
    try {
      this.usuarioService.actualizar(usuario.id_usuario, datos);
      this.volver();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'No se pudo guardar el usuario.');
    }
  }

  public volver() {
    this.router.navigate(['/', 'usuarios']);
  }
}

export default EditarUsuarioPage;
