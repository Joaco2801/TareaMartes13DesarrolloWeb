import { buildApp } from "./app.ts";

const app = await buildApp();
const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

try {
  await app.listen({ port, host });
  app.log.info(`Swagger en http://localhost:${port}/docs`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
