import type { Grupo } from './usuario';

export type Prioridad = '0:baja' | '1:media' | '2:alta';

export const PRIORIDADES: readonly { valor: Prioridad; etiqueta: string }[] = [
  { valor: '0:baja', etiqueta: 'Baja' },
  { valor: '1:media', etiqueta: 'Media' },
  { valor: '2:alta', etiqueta: 'Alta' },
];

/** Mismos campos que devuelve la API (`GET /api/tareas`). */
export interface Tarea {
  id_tarea: number;
  id_creador: number;
  grupo: Grupo;
  titulo: string;
  descripcion: string | null;
  prioridad: Prioridad;
  /** ISO 8601 */
  creada: string;
  /** ISO 8601 o null mientras esté abierta */
  terminada: string | null;
  estado: 'Abierta' | 'Cerrada';
}

/** Datos editables de una tarea (lo que envía el formulario). */
export type TareaDatos = Pick<Tarea, 'grupo' | 'titulo' | 'descripcion' | 'prioridad'>;
