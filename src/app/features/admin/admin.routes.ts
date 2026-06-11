import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const ADMIN_ROUTES: Routes = [
    {
        path: '',
        component: DashboardComponent
    },
    {
        path: 'usuarios',
        loadComponent: () =>
            import('./usuarios/pages/lista-usuarios/lista-usuarios.component')
                .then(m => m.ListaUsuariosComponent)
    },
    {
        path: 'usuarios/nuevo',
        loadComponent: () =>
            import('./usuarios/pages/nuevo-usuario/nuevo-usuario.component')
                .then(m => m.NuevoUsuarioComponent)
    },
    {
        path: 'roles',
        loadComponent: () =>
            import('./usuarios/pages/lista-roles/lista-roles.component')
                .then(m => m.ListaRolesComponent)
    }
];