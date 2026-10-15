import { Type } from "typebox";
import type { Static } from "typebox";
import { GrupoSchema } from "./usuarios.ts";
import { Nullable, StringEnum } from "./comunes.ts";

export const PrioridadSchema = StringEnum(["0:baja", "1:media", "2:alta"], {
  examples: ["1:media"],
});

export const TareaSchema = Type.Object(
  {
    id_tarea: Type.Integer(),
    id_creador: Type.Integer(),
    grupo: GrupoSchema,
    titulo: Type.String({ maxLength: 100 }),
    descripcion: Nullable(Type.String()),
    prioridad: PrioridadSchema,
    creada: Type.String({ format: "date-time" }),
    terminada: Nullable(Type.String({ format: "date-time" })),
    estado: StringEnum(["Abierta", "Cerrada"]),
  },
  { title: "Tarea" },
);
export type Tarea = Static<typeof TareaSchema>;

export const CrearTareaSchema = Type.Object(
  {
    grupo: GrupoSchema,
    titulo: Type.String({ minLength: 1, maxLength: 100 }),
    descripcion: Type.Optional(Nullable(Type.String())),
    prioridad: Type.Optional(PrioridadSchema),
  },
  { additionalProperties: false },
);
export type CrearTareaType = Static<typeof CrearTareaSchema>;

export const ActualizarTareaSchema = Type.Object(
  {
    grupo: Type.Optional(GrupoSchema),
    titulo: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
    descripcion: Type.Optional(Nullable(Type.String())),
    prioridad: Type.Optional(PrioridadSchema),
  },
  { additionalProperties: false },
);
export type ActualizarTareaType = Static<typeof ActualizarTareaSchema>;

export const FinalizarTareaSchema = Type.Object(
  {
    fecha: Type.Optional(
      Type.String({
        format: "date-time",
        description: "Fecha de cierre; por defecto, el momento actual",
      }),
    ),
  },
  { additionalProperties: false },
);
export type FinalizarTareaType = Static<typeof FinalizarTareaSchema>;

export const IdTareaParamsSchema = Type.Object({
  id_tarea: Type.Integer({ minimum: 1 }),
});
