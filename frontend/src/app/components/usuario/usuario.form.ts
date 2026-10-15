import { Component, input, linkedSignal, output } from '@angular/core';
import { disabled, form, FormField, maxLength, minLength, pattern, required, submit, validate } from '@angular/forms/signals';
import { GRUPOS } from '../../model/usuario';
import type { Grupo, Usuario, UsuarioDatos } from '../../model/usuario';

const USUARIO_VACIO: UsuarioDatos = {
  username: '',
  nombres: '',
  apellidos: '',
  fecha_nacimiento: '',
  grupos: ['user'],
  activo: true,
};

/**
 * Formulario de usuario (alta y edición). No conoce ningún servicio:
 * recibe el usuario por `usuario` y devuelve los datos por `guardarUsuario`.
 */
@Component({
  imports: [FormField],
  selector: 'app-usuario-form',
  styleUrl: './usuario.form.css',
  templateUrl: './usuario.form.html',
})
export class UsuarioForm {
  /** Usuario a editar; `null` para crear uno nuevo. */
  public usuario = input<Usuario | null>(null);
  /** Mensaje de error a mostrar (p. ej. username repetido). */
  public error = input<string | null>(null);

  public guardarUsuario = output<UsuarioDatos>();
  public cancelar = output<void>();

  public gruposDisponibles = GRUPOS;

  // Modelo del formulario: se reinicia solo cuando cambia el `usuario` recibido
  public usuarioModel = linkedSignal<UsuarioDatos>(() => {
    const u = this.usuario();
    return u
      ? {
          username: u.username,
          nombres: u.nombres,
          apellidos: u.apellidos,
          fecha_nacimiento: u.fecha_nacimiento,
          grupos: [...u.grupos],
          activo: u.activo,
        }
      : { ...USUARIO_VACIO, grupos: [...USUARIO_VACIO.grupos] };
  });

  public usuarioForm = form(this.usuarioModel, (p) => {
    required(p.username, { message: 'El username es obligatorio.' });
    minLength(p.username, 3, { message: 'Mínimo 3 caracteres.' });
    maxLength(p.username, 30, { message: 'Máximo 30 caracteres.' });
    pattern(p.username, /^[A-Za-z0-9_.-]+$/, { message: 'Sólo letras, números, punto, guion y guion bajo.' });
    disabled(p.username, () => (this.usuario() !== null ? 'El username no se puede modificar.' : false));

    required(p.nombres, { message: 'Los nombres son obligatorios.' });
    required(p.apellidos, { message: 'Los apellidos son obligatorios.' });
    required(p.fecha_nacimiento, { message: 'La fecha de nacimiento es obligatoria.' });

    validate(p.grupos, ({ value }) =>
      value().length > 0 ? null : { kind: 'grupos', message: 'Elegí al menos un grupo.' },
    );
  });

  public get editando(): boolean {
    return this.usuario() !== null;
  }

  public tieneGrupo(grupo: Grupo): boolean {
    return this.usuarioModel().grupos.includes(grupo);
  }

  public alternarGrupo(grupo: Grupo, marcado: boolean): void {
    this.usuarioModel.update((m) => ({
      ...m,
      grupos: marcado ? [...m.grupos.filter((g) => g !== grupo), grupo] : m.grupos.filter((g) => g !== grupo),
    }));
    this.usuarioForm.grupos().markAsTouched();
  }

  public submitForm(event: Event) {
    event.preventDefault();
    // submit() marca todo como "touched" y sólo ejecuta la acción si el formulario es válido
    submit(this.usuarioForm, async () => {
      this.guardarUsuario.emit(this.usuarioForm().value());
    });
  }
}
