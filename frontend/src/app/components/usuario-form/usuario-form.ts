import { Component, effect, inject, input, output } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { GRUPOS } from '../../models/usuario';
import type { Grupo, Usuario, UsuarioDatos } from '../../models/usuario';

const alMenosUnGrupo = (c: AbstractControl<Grupo[]>): ValidationErrors | null =>
  c.value.length > 0 ? null : { requerido: true };

/**
 * Formulario de usuario (alta y edición). Es "tonto": no conoce ningún servicio,
 * recibe el usuario por `usuario` y devuelve los datos por `guardar`.
 */
@Component({
  selector: 'app-usuario-form',
  imports: [ReactiveFormsModule],
  templateUrl: './usuario-form.html',
  styleUrl: './usuario-form.css',
})
export class UsuarioForm {
  /** Usuario a editar; `null` para crear uno nuevo. */
  readonly usuario = input<Usuario | null>(null);
  /** Mensaje de error a mostrar (p. ej. username repetido). */
  readonly error = input<string | null>(null);

  readonly guardar = output<UsuarioDatos>();
  readonly cancelar = output<void>();

  protected readonly grupos = GRUPOS;

  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30), Validators.pattern(/^[A-Za-z0-9_.-]+$/)]],
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    fecha_nacimiento: ['', Validators.required],
    grupos: this.fb.control<Grupo[]>(['user'], alMenosUnGrupo),
    activo: [true],
  });

  constructor() {
    effect(() => {
      const u = this.usuario();
      if (u) {
        this.form.reset({
          username: u.username,
          nombres: u.nombres,
          apellidos: u.apellidos,
          fecha_nacimiento: u.fecha_nacimiento,
          grupos: [...u.grupos],
          activo: u.activo,
        });
        this.form.controls.username.disable(); // el username no se puede cambiar
      }
    });
  }

  protected get editando(): boolean {
    return this.usuario() !== null;
  }

  protected tieneGrupo(g: Grupo): boolean {
    return this.form.controls.grupos.value.includes(g);
  }

  protected alternarGrupo(g: Grupo, marcado: boolean): void {
    const control = this.form.controls.grupos;
    const actuales = control.value.filter((x) => x !== g);
    control.setValue(marcado ? [...actuales, g] : actuales);
    control.markAsTouched();
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardar.emit(this.form.getRawValue());
  }

  protected invalido(nombre: 'username' | 'nombres' | 'apellidos' | 'fecha_nacimiento' | 'grupos'): boolean {
    const c = this.form.controls[nombre];
    return c.invalid && (c.touched || c.dirty);
  }
}
