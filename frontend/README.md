# Frontend Angular — Usuarios y Tareas

Proyecto Angular (CSS, **sin SSR**, estructura del curso "Angular - Bases"). No se conecta a la API:
`UsuarioService` y `TareaService` guardan arrays en memoria; las tareas iniciales siguen el proyecto de referencia.

```bash
npm install        # si falla por peer dependencies: npm install --legacy-peer-deps
npm start          # http://localhost:4200
```

> El CLI de Angular 22 requiere Node ≥ 22.22.3 (o 24.15+).

## Rutas (`app.routes.ts` y `tareas.routes.ts`)

| Ruta | Page | Carga |
|---|---|---|
| `/` | redirige a `/home` | |
| `/home` | `HomePage` | eager |
| `/usuarios` | `ListarUsuariosPage` (tabla, botones Editar / Borrar) | lazy |
| `/usuarios/crear` | `CrearUsuarioPage` → `UsuarioForm` | lazy |
| `/usuarios/:id_usuario` | `EditarUsuarioPage` → `UsuarioForm` | lazy |
| `/tareas` | `TareasListarPage` (tarjetas `TareaCard`) | lazy (`loadChildren`) |
| `/tareas/crear` | `TareasCrearPage` → `TareaCard` en modo `editar` | lazy |
| `/tareas/:id_tarea` | `TareasEditarPage` → `TareaCard` en modo `editar` | lazy |
| `**` | `NotFoundPage` (dentro de `/tareas`, `**` redirige a `/tareas`) | lazy |

Un id inexistente (`/usuarios/frutilla`, `/tareas/frutilla`) vuelve al listado.

## Estructura

```
src/app/
  app.ts / app.html / app.css   layout: header, sidebar (routerLink), router-outlet, footer
  model/                        interfaces Usuario y Tarea
  services/                     usuario.service.ts, tarea.service.ts (array en memoria)
  components/usuario/           usuario.form.*  (Signal Forms: form() + [formField], output guardarUsuario)
  components/tarea/             tarea.card.*    (modo ver / editar, output guardarTarea)
  pages/                        *.page.ts (export default)
```

Sólo las pages llaman a los servicios; `UsuarioForm` y `TareaCard` se comunican con `input()` / `output()`.
Los datos viven en memoria: al recargar el navegador vuelven al estado inicial.
