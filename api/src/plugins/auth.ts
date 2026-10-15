import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import type { FastifyReply, FastifyRequest } from "fastify";
import { usuariosRepo } from "../repositories/usuarios.ts";
import {
  NotAuthorizedError,
  UnAuthenticatedError,
} from "../errors/response.errors.ts";
import type { Grupo, Usuario } from "../schemas/usuarios.ts";

export interface JwtPayload {
  id_usuario: number;
  username: string;
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}
declare module "fastify" {
  interface FastifyRequest {
    /** Usuario autenticado (cargado desde la BD en cada request). */
    usuario: Usuario;
  }
  interface FastifyInstance {
    autenticar: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requiereGrupo: (
      ...grupos: Grupo[]
    ) => (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(async (app) => {
  await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET ?? "dev-secret-cambiar",
    sign: { expiresIn: process.env.JWT_EXPIRES_IN ?? "8h" },
  });

  app.decorateRequest("usuario");

  app.decorate("autenticar", async (req: FastifyRequest) => {
    try {
      await req.jwtVerify();
    } catch {
      throw new UnAuthenticatedError("Token ausente o inválido.");
    }
    let usuario: Usuario;
    try {
      usuario = await usuariosRepo.obtenerPorId(req.user.id_usuario);
    } catch {
      throw new UnAuthenticatedError("El usuario ya no existe.");
    }
    if (!usuario.activo) throw new UnAuthenticatedError("Usuario inactivo.");
    req.usuario = usuario;
  });

  app.decorate("requiereGrupo", (...grupos: Grupo[]) => {
    return async (req: FastifyRequest) => {
      if (!req.usuario.grupos.some((g) => grupos.includes(g)))
        throw new NotAuthorizedError(
          `Se requiere pertenecer a: ${grupos.join(", ")}.`,
        );
    };
  });
});
