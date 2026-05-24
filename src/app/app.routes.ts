import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
      }
    ]
  },
  {
    path: 'recepcion',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/recepcion/recepcion.routes').then(m => m.RECEPCION_ROUTES)
      }
    ]
  },
  {
    path: 'housekeeping',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/mantenimiento/limpieza/pages/limpieza.page').then(m => m.LimpiezaPage)
      }
    ]
  },
  {
    path: 'mantenimiento',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'tickets',
        loadComponent: () =>
          import('./features/mantenimiento/tickets/pages/tickets.page').then(m => m.TicketsPage)
      }
    ]
  }
];
