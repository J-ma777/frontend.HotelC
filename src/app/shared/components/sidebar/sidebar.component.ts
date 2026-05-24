import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  ruta: string;
  permisos: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  nombreUsuario = '';
  menuVisible: MenuItem[] = [];

  readonly menuItems: MenuItem[] = [
    {
      label: 'DASHBOARD',
      icon: 'home',
      ruta: '/admin',
      permisos: ['USUARIO_VER']
    },
    {
      label: 'USUARIOS',
      icon: 'users',
      ruta: '/admin/usuarios',
      permisos: ['USUARIO_VER']
    },
    {
      label: 'MAPA',
      icon: 'map',
      ruta: '/recepcion/mapa',
      permisos: ['RESERVA_VER']
    },
    {
      label: 'RESERVAS',
      icon: 'calendar',
      ruta: '/recepcion/reservas',
      permisos: ['RESERVA_VER']
    },
    {
      label: 'TIPOS DE HABITACIÓN',
      icon: 'tag',
      ruta: '/recepcion/tipos-habitacion',
      permisos: ['HABITACION_VER']
    },
    {
      label: 'HABITACIONES',
      icon: 'door',
      ruta: '/recepcion/reservas/habitaciones',
      permisos: ['HABITACION_VER']
    },
    {
      label: 'CHECK-IN',
      icon: 'check',
      ruta: '/recepcion/checkin',
      permisos: ['RESERVA_CHECKIN']
    },
    {
      label: 'CHECK-OUT',
      icon: 'logout',
      ruta: '/recepcion/checkout',
      permisos: ['RESERVA_CHECKOUT']
    },
    {
      label: 'PLANES TARIFARIOS',
      icon: 'money',
      ruta: '/recepcion/plan-tarifario',
      permisos: ['TARIFAS_VER']
    },
    {
      label: 'LIMPIEZA',
      icon: 'sparkles',
      ruta: '/housekeeping',
      permisos: ['VER_LIMPIEZAS']
    },
    {
      label: 'TICKETS DE MANT.',
      icon: 'wrench',
      ruta: '/mantenimiento/tickets',
      permisos: ['VER_LIMPIEZAS', 'USUARIO_VER']
    },
    {
      label: 'INVENTARIO',
      icon: 'cube',
      ruta: '/almacen',
      permisos: ['INVENTARIO_VER', 'INVENTARIO_GESTIONAR']
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const user = this.authService.getUser();

    if (!user) {
      this.router.navigate(['/auth']);
      return;
    }

    this.nombreUsuario = user.username;

    this.menuVisible = this.menuItems.filter(item =>
      item.permisos.some(p => this.authService.hasPermission(p))
    );
  }

  cerrarSesion(): void {
    this.authService.clearSession();
    this.router.navigate(['/auth']);
  }
}