import { Routes } from '@angular/router';

export const RECEPCION_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'reservas',
    pathMatch: 'full'
  },

  {
    path: 'reservas',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/reservas/reservas.component')
            .then(m => m.ReservasComponent)
      },
      {
        path: 'nueva',
        loadComponent: () =>
          import('./pages/reservas/nueva-reserva.component')
            .then(m => m.NuevaReservaComponent)
      }
    ]
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