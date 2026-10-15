import { Type } from "typebox";
import type { Static } from "typebox";
import { StringEnum } from "./comunes.ts";

export const GrupoSchema = StringEnum(["user", "admin", "superadmin"], {
  description: "Grupo/rol del usuario",
  examples: ["user"],
});
export type Grupo = Static<typeof GrupoSchema>;

const GruposSchema = Type.Array(GrupoSchema, {
  minItems: 1,
  uniqueItems: true,
  description: "Grupos a los que pertenece (al menos uno)",
});

/** Usuario tal como se devuelve desde la API (nunca incluye credenciales). */
export const UsuarioSchema = Type.Object(
  {
    id_usuario: Type.Integer(),
    username: Type.String({ maxLength: 30 }),
    nombres: Type.String(),
    apellidos: Type.String(),
    fecha_nacimiento: Type.String({ format: "date", examples: ["1990-05-20"] }),
    nombre_completo: Type.String(),
    grupos: GruposSchema,
    activo: Type.Boolean(),
  },
  { title: "Usuario" },
);
export type Usuario = Static<typeof UsuarioSchema>;

export const CrearUsuarioSchema = Type.Object(
  {
    username: Type.String({
      minLength: 3,
      maxLength: 30,
      pattern: "^[A-Za-z0-9_.-]+$",
    }),
    password: Type.String({ minLength: 8, maxLength: 100 }),
    nombres: Type.String({ minLength: 1 }),
    apellidos: Type.String({ minLength: 1 }),
    fecha_nacimiento: Type.String({ format: "date" }),
    grupos: Type.Optional(GruposSchema),
  },
  { additionalProperties: false },
);
export type CrearUsuarioType = Static<typeof CrearUsuarioSchema>;

export const ActualizarUsuarioSchema = Type.Object(
  {
    nombres: Type.Optional(Type.String({ minLength: 1 })),
    apellidos: Type.Optional(Type.String({ minLength: 1 })),
    fecha_nacimiento: Type.Optional(Type.String({ format: "date" })),
    grupos: Type.Optional(GruposSchema),
    activo: Type.Optional(Type.Boolean()),
  },
  { additionalProperties: false },
);
export type ActualizarUsuarioType = Static<typeof ActualizarUsuarioSchema>;

export const IdUsuarioParamsSchema = Type.Object({
  id_usuario: Type.Integer({ minimum: 1 }),
});

export const LoginSchema = Type.Object(
  {
    username: Type.String({ minLength: 1 }),
    password: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false },
);
export type LoginType = Static<typeof LoginSchema>;

export const LoginRespuestaSchema = Type.Object({
  token: Type.String(),
  usuario: UsuarioSchema,
});
