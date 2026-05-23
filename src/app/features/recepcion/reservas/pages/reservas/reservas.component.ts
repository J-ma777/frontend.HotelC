import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservasService } from '../../services/reservas.service';
import { Reserva } from '../../types/reserva.types';
import { AuthService } from '../../../../../core/services/auth.service';
import { RouterModule } from '@angular/router';
import { CheckinModalComponent } from '../../components/checkin-modal/checkin-modal.component';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, RouterModule, CheckinModalComponent],
  templateUrl: './reservas.component.html',
  styleUrls: ['./reservas.component.css']
})
export class ReservasComponent implements OnInit {

  private reservasService = inject(ReservasService);
  private authService = inject(AuthService);

  reservas: Reserva[] = [];
  permisos: string[] = [];
  loading = false;
  error: string | null = null;
  // Track checkout loading per reservation ID
  checkoutLoadingIds: Set<number> = new Set();

  // Modal state
  mostrarCheckinModal = false;
  reservaSeleccionada: Reserva | null = null;


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

    this.reservasService.getReservas().subscribe({
      next: (data) => {
        console.log('✅ [ReservasComponent] Reservas cargadas:', data);
        console.log('📊 Total de reservas:', data?.length || 0);
        this.reservas = data || [];
        this.loading = false;
      },
      error: (err) => {
        this.manejarErrorHTTP(err, 'Error al cargar reservas');
        this.loading = false;
      }
    });
  }

  private manejarErrorHTTP(err: any, mensajePorDefecto: string): void {
    console.error('❌ [ReservasComponent] Error HTTP:', err);
    // Si el backend envía 'detail' o 'message', lo usamos (ideal para 409 y validaciones)
    const mensajeBackend = err?.error?.detail || err?.error?.message;

    if (mensajeBackend) {
      this.mostrarMensaje(mensajeBackend);
    } else if (err?.status === 400) {
      this.mostrarMensaje('Petición inválida. Verifica los datos.');
    } else if (err?.status === 404) {
      this.mostrarMensaje('La reserva no fue encontrada en el servidor.');
    } else if (err?.status === 409) {
      this.mostrarMensaje('Transición de estado no permitida o conflicto de datos.');
    } else {
      this.mostrarMensaje(mensajePorDefecto);
    }
  }


  // MAPEO DE ERRORES
  hacerCheckout(reserva: Reserva): void {
    const confirmMsg = `¿Confirma checkout de la reserva #${reserva.id}?`;
    if (!window.confirm(confirmMsg)) {
      return;
    }
    this.checkoutLoadingIds.add(reserva.id);
    this.reservasService.checkOut(reserva.id).subscribe({
      next: () => {
        this.checkoutLoadingIds.delete(reserva.id);
        this.cargarReservas();
        this.mostrarMensaje('Checkout completado exitosamente');
      },
      error: (err) => {
        this.checkoutLoadingIds.delete(reserva.id);
        this.manejarErrorHTTP(err, 'Error inesperado al hacer Checkout');
      }
    });
  }

  // Existing legacy method retained for backward compatibility (optional)
  // checkOut(id: number): void {
  //   console.warn('checkOut(id) is deprecated, use hacerCheckout(reserva) instead');
  // }

  cancelar(id: number): void {
    console.log('🔴 [ReservasComponent] Iniciando cancelación para reserva:', id);
    this.reservasService.cancelarReserva(id).subscribe({
      next: () => {
        console.log('✅ [ReservasComponent] Cancelación exitosa');
        this.cargarReservas();
      },
      error: (err) => {
        this.manejarErrorHTTP(err, 'Error inesperado al cancelar la reserva');
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
    this.reservasService.confirmarReserva(id).subscribe({
      next: () => {
        console.log('✅ [ReservasComponent] Confirmación exitosa');
        this.cargarReservas();
      },
      error: (err) => {
        this.manejarErrorHTTP(err, 'Error inesperado al confirmar la reserva');
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

  abrirCheckinModal(reserva: Reserva): void {
    this.reservaSeleccionada = reserva;
    this.mostrarCheckinModal = true;
    this.error = null;
  }

  cerrarCheckinModal(): void {
    this.mostrarCheckinModal = false;
    this.reservaSeleccionada = null;
  }

  onCheckinCompletado(): void {
    this.cerrarCheckinModal();
    this.cargarReservas();
  }
}