import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  //EAGER LOADING:
  { path: 'home', title: 'Home', component: HomePage },

  //LAZY LOADING:
  {
    path: 'usuarios',
    title: 'Usuarios',
    loadComponent: () => import('./pages/usuarios/listar-usuarios/listar-usuarios.page'),
  },
  // OJO: 'usuarios/crear' va antes que 'usuarios/:id_usuario' para que "crear" no se tome como un id
  {
    path: 'usuarios/crear',
    title: 'Crear usuario',
    loadComponent: () => import('./pages/usuarios/crear-usuario/crear-usuario.page'),
  },
  {
    path: 'usuarios/:id_usuario',
    title: 'Editar usuario',
    loadComponent: () => import('./pages/usuarios/editar-usuario/editar-usuario.page'),
  },
  {
    //LAZY LOADING de otro archivo de rutas dentro de /tareas
    path: 'tareas',
    loadChildren: () => import('./tareas.routes'),
  },

  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.page'),
  },
];
