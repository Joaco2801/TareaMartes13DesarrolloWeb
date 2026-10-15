import { Type } from "typebox";
import type { Static, TSchema } from "typebox";

export const ErrorSchema = Type.Object(
  {
    statusCode: Type.Integer(),
    code: Type.Optional(Type.String()),
    error: Type.Optional(Type.String()),
    message: Type.String(),
  },
  { description: "Error" },
);

/** Respuestas de error comunes, para documentarlas en Swagger. */
export const errores = (...codigos: (400 | 401 | 403 | 404 | 409)[]) =>
  Object.fromEntries(codigos.map((c) => [c, ErrorSchema]));

/** Enum de strings (se documenta como `enum` en OpenAPI, en vez de anyOf/const). */
export const StringEnum = <const T extends readonly string[]>(
  valores: T,
  opciones: Record<string, unknown> = {},
) =>
  Type.Unsafe<T[number]>({ type: "string", enum: [...valores], ...opciones });

/** Valor que puede ser null (OpenAPI 3.0 `nullable`). */
export const Nullable = <T extends TSchema>(schema: T) =>
  Type.Unsafe<Static<T> | null>({ ...schema, nullable: true });
