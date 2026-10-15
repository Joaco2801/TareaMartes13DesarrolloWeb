import pg from "pg";

// DATE -> "YYYY-MM-DD" (sin conversión a Date, evita corrimientos por zona horaria)
pg.types.setTypeParser(pg.types.builtins.DATE, (v: string) => v);
// TIMESTAMPTZ -> ISO 8601 (UTC)
pg.types.setTypeParser(pg.types.builtins.TIMESTAMPTZ, (v: string) =>
  new Date(v).toISOString(),
);
