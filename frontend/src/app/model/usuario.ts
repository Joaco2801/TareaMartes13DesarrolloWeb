export type Grupo = 'user' | 'admin' | 'superadmin';

export const GRUPOS: readonly Grupo[] = ['user', 'admin', 'superadmin'];

/** Mismos campos que devuelve la API (`GET /api/usuarios`). */
export interface Usuario {
  id_usuario: number;
  username: string;
  nombres: string;
  apellidos: string;
  /** Formato YYYY-MM-DD */
  fecha_nacimiento: string;
  nombre_completo: string;
  grupos: Grupo[];
  activo: boolean;
}

/** Datos editables de un usuario (lo que envía el formulario). */
export type UsuarioDatos = Omit<Usuario, 'id_usuario' | 'nombre_completo'>;
