import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReservaService, Reserva } from '../../../../core/services/reserva.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, RouterLink],
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

  checkIn(id: number) {
    this.reservaService.checkIn(id).subscribe(() => this.cargarReservas());
  }

  checkOut(id: number) {
    this.reservaService.checkOut(id).subscribe(() => this.cargarReservas());
  }

  cancelar(id: number) {
    this.reservaService.cancelarReserva(id).subscribe(() => this.cargarReservas());
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