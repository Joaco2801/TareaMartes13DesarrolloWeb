import type { FastifyInstance } from "fastify";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { usuariosRepo } from "../repositories/usuarios.ts";
import { UnAuthenticatedError } from "../errors/response.errors.ts";
import {
  LoginRespuestaSchema,
  LoginSchema,
  UsuarioSchema,
} from "../schemas/usuarios.ts";
import { errores } from "../schemas/comunes.ts";

export default async function authRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<TypeBoxTypeProvider>();

  r.post(
    "/login",
    {
      schema: {
        tags: ["Autenticación"],
        summary: "Iniciar sesión",
        description:
          "Devuelve un token JWT (enviar luego como `Authorization: Bearer <token>`) y los datos del usuario.",
        body: LoginSchema,
        response: { 200: LoginRespuestaSchema, ...errores(400, 401) },
      },
    },
    async (req) => {
      const { username, password } = req.body;
      let usuario;
      try {
        usuario = await usuariosRepo.verificarCredenciales(username, password);
      } catch {
        throw new UnAuthenticatedError("Usuario o contraseña incorrectos.");
      }
      const token = app.jwt.sign({
        id_usuario: usuario.id_usuario,
        username: usuario.username,
      });
      return { token, usuario };
    },
  );

  r.get(
    "/me",
    {
      onRequest: app.autenticar,
      schema: {
        tags: ["Autenticación"],
        summary: "Datos del usuario autenticado",
        security: [{ bearerAuth: [] }],
        response: { 200: UsuarioSchema, ...errores(401) },
      },
    },
    async (req) => req.usuario,
  );
}
