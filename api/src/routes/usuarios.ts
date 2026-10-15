import type { FastifyInstance } from "fastify";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "typebox";
import { usuariosRepo } from "../repositories/usuarios.ts";
import { NotAuthorizedError } from "../errors/response.errors.ts";
import {
  ActualizarUsuarioSchema,
  CrearUsuarioSchema,
  IdUsuarioParamsSchema,
  UsuarioSchema,
} from "../schemas/usuarios.ts";
import type { Grupo, Usuario } from "../schemas/usuarios.ts";
import { errores } from "../schemas/comunes.ts";

const esSuperadmin = (u: Usuario) => u.grupos.includes("superadmin");

/** Sólo un superadmin puede otorgar el grupo superadmin o tocar a otro superadmin. */
function validarJerarquia(
  actor: Usuario,
  objetivo?: Usuario,
  gruposNuevos?: Grupo[],
) {
  if (esSuperadmin(actor)) return;
  if (objetivo && esSuperadmin(objetivo))
    throw new NotAuthorizedError("Sólo un superadmin puede modificar a otro superadmin.");
  if (gruposNuevos?.includes("superadmin"))
    throw new NotAuthorizedError("Sólo un superadmin puede asignar el grupo superadmin.");
}

export default async function usuariosRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<TypeBoxTypeProvider>();
  const seguridad = [{ bearerAuth: [] }];
  const soloAdmins = [app.autenticar, app.requiereGrupo("admin", "superadmin")];

  r.get(
    "/",
    {
      onRequest: app.autenticar,
      schema: {
        tags: ["Usuarios"],
        summary: "Listar usuarios",
        security: seguridad,
        response: { 200: Type.Array(UsuarioSchema), ...errores(401) },
      },
    },
    async () => usuariosRepo.obtenerTodos(),
  );

  r.get(
    "/:id_usuario",
    {
      onRequest: app.autenticar,
      schema: {
        tags: ["Usuarios"],
        summary: "Obtener un usuario",
        security: seguridad,
        params: IdUsuarioParamsSchema,
        response: { 200: UsuarioSchema, ...errores(400, 401, 404) },
      },
    },
    async (req) => usuariosRepo.obtenerPorId(req.params.id_usuario),
  );

  r.post(
    "/",
    {
      onRequest: soloAdmins,
      schema: {
        tags: ["Usuarios"],
        summary: "Crear un usuario",
        description: "Requiere pertenecer al grupo `admin` o `superadmin`.",
        security: seguridad,
        body: CrearUsuarioSchema,
        response: { 201: UsuarioSchema, ...errores(400, 401, 403, 409) },
      },
    },
    async (req, reply) => {
      validarJerarquia(req.usuario, undefined, req.body.grupos);
      const creado = await usuariosRepo.crear(req.body);
      return reply.code(201).send(creado);
    },
  );

  for (const method of ["PUT", "PATCH"] as const) {
    r.route({
      method,
      url: "/:id_usuario",
      onRequest: soloAdmins,
      schema: {
        tags: ["Usuarios"],
        summary:
          method === "PUT"
            ? "Actualizar un usuario"
            : "Actualizar parcialmente un usuario",
        description:
          "Sólo se modifican los campos enviados. Requiere grupo `admin` o `superadmin`.",
        security: seguridad,
        params: IdUsuarioParamsSchema,
        body: ActualizarUsuarioSchema,
        response: { 200: UsuarioSchema, ...errores(400, 401, 403, 404) },
      },
      handler: async (req) => {
        const objetivo = await usuariosRepo.obtenerPorId(req.params.id_usuario);
        validarJerarquia(req.usuario, objetivo, req.body.grupos);
        return usuariosRepo.actualizar(req.params.id_usuario, req.body);
      },
    });
  }

  r.delete(
    "/:id_usuario",
    {
      onRequest: soloAdmins,
      schema: {
        tags: ["Usuarios"],
        summary: "Eliminar un usuario",
        description:
          "Elimina también sus credenciales y las tareas que creó. Requiere grupo `admin` o `superadmin`.",
        security: seguridad,
        params: IdUsuarioParamsSchema,
        response: { 204: Type.Null(), ...errores(400, 401, 403, 404) },
      },
    },
    async (req, reply) => {
      const objetivo = await usuariosRepo.obtenerPorId(req.params.id_usuario);
      validarJerarquia(req.usuario, objetivo);
      await usuariosRepo.eliminar(req.params.id_usuario);
      return reply.code(204).send(null);
    },
  );
}
