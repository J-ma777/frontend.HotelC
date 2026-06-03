import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const permissionGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredPermissions = route.data?.['permissions'] as string[];

  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  const hasPermission = requiredPermissions.some(permiso =>
    authService.hasPermission(permiso)
  );

  if (!hasPermission) {
    // Si no tiene permisos, lo redirigimos a un lugar seguro como recepcion/reservas o /auth
    return router.parseUrl('/recepcion/reservas');
  }

  return true;
};