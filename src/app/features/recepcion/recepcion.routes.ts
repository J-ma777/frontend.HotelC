import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { permissionGuard } from '../../core/guards/permission.guard';

export const RECEPCION_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'reservas',
    pathMatch: 'full'
  },

  {
    path: 'tipos-habitacion',
    canActivate: [authGuard, permissionGuard],
    data: {
      permissions: ['TIPO_HABITACION_VER']
    },
    loadComponent: () =>
      import('./tipos-habitacion/pages/tipos-habitacion/tipos-habitacion.page')
        .then(m => m.TiposHabitacionPage)
  },

  {
    path: 'reservas',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        canActivate: [permissionGuard],
        data: { permissions: ['RESERVA_VER'] },
        loadComponent: () =>
          import('./reservas/pages/reservas/reservas.component')
            .then(m => m.ReservasComponent)
      },
      {
        path: 'nueva',
        canActivate: [permissionGuard],
        data: { permissions: ['RESERVA_CREAR'] },
        loadComponent: () =>
          import('./reservas/pages/nueva-reserva/nueva-reserva.component')
            .then(m => m.NuevaReservaComponent)
      },
      {
        path: 'habitaciones',
        canActivate: [permissionGuard],
        data: { permissions: ['HABITACION_VER'] },
        loadComponent: () =>
          import('./habitaciones/pages/habitaciones/habitaciones.component')
            .then(m => m.HabitacionesComponent)
      }
    ]
  },

  {
    path: 'plan-tarifario',
    canActivate: [authGuard, permissionGuard],
    data: {
      permissions: ['PLAN_TARIFARIO_VER']
    },
    loadComponent: () =>
      import('./plan-tarifario/pages/plan-tarifario/plan-tarifario.component')
        .then(m => m.PlanTarifarioComponent)
  },

  {
    path: 'mapa',
    redirectTo: 'reservas',
    pathMatch: 'full'
  },
  {
    path: 'checkin',
    redirectTo: 'reservas',
    pathMatch: 'full'
  },
  {
    path: 'checkout',
    redirectTo: 'reservas',
    pathMatch: 'full'
  }
];