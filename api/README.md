# API de Usuarios y Tareas (Fastify + PostgreSQL)

API RESTful con documentación Swagger/OpenAPI y autenticación JWT.

## Puesta en marcha

```bash
cp .env.example .env     # ya incluido; ajustar si hace falta
npm install
npm run db:up            # docker compose: levanta PostgreSQL y ejecuta db/00.sql
npm start                # http://localhost:3000
```

* Swagger UI: <http://localhost:3000/docs> (JSON: `/docs/json`)
* Requiere Node 22.18+ (ejecuta TypeScript directamente, sin compilar).
* `npm run typecheck` valida los tipos con `tsc`.

`docker-compose.yaml` monta `./db` en `/docker-entrypoint-initdb.d`, por lo que `db/00.sql`
crea las tablas y los datos de ejemplo la primera vez que arranca el contenedor
(para reiniciar la base: `npm run db:down` y borrar el volumen/datos del contenedor).

## Autenticación

`POST /api/auth/login` → `{ token, usuario }`. Enviar luego `Authorization: Bearer <token>`.
Usuarios de prueba (contraseña `Contraseña1`): `superadmin`, `admin`, `user`, `mgonzalez`, `srodriguez`, `lfernandez`.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Datos del usuario autenticado |
| GET / POST | `/api/usuarios` | Listar / crear (crear: admin o superadmin) |
| GET / PUT / PATCH / DELETE | `/api/usuarios/:id_usuario` | Obtener / actualizar / eliminar (escritura: admin o superadmin) |
| GET / POST | `/api/tareas` | Listar / crear |
| GET / PUT / PATCH / DELETE | `/api/tareas/:id_tarea` | Obtener / actualizar / eliminar |
| POST | `/api/tareas/:id_tarea/finalizar` | Cerrar una tarea (`fecha` opcional) |

Reglas de acceso:

* Un `admin` no puede crear, modificar ni borrar superadmins ni otorgar ese grupo.
* Cada usuario ve las tareas de sus grupos y las que creó (el `superadmin` ve todas), y sólo puede crear/mover tareas a grupos propios.

## Estructura

```
db/00.sql                      esquema y datos (provisto)
src/db/                        pool de pg + parsers de fechas
src/errors/response.errors.ts  errores HTTP (provisto)
src/repositories/              acceso a datos (provisto)
src/schemas/                   esquemas TypeBox (validación + Swagger)
src/plugins/auth.ts            JWT + decoradores de autenticación/autorización
src/routes/                    auth, usuarios, tareas
```

Cambios sobre los repositorios provistos: `TareasRepository.finalizar` ahora pasa los parámetros
correctos a la consulta (antes fallaba al finalizar sin fecha).
