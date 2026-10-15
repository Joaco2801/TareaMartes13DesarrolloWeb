import { Injectable, signal } from '@angular/core';
import type { Usuario, UsuarioDatos } from '../model/usuario';

/** Usuarios iniciales visibles en el frontend. */
const USUARIOS_INICIALES: Usuario[] = [
  { id_usuario: 3, username: 'user', nombres: 'Un', apellidos: 'User', fecha_nacimiento: '1993-07-22', nombre_completo: 'Un User', grupos: ['user'], activo: true },
  { id_usuario: 6, username: 'lfernandez', nombres: 'Lucas', apellidos: 'Fernández', fecha_nacimiento: '2010-01-30', nombre_completo: 'Lucas Fernández', grupos: ['user'], activo: true },
];

/**
 * "Base de datos" en memoria: el array de usuarios vive acá y las páginas lo
 * consultan/modifican a través de estos métodos.
 */
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly _usuarios = signal<Usuario[]>(USUARIOS_INICIALES);
  private siguienteId = Math.max(...USUARIOS_INICIALES.map((usuario) => usuario.id_usuario)) + 1;

  /** Lista reactiva (ordenada por id, como la API). */
  readonly usuarios = this._usuarios.asReadonly();

  obtenerTodos(): Usuario[] {
    return this._usuarios();
  }

  obtenerPorId(id: number): Usuario | undefined {
    return this._usuarios().find((u) => u.id_usuario === id);
  }

  /** @throws Error si el username ya existe (equivale al 409 de la API). */
  crear(datos: UsuarioDatos): Usuario {
    this.validarUsernameLibre(datos.username);
    const usuario: Usuario = {
      ...datos,
      id_usuario: this.siguienteId++,
      nombre_completo: `${datos.nombres} ${datos.apellidos}`,
    };
    this._usuarios.update((lista) => [...lista, usuario]);
    return usuario;
  }

  /** El username no se puede cambiar (igual que en la API). */
  actualizar(id: number, datos: Partial<UsuarioDatos>): Usuario {
    const actual = this.obtenerPorId(id);
    if (!actual) throw new Error('Usuario no encontrado.');
    const { username: _ignorado, ...editables } = datos;
    const actualizado: Usuario = { ...actual, ...editables };
    actualizado.nombre_completo = `${actualizado.nombres} ${actualizado.apellidos}`;
    this._usuarios.update((lista) => lista.map((u) => (u.id_usuario === id ? actualizado : u)));
    return actualizado;
  }

  eliminar(id: number): boolean {
    const existe = this.obtenerPorId(id) !== undefined;
    if (existe) this._usuarios.update((lista) => lista.filter((u) => u.id_usuario !== id));
    return existe;
  }

  private validarUsernameLibre(username: string): void {
    const existe = this._usuarios().some((u) => u.username.toLowerCase() === username.toLowerCase());
    if (existe) throw new Error(`Ya existe un usuario con el username "${username}".`);
  }
}
