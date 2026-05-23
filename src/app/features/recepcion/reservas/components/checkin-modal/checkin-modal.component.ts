import { Component, inject, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisponibilidadService } from '../../services/disponibilidad.service';
import { ReservasService } from '../../services/reservas.service';
import { Reserva } from '../../types/reserva.types';
import { HabitacionDisponible } from '../../types/habitacion.types';

@Component({
  selector: 'app-checkin-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkin-modal.component.html',
  styleUrls: ['./checkin-modal.component.css']
})
export class CheckinModalComponent implements OnInit {
  @Input() reserva!: Reserva;
  @Output() cerrar = new EventEmitter<void>();
  @Output() checkinCompletado = new EventEmitter<void>();

  private disponibilidadService = inject(DisponibilidadService);
  private reservasService = inject(ReservasService);

  habitaciones: HabitacionDisponible[] = [];
  habitacionSeleccionada: number | null = null;
  loading = false;
  error: string | null = null;
  confirmando = false;

  ngOnInit(): void {
    this.cargarHabitacionesDisponibles();
  }

  cargarHabitacionesDisponibles(): void {
    this.loading = true;
    this.error = null;

    const fechaInicio = this.formatDate(this.reserva.fechaEntrada);
    const fechaFin = this.formatDate(this.reserva.fechaSalida);

    this.disponibilidadService.buscarDisponibles(fechaInicio, fechaFin).subscribe({
      next: (data) => {
        this.habitaciones = data;
        this.loading = false;
      },
      error: (err: Error) => {
        console.error('Error al cargar habitaciones disponibles:', err);
        this.error = 'Error al cargar habitaciones disponibles';
        this.loading = false;
      }
    });
  }

  seleccionarHabitacion(habitacionId: number): void {
    this.habitacionSeleccionada = habitacionId;
  }

  confirmarCheckin(): void {
    if (!this.habitacionSeleccionada) {
      this.error = 'Debe seleccionar una habitación';
      return;
    }

    this.confirmando = true;
    this.error = null;

    this.reservasService.realizarCheckIn(this.reserva.id, this.habitacionSeleccionada).subscribe({
      next: () => {
        this.confirmando = false;
        this.checkinCompletado.emit();
        this.cerrarModal();
      },
      error: (err: Error) => {
        console.error('Error al confirmar check-in:', err);
        this.error = 'Error al confirmar check-in: ' + (err.message || 'Error desconocido');
        this.confirmando = false;
      }
    });
  }

  cerrarModal(): void {
    this.cerrar.emit();
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  formatearFechaRango(): string {
    const inicio = this.formatearFecha(this.reserva.fechaEntrada);
    const fin = this.formatearFecha(this.reserva.fechaSalida);
    return `${inicio} - ${fin}`;
  }

  private formatearFecha(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
  }

  getEstadoLabel(estado: string): string {
    return estado === 'DISPONIBLE' ? 'LIMPIA' : estado;
  }

  isHabitacionSeleccionada(habitacionId: number): boolean {
    return this.habitacionSeleccionada === habitacionId;
  }
}
