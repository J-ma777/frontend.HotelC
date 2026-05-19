import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservaService, Reserva } from '../../../../core/services/reserva.service';
import { AuthService } from '../../../../core/services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reservas.component.html',
  styleUrls: ['./reservas.component.css']
})
export class ReservasComponent implements OnInit {

  private reservaService = inject(ReservaService);
  private authService = inject(AuthService);

  reservas: Reserva[] = [];
  permisos: string[] = [];
  loading = false;
  error: string | null = null;


  tienePermiso(permiso: string): boolean {
    return this.permisos.includes(permiso);
  }

  ngOnInit(): void {
    this.permisos = this.authService.getPermisos();
    console.log('[ReservasComponent] permisos cargados:', this.permisos);
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.loading = true;
    this.error = null;
    console.log('🔄 [ReservasComponent] Iniciando carga de reservas...');
    
    this.reservaService.getReservas().subscribe({
      next: (data) => {
        console.log('✅ [ReservasComponent] Reservas cargadas:', data);
        console.log('📊 Total de reservas:', data?.length || 0);
        this.reservas = data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ [ReservasComponent] Error al cargar reservas:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        this.error = 'Error al cargar reservas: ' + (err.message || err.statusText);
        this.loading = false;
      }
    });
  }

  checkIn(id: number): void {
    // Validación local: evitar llamar al backend si la fecha de entrada
    // aún no ha llegado (evita errores 400/404 por acciones fuera de flujo)
    const reserva = this.reservas.find(r => Number(r.id) === Number(id));
    if (!reserva) {
      console.error('[ReservasComponent] Reserva no encontrada localmente para id:', id);
      this.error = 'Reserva no encontrada en la lista local.';
      return;
    }

    if (!reserva.fechaEntrada) {
      console.warn('[ReservasComponent] Reserva sin fecha de entrada definida:', id);
      this.error = 'Fecha de entrada inválida para la reserva.';
      return;
    }

    const hoy = new Date();

    // Normalizar fechaEntrada a fecha local (sin zona horaria) robustamente
    const fechaStr = String(reserva.fechaEntrada).split('T')[0]; // 'YYYY-MM-DD'
    const parts = fechaStr.split('-').map(p => Number(p));
    if (parts.length !== 3 || parts.some(isNaN)) {
      console.warn('[ReservasComponent] formato de fechaEntrada inesperado:', reserva.fechaEntrada);
      this.error = 'Fecha de entrada inválida';
      return;
    }
    const entradaDate = new Date(parts[0], parts[1] - 1, parts[2]);

    // Normalize to date-only comparison (ignore time-of-day)
    const hoyDate = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

    console.log('[ReservasComponent] Fecha string:', fechaStr, 'entradaDate:', entradaDate.toISOString(), 'hoyDate:', hoyDate.toISOString());

    if (hoyDate < entradaDate) {
      this.error = 'Check-in disponible desde la fecha de entrada';
      console.warn('[ReservasComponent] Intento de check-in antes de la fecha de entrada:', id, reserva.fechaEntrada);
      return;
    }

    // Clear previous errors and proceed
    this.error = null;
    console.log('🔵 [ReservasComponent] Iniciando Check-In para reserva:', id);
    this.reservaService.checkIn(id).subscribe({
      next: () => {
        console.log('✅ [ReservasComponent] Check-In exitoso');
        this.cargarReservas();
      },
      error: (err) => {
        console.error('❌ [ReservasComponent] Error en Check-In:', err);
        if (err && err.status === 400) {
          this.mostrarMensaje('Check-In inválido para esta reserva');
        } else if (err && err.status === 404) {
          this.mostrarMensaje('Reserva no encontrada en el servidor');
        } else if (err && err.status === 409) {
          this.mostrarMensaje('Acción inválida en el estado actual de la reserva');
        } else {
          this.mostrarMensaje('Error al hacer Check-In');
        }
      }
    });
  }

  // MAPEO DE ERRORES
  checkOut(id: number): void {
    console.log('🟣 [ReservasComponent] Iniciando Check-Out para reserva:', id);
    this.reservaService.checkOut(id).subscribe({
      next: () => {
        console.log('✅ [ReservasComponent] Check-Out exitoso');
        this.cargarReservas();
      },
      error: (err) => {
        console.error('❌ [ReservasComponent] Error en Check-Out:', err);
        if (err && err.status === 400) {
          this.mostrarMensaje('Check-Out inválido para esta reserva');
        } else if (err && err.status === 404) {
          this.mostrarMensaje('Reserva no encontrada en el servidor');
        } else if (err && err.status === 409) {
          this.mostrarMensaje('Acción inválida en el estado actual de la reserva');
        } else {
          this.mostrarMensaje('Error al hacer Check-Out');
        }
      }
    });
  }

  cancelar(id: number): void {
    console.log('🔴 [ReservasComponent] Iniciando cancelación para reserva:', id);
    this.reservaService.cancelarReserva(id).subscribe({
      next: () => {
        console.log('✅ [ReservasComponent] Cancelación exitosa');
        this.cargarReservas();
      },
      error: (err) => {
        console.error('❌ [ReservasComponent] Error en cancelación:', err);
        if (err && err.status === 409) {
          this.mostrarMensaje('La reserva ya fue cancelada o no puede cancelarse'); // Mensaje especifico para cuando ya haya sido cancelada y de nuevo presiona el botón cancelar.
        } else {
          this.mostrarMensaje('Error inesperado al cancelar');
        }
      }
    });
  }

  mostrarMensaje(msg: string): void {
    this.error = msg;
    // Ocultar el mensaje después de 3 segundos
    setTimeout(() => {
      if (this.error === msg) {
        this.error = null;
      }
    }, 3000);
  }

  confirmar(id: number): void {
    console.log('🟢 [ReservasComponent] Iniciando confirmación para reserva:', id);
    this.reservaService.confirmarReserva(id).subscribe({
      next: () => {
        console.log('✅ [ReservasComponent] Confirmación exitosa');
        this.cargarReservas();
      },
      error: (err) => {
        console.error('❌ [ReservasComponent] Error en confirmación:', err);
        if (err && err.status === 400) {
          this.mostrarMensaje('Confirmación inválida para esta reserva');
        } else if (err && err.status === 404) {
          this.mostrarMensaje('Reserva no encontrada en el servidor');
        } else if (err && err.status === 409) {
          this.mostrarMensaje('Acción inválida en el estado actual de la reserva');
        } else {
          this.mostrarMensaje('Error al confirmar la reserva');
        }
      }
    });
  }

  confirmarDebug(r: any): void {
    console.log('🔍 [Debug] Objeto clickeado:', r);
    console.log('🔍 [Debug] r.id:', r.id, 'Tipo:', typeof r.id);
    console.log('🔍 [Debug] r.estado:', r.estado);
    this.confirmar(Number(r.id));
  }

  getEstadisticas() {
    return {
      confirmadas: this.reservas.filter(r => r.estado?.toUpperCase() === 'CONFIRMADA').length,
      checkInsHoy: this.reservas.filter(r => this.esCheckInHoy(r.fechaEntrada)).length,
      pendientes: this.reservas.filter(r => r.estado?.toUpperCase() === 'PENDIENTE').length,
      cancelaciones: this.reservas.filter(r => r.estado?.toUpperCase() === 'CANCELADA').length
    };
  }

  private esCheckInHoy(fecha: string): boolean {
    if (!fecha) return false;
    const hoy = new Date().toISOString().split('T')[0];
    return fecha.startsWith(hoy);
  }
}