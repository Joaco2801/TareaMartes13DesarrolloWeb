import { Injectable, signal } from '@angular/core';
import type { Tarea, TareaDatos } from '../model/tarea';

/** Usuario ficticio que figura como creador de las tareas nuevas (el superadmin). */
export const ID_CREADOR_ACTUAL = 1;

/** Tareas de ejemplo tomadas del proyecto de referencia, con fechas fijas. */
const tarea = (
  id_tarea: number,
  id_creador: number,
  grupo: Tarea['grupo'],
  titulo: string,
  descripcion: string,
  prioridad: Tarea['prioridad'],
  creada: string,
  terminada: string | null,
): Tarea => ({
  id_tarea,
  id_creador,
  grupo,
  titulo,
  descripcion,
  prioridad,
  creada,
  terminada,
  estado: terminada ? 'Cerrada' : 'Abierta',
});

const TAREAS_INICIALES: Tarea[] = [
  tarea(1, 1, 'admin', 'Organizar Semana UCU', 'Lucas Chiappini debe colaborar con la organización de la Semana UCU, coordinando actividades y ayudando con la logística de los eventos.', '2:alta', '2026-09-25T00:00:00Z', null),
  tarea(2, 2, 'user', 'Completar Reto 1', 'Felipe Castillo debe completar el Reto 1 de la asignatura, resolver las consignas propuestas y entregar el trabajo en la fecha establecida.', '0:baja', '2026-10-04T00:00:00Z', '2026-10-05T00:00:00Z'),
  tarea(3, 3, 'superadmin', 'Cubrir horas de beca', 'Ernesto Diaz debe cumplir con las horas correspondientes a su beca en la UCU y registrar las actividades realizadas.', '2:alta', '2026-10-08T00:00:00Z', null),
  tarea(4, 1, 'user', 'Preparar entrega de programación', 'Lucas Chiappini debe revisar el proyecto de Angular, verificar el funcionamiento de los componentes y preparar la entrega para la asignatura.', '2:alta', '2026-10-04T00:00:00Z', '2026-10-10T00:00:00Z'),
];

const ordenar = (lista: Tarea[]): Tarea[] =>
  [...lista].sort((a, b) => b.creada.localeCompare(a.creada));

/**
 * "Base de datos" en memoria: el array de tareas vive acá y las páginas lo
 * consultan/modifican a través de estos métodos.
 */
@Injectable({ providedIn: 'root' })
export class TareaService {
  private readonly _tareas = signal<Tarea[]>(ordenar(TAREAS_INICIALES));
  private siguienteId = TAREAS_INICIALES.length + 1;

  /** Lista reactiva, de la más nueva a la más vieja (como la API). */
  readonly tareas = this._tareas.asReadonly();

  obtenerTodas(): Tarea[] {
    return this._tareas();
  }

  obtenerPorId(id: number): Tarea | undefined {
    return this._tareas().find((t) => t.id_tarea === id);
  }

  crear(datos: TareaDatos, idCreador = ID_CREADOR_ACTUAL): Tarea {
    const nueva: Tarea = {
      ...datos,
      id_tarea: this.siguienteId++,
      id_creador: idCreador,
      creada: new Date().toISOString(),
      terminada: null,
      estado: 'Abierta',
    };
    this._tareas.update((lista) => ordenar([...lista, nueva]));
    return nueva;
  }

  actualizar(id: number, datos: Partial<TareaDatos>): Tarea {
    const actual = this.obtenerPorId(id);
    if (!actual) throw new Error('Tarea no encontrada.');
    const actualizada: Tarea = { ...actual, ...datos };
    this._tareas.update((lista) => lista.map((t) => (t.id_tarea === id ? actualizada : t)));
    return actualizada;
  }

  eliminar(id: number): boolean {
    const existe = this.obtenerPorId(id) !== undefined;
    if (existe) this._tareas.update((lista) => lista.filter((t) => t.id_tarea !== id));
    return existe;
  }
}
