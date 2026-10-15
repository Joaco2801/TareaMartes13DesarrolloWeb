import type { FastifyInstance } from "fastify";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "typebox";
import { tareasRepo } from "../repositories/tareas.ts";
import { NotAuthorizedError } from "../errors/response.errors.ts";
import {
  ActualizarTareaSchema,
  CrearTareaSchema,
  FinalizarTareaSchema,
  IdTareaParamsSchema,
  TareaSchema,
} from "../schemas/tareas.ts";
import type { Tarea } from "../schemas/tareas.ts";
import type { Grupo, Usuario } from "../schemas/usuarios.ts";
import { errores } from "../schemas/comunes.ts";

/** Un usuario ve las tareas de sus grupos y las que creó; el superadmin ve todas. */
const puedeVer = (u: Usuario, t: Tarea) =>
  u.grupos.includes("superadmin") ||
  u.grupos.includes(t.grupo) ||
  t.id_creador === u.id_usuario;

const puedeUsarGrupo = (u: Usuario, g: Grupo) =>
  u.grupos.includes("superadmin") || u.grupos.includes(g);

async function obtenerAccesible(u: Usuario, id: number) {
  const tarea = await tareasRepo.obtenerPorId(id);
  if (!puedeVer(u, tarea))
    throw new NotAuthorizedError("No tenés acceso a esta tarea.");
  return tarea;
}

export default async function tareasRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<TypeBoxTypeProvider>();
  const seguridad = [{ bearerAuth: [] }];
  r.addHook("onRequest", app.autenticar);

  r.get(
    "/",
    {
      schema: {
        tags: ["Tareas"],
        summary: "Listar tareas",
        description:
          "Devuelve las tareas de los grupos del usuario autenticado (el superadmin ve todas), de la más nueva a la más vieja.",
        security: seguridad,
        response: { 200: Type.Array(TareaSchema), ...errores(401) },
      },
    },
    async (req) => {
      const todas = await tareasRepo.obtenerTodas();
      return todas.filter((t) => puedeVer(req.usuario, t));
    },
  );

  r.get(
    "/:id_tarea",
    {
      schema: {
        tags: ["Tareas"],
        summary: "Obtener una tarea",
        security: seguridad,
        params: IdTareaParamsSchema,
        response: { 200: TareaSchema, ...errores(400, 401, 403, 404) },
      },
    },
    async (req) => obtenerAccesible(req.usuario, req.params.id_tarea),
  );

  r.post(
    "/",
    {
      schema: {
        tags: ["Tareas"],
        summary: "Crear una tarea",
        description:
          "El creador es el usuario autenticado. Sólo se puede crear en grupos propios (el superadmin en cualquiera).",
        security: seguridad,
        body: CrearTareaSchema,
        response: { 201: TareaSchema, ...errores(400, 401, 403) },
      },
    },
    async (req, reply) => {
      if (!puedeUsarGrupo(req.usuario, req.body.grupo))
        throw new NotAuthorizedError("No pertenecés al grupo indicado.");
      const creada = await tareasRepo.crear(req.usuario.id_usuario, req.body);
      return reply.code(201).send(creada);
    },
  );

  for (const method of ["PUT", "PATCH"] as const) {
    r.route({
      method,
      url: "/:id_tarea",
      schema: {
        tags: ["Tareas"],
        summary:
          method === "PUT" ? "Actualizar una tarea" : "Actualizar parcialmente una tarea",
        description: "Sólo se modifican los campos enviados.",
        security: seguridad,
        params: IdTareaParamsSchema,
        body: ActualizarTareaSchema,
        response: { 200: TareaSchema, ...errores(400, 401, 403, 404) },
      },
      handler: async (req) => {
        await obtenerAccesible(req.usuario, req.params.id_tarea);
        if (req.body.grupo && !puedeUsarGrupo(req.usuario, req.body.grupo))
          throw new NotAuthorizedError("No pertenecés al grupo indicado.");
        return tareasRepo.actualizar(req.params.id_tarea, req.body);
      },
    });
  }

  r.post(
    "/:id_tarea/finalizar",
    {
      // el body es opcional: sin body se toma {}
      preValidation: async (req) => {
        req.body ??= {};
      },
      schema: {
        tags: ["Tareas"],
        summary: "Finalizar una tarea",
        description:
          "Marca la tarea como cerrada (estado `Cerrada`). Si ya estaba cerrada no cambia la fecha.",
        security: seguridad,
        params: IdTareaParamsSchema,
        body: FinalizarTareaSchema,
        response: { 200: TareaSchema, ...errores(400, 401, 403, 404) },
      },
    },
    async (req) => {
      await obtenerAccesible(req.usuario, req.params.id_tarea);
      return tareasRepo.finalizar(req.params.id_tarea, req.body.fecha);
    },
  );

  r.delete(
    "/:id_tarea",
    {
      schema: {
        tags: ["Tareas"],
        summary: "Eliminar una tarea",
        security: seguridad,
        params: IdTareaParamsSchema,
        response: { 204: Type.Null(), ...errores(400, 401, 403, 404) },
      },
    },
    async (req, reply) => {
      await obtenerAccesible(req.usuario, req.params.id_tarea);
      await tareasRepo.eliminar(req.params.id_tarea);
      return reply.code(204).send(null);
    },
  );
}
