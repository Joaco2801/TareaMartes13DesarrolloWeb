import Fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import "./db/types.ts";
import auth from "./plugins/auth.ts";
import authRoutes from "./routes/auth.ts";
import usuariosRoutes from "./routes/usuarios.ts";
import tareasRoutes from "./routes/tareas.ts";
import { transformarErrorPostgres } from "./errors/response.errors.ts";
import type { PostgresError } from "./errors/response.errors.ts";

export async function buildApp() {
  const app = Fastify({ logger: process.env.NODE_ENV !== "test" });

  await app.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  await app.register(swagger, {
    openapi: {
      openapi: "3.0.3",
      info: {
        title: "API de Usuarios y Tareas",
        description:
          "API RESTful (Fastify + PostgreSQL) con autenticación JWT.\n\n" +
          "Usuarios de prueba (contraseña `Contraseña1`): `superadmin`, `admin`, `user`, `mgonzalez`, `srodriguez`, `lfernandez`.\n\n" +
          "Usá **Authorize** e ingresá el token devuelto por `POST /api/auth/login`.",
        version: "1.0.0",
      },
      tags: [
        { name: "Autenticación" },
        { name: "Usuarios" },
        { name: "Tareas" },
      ],
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        },
      },
    },
  });
  await app.register(swaggerUi, { routePrefix: "/docs" });

  await app.register(auth);

  app.setErrorHandler((error: any, req, reply) => {
    let err = error;
    if (error.validation) {
      reply.code(400).send({
        statusCode: 400,
        code: "VALIDATION",
        error: "Bad Request",
        message: error.message,
      });
      return;
    }
    // Errores del driver de PostgreSQL: código SQLSTATE de 5 caracteres
    if (typeof error.code === "string" && /^[0-9A-Z]{5}$/.test(error.code)) {
      req.log.error(error);
      err = transformarErrorPostgres(error as PostgresError);
    }
    const statusCode = err.statusCode ?? 500;
    if (statusCode >= 500) req.log.error(error);
    reply.code(statusCode).send({
      statusCode,
      code: err.code,
      error: err.name,
      message: statusCode >= 500 ? "Error interno." : err.message,
    });
  });

  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(usuariosRoutes, { prefix: "/api/usuarios" });
  await app.register(tareasRoutes, { prefix: "/api/tareas" });

  app.get("/", { schema: { hide: true } }, async (_req, reply) =>
    reply.redirect("/docs"),
  );

  return app;
}
