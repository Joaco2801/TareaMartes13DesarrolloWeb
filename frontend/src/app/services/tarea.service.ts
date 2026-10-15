import { Injectable, signal } from '@angular/core';
import type { Tarea, TareaDatos } from '../model/tarea';

/** Usuario ficticio que figura como creador de las tareas nuevas (el superadmin). */
export const ID_CREADOR_ACTUAL = 1;

/** Mismos datos de ejemplo que `api/db/00.sql` (con fechas fijas para que sean estables). */
const tarea = (
  id_tarea: number,
  grupo: Tarea['grupo'],
  titulo: string,
  descripcion: string,
  prioridad: Tarea['prioridad'],
  creada: string,
  terminada: string | null,
): Tarea => ({
  id_tarea,
  id_creador: 1,
  grupo,
  titulo,
  descripcion,
  prioridad,
  creada,
  terminada,
  estado: terminada ? 'Cerrada' : 'Abierta',
});

const TAREAS_INICIALES: Tarea[] = [
  tarea(1, 'superadmin', 'Promover a usuario jperez a rol admin', 'Aprobar la solicitud de permisos elevados tras auditoría de seguridad.', '2:alta', '2026-10-12T12:00:00Z', null),
  tarea(2, 'superadmin', 'Depurar logs de auditoría del sistema', 'Realizar purga de registros antiguos mayores a 90 días en la base de datos.', '1:media', '2026-10-09T12:00:00Z', '2026-10-13T12:00:00Z'),
  tarea(3, 'superadmin', 'Renovar llaves maestras de cifrado JWT', 'Rotación anual de secretos para tokens de autenticación.', '2:alta', '2026-10-13T12:00:00Z', null),
  tarea(4, 'superadmin', 'Crear cuenta de administrador para auditoría externa', 'Dar de alta al usuario temporal audit_ext con rol admin.', '0:baja', '2026-10-11T12:00:00Z', '2026-10-12T12:00:00Z'),
  tarea(5, 'admin', 'Revisar reportes de usuarios bloqueados', 'Verificar intentos fallidos de inicio de sesión de la última semana.', '1:media', '2026-10-14T00:00:00Z', null),
  tarea(6, 'admin', 'Actualizar documentación de la API', 'Sincronizar la especificación Swagger con las rutas de Fastify recientemente agregadas.', '0:baja', '2026-10-11T12:00:00Z', null),
  tarea(7, 'admin', 'Monitorear uso de recursos del servidor', 'Evaluar consumo de CPU y memoria tras el último despliegue.', '2:alta', '2026-10-13T12:00:00Z', '2026-10-14T10:00:00Z'),
  tarea(8, 'admin', 'Mantenimiento programado de base de datos', 'Ejecutar VACUUM ANALYZE durante la ventana de bajo tráfico.', '1:media', '2026-10-10T12:00:00Z', null),
  tarea(9, 'user', 'Verificar configuración del repositorio', 'Verificar Verificar que el proyecto levanta y funciona sin problemas de configuraciòn.', '0:baja', '2026-10-04T12:00:00Z', '2026-10-05T12:00:00Z'),
  tarea(10, 'user', 'Seleccionar método de pago', 'Seleccionar y fundamente el método de pago a usar en el proyecto.', '2:alta', '2026-10-14T06:00:00Z', null),
  tarea(11, 'user', 'Tests', 'Revisar que están funcionando los tests unitarios.', '1:media', '2026-10-12T12:00:00Z', null),
  tarea(12, 'user', 'Tests', 'Revisar los tests de integración.', '0:baja', '2026-10-13T12:00:00Z', '2026-10-14T08:00:00Z'),
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
