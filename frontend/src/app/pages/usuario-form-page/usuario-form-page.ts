import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UsuarioForm } from '../../components/usuario-form/usuario-form';
import type { UsuarioDatos } from '../../models/usuario';
import { UsuarioService } from '../../services/usuario-service';

/** Sirve para `/usuarios/crear` (sin id) y `/usuarios/:id_usuario` (edición). */
@Component({
  selector: 'app-usuario-form-page',
  imports: [UsuarioForm, RouterLink],
  templateUrl: './usuario-form-page.html',
})
export class UsuarioFormPage {
  private readonly service = inject(UsuarioService);
  private readonly router = inject(Router);

  /** Parámetro de ruta (enlazado con withComponentInputBinding). */
  readonly id_usuario = input<string>();

  protected readonly editando = computed(() => this.id_usuario() !== undefined);
  protected readonly usuario = computed(() => {
    const id = this.id_usuario();
    return id === undefined ? null : (this.service.obtenerPorId(Number(id)) ?? null);
  });
  protected readonly error = signal<string | null>(null);

  protected guardar(datos: UsuarioDatos): void {
    try {
      const actual = this.usuario();
      if (actual) this.service.actualizar(actual.id_usuario, datos);
      else this.service.crear(datos);
      this.volver();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'No se pudo guardar el usuario.');
    }
  }

  protected volver(): void {
    this.router.navigate(['/usuarios']);
  }
}
