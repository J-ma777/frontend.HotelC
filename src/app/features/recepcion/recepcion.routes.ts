import { Routes } from '@angular/router';

export const RECEPCION_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'reservas',
    pathMatch: 'full'
  },

  {
    path: 'tipos-habitacion',
    loadComponent: () =>
      import('./tipos-habitacion/pages/tipos-habitacion/tipos-habitacion.page')
        .then(m => m.TiposHabitacionPage)
  },

  {
    path: 'reservas',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./reservas/pages/reservas/reservas.component')
            .then(m => m.ReservasComponent)
      },
      {
        path: 'nueva',
        loadComponent: () =>
          import('./reservas/pages/nueva-reserva/nueva-reserva.component')
            .then(m => m.NuevaReservaComponent)
      },
      {
        path: 'habitaciones',
        loadComponent: () =>
          import('./habitaciones/pages/habitaciones/habitaciones.component')
            .then(m => m.HabitacionesComponent)
      }
    ]
  },

  {
    path: 'plan-tarifario',
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