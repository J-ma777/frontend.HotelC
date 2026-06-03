import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { CheckInService } from '../services/check-in.service';
import { FrontDeskCheckInVm, HabitacionDisponible, ReservaDetalle } from '../models/check-in.model';
import { HabitacionesService } from '../../habitaciones/service/habitacion.service';

@Component({
  selector: 'app-frontdesk-checkin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './check-in.component.html',
  styleUrls: ['./check-in.component.css']
})
export class CheckInComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private checkInService = inject(CheckInService);
  private habitacionService = inject(HabitacionesService);

  private sub = new Subscription();

  reservaIdInput = '';

  cargandoReserva = false;
  cargandoHabitaciones = false;
  confirmando = false;

  error: string | null = null;
  success: string | null = null;

  vm: FrontDeskCheckInVm | null = null;
  habitaciones: any[] = [];
  habitacionSeleccionadaId: number | null = null;

  get habitacionSeleccionada(): number | null {
    return this.habitacionSeleccionadaId;
  }

  set habitacionSeleccionada(value: number | null) {
    this.habitacionSeleccionadaId = value;
  }

  // Getter helpers para template
  get habitacionesDisponiblesSolo(): HabitacionDisponible[] {
    return this.habitaciones.filter((h) => this.esHabitacionDisponible(h));
  }

  hasAvailableRooms(): boolean {
    return this.habitaciones.some((h) => this.esHabitacionDisponible(h));
  }

  isConfirmDisabled(): boolean {
    return this.confirmando || !this.habitacionSeleccionadaId || !this.vm || !this.puedeHacerCheckIn(this.vm.reserva);
  }

  ngOnInit(): void {
    this.sub.add(
      this.route.paramMap.subscribe((params) => {
        const idRaw = params.get('id');
        if (idRaw) {
          const id = Number(idRaw);
          if (Number.isFinite(id) && id > 0) {
            this.reservaIdInput = String(id);
            this.cargarReserva(id);
          }
        }
      })
    );

    this.sub.add(
      this.route.queryParamMap.subscribe((q) => {
        const idRaw = q.get('id');
        if (idRaw && !this.vm) {
          const id = Number(idRaw);
          if (Number.isFinite(id) && id > 0) {
            this.reservaIdInput = String(id);
            this.cargarReserva(id);
          }
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onBuscarReserva(): void {
    this.error = null;
    this.success = null;

    const id = Number(this.reservaIdInput);
    if (!Number.isFinite(id) || id <= 0) {
      this.error = 'Ingresa un ID de reserva válido.';
      return;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { id },
      queryParamsHandling: 'merge'
    });

    this.cargarReserva(id);
  }

  private cargarReserva(id: number): void {
    this.cargandoReserva = true;
    this.error = null;
    this.success = null;
    this.vm = null;
    this.habitacionSeleccionadaId = null;
    this.habitaciones = [];

    this.checkInService.getReserva(id).subscribe({
      next: (reserva) => {
        const noches = this.calcularNoches(reserva);
        const precioPorNoche = this.obtenerPrecioPorNoche(reserva);
        const totalEstimado = noches * precioPorNoche;

        this.vm = {
          reserva,
          habitacionesDisponibles: [],
          noches,
          precioPorNoche,
          totalEstimado
        };

        this.cargandoReserva = false;
        this.cargarHabitaciones(reserva);
      },
      error: (err: any) => {
        this.cargandoReserva = false;
        this.error = this.mapearError(err, 'No se pudo cargar la reserva.');
      }
    });
  }

  cargarHabitaciones(reserva: any): void {
    const tipoId = reserva.tipoHabitacionId || reserva.tipoHabitacion?.id;
    const rango = this.obtenerRango(reserva);

    if (!tipoId || !rango.inicio || !rango.fin) {
      console.warn('Datos incompletos');
      this.error = 'La reserva no tiene datos completos (tipo de habitación o fechas) para buscar disponibilidad.';
      return;
    }

    this.cargandoHabitaciones = true;
    this.error = null;

    this.habitacionService
      .getDisponiblesPorTipo(tipoId, rango.inicio, rango.fin)
      .subscribe({
        next: (data) => {
          // Filtrar SOLO habitaciones disponibles / listas (PRO UX)
          this.habitaciones = (data || []).filter((h: any) => {
            const est = (h.estado || '').toUpperCase();
            return est === 'DISPONIBLE' || est === 'AVAILABLE';
          });

          // Reset selección previa
          this.habitacionSeleccionada = null;
          this.habitacionSeleccionadaId = null;

          if (this.vm) {
            this.vm.habitacionesDisponibles = this.habitaciones;
            // Si la reserva no tiene precio por noche, intentar obtenerlo desde las habitaciones.
            if (!this.vm.precioPorNoche || this.vm.precioPorNoche === 0) {
              const candidato = this.habitaciones.find((h) => this.obtenerPrecioDeHabitacion(h) > 0);
              if (candidato) {
                const p = this.obtenerPrecioDeHabitacion(candidato);
                if (p > 0) {
                  this.vm.precioPorNoche = p;
                  this.vm.totalEstimado = this.vm.noches * this.vm.precioPorNoche;
                }
              }
            }
          }
          this.cargandoHabitaciones = false;
        },
        error: (err: any) => {
          console.error(err);
          this.cargandoHabitaciones = false;
          this.error = this.mapearError(err, 'No se pudieron cargar las habitaciones disponibles.');
        }
      });
  }

  seleccionarHabitacion(h: HabitacionDisponible): void {
    if (!this.esHabitacionDisponible(h)) {
      this.error = 'Solo puedes seleccionar habitaciones disponibles.';
      return;
    }

    this.habitacionSeleccionadaId = h.id;
    this.error = null;
  }

  confirmarCheckIn(): void {
    if (!this.vm) {
      this.error = 'Primero carga una reserva.';
      return;
    }

    if (!this.habitacionSeleccionadaId) {
      this.error = 'Debes seleccionar una habitación.';
      return;
    }

    const habitacion = this.habitaciones.find((h) => h.id === this.habitacionSeleccionadaId) || null;
    if (!habitacion || !this.esHabitacionDisponible(habitacion)) {
      this.error = 'La habitación seleccionada no es válida (debe estar disponible).';
      return;
    }

    if (!this.puedeHacerCheckIn(this.vm.reserva)) {
      this.error = 'Esta reserva no está disponible para check-in.';
      return;
    }

    this.confirmando = true;
    this.error = null;
    this.success = null;

    this.checkInService.confirmarCheckIn(this.vm.reserva.id, this.habitacionSeleccionadaId).subscribe({
      next: () => {
        this.confirmando = false;
        this.success = 'Check-in confirmado correctamente.';
        // Recargar la reserva para reflejar estado real
        this.cargarReserva(this.vm!.reserva.id);
      },
      error: (err: any) => {
        this.confirmando = false;
        this.error = this.mapearError(err, 'Error al confirmar check-in.');
      }
    });
  }

  puedeHacerCheckIn(reserva: ReservaDetalle): boolean {
    const estado = (reserva.estado || '').toUpperCase();
    const compact = estado.replace(/[^A-Z]/g, '');

    const esCancelada = compact.includes('CANCEL');
    const yaCheckIn =
      compact.includes('CHECKIN') ||
      compact.includes('CHECKEDIN') ||
      compact.includes('INHOUSE') ||
      compact.includes('HOSPEDADO') ||
      compact.includes('ENCURSO') ||
      compact.includes('ENCASA');

    return !esCancelada && !yaCheckIn;
  }

  esHabitacionDisponible(h: HabitacionDisponible): boolean {
    const estado = (h.estado || '').toUpperCase();
    // Backend puede retornar AVAILABLE o DISPONIBLE según implementación
    return estado === 'AVAILABLE' || estado === 'DISPONIBLE';
  }

  getHabitacionEstadoTexto(h: HabitacionDisponible): string {
    const estado = (h.estado || '').toUpperCase();
    if (estado === 'AVAILABLE' || estado === 'DISPONIBLE') return 'Disponible';
    if (estado === 'SUCIA') return 'Sucia';
    if (estado === 'OCUPADA' || estado === 'OCCUPIED') return 'Ocupada';
    return h.estado || '—';
  }

  getHabitacionEstadoClase(h: HabitacionDisponible): string {
    const estado = (h.estado || '').toUpperCase();
    if (estado === 'AVAILABLE' || estado === 'DISPONIBLE') return 'estado-ok';
    if (estado === 'SUCIA') return 'estado-warn';
    return 'estado-bad';
  }

  getEstadoLabel(reserva: ReservaDetalle): string {
    const estado = (reserva.estado || '—').toString();
    return estado;
  }

  getHuespedNombre(reserva: ReservaDetalle): string {
    return (
      reserva.cliente?.nombreCompleto ||
      reserva.cliente?.nombre ||
      reserva.huesped?.nombre ||
      reserva.nombreHuesped ||
      '—'
    );
  }

  getHuespedDocumento(reserva: ReservaDetalle): string {
    return reserva.cliente?.documento || reserva.huesped?.documento || reserva.documentoHuesped || '—';
  }

  getHuespedEmail(reserva: ReservaDetalle): string {
    return reserva.cliente?.email || reserva.huesped?.email || '—';
  }

  getHuespedTelefono(reserva: ReservaDetalle): string {
    return reserva.cliente?.telefono || reserva.huesped?.telefono || '—';
  }

  getTipoHabitacion(reserva: ReservaDetalle): string {
    return reserva.tipoHabitacion?.nombre || reserva.tipoHabitacionNombre || '—';
  }

  private obtenerRango(reserva: ReservaDetalle): { inicio: string; fin: string } {
    const checkIn = reserva.fechaEntrada || reserva.checkIn || '';
    const checkOut = reserva.fechaSalida || reserva.checkOut || '';

    return {
      inicio: this.toYmd(checkIn),
      fin: this.toYmd(checkOut)
    };
  }

  private calcularNoches(reserva: ReservaDetalle): number {
    const rango = this.obtenerRango(reserva);
    if (!rango.inicio || !rango.fin) return 0;

    const checkIn = new Date(`${rango.inicio}T00:00:00`);
    const checkOut = new Date(`${rango.fin}T00:00:00`);
    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) return 0;

    const msPerDay = 1000 * 60 * 60 * 24;
    const diff = (checkOut.getTime() - checkIn.getTime()) / msPerDay;
    const nights = Math.round(diff);
    return Math.max(0, nights);
  }

  private obtenerPrecioPorNoche(reserva: ReservaDetalle): number {
    // Preferir el plan tarifario explícito.
    const p1 = reserva?.planTarifario?.precioPorNoche ?? (reserva?.planTarifario as any)?.precio ?? (reserva as any)?.precioPorNoche;
    if (typeof p1 === 'number' && Number.isFinite(p1) && p1 > 0) return p1;

    // Otros candidatos en la reserva
    const candidatosReserva = [
      (reserva as any)?.tarifa?.precioPorNoche,
      (reserva as any)?.tarifa?.precio,
      reserva.precioPorNoche
    ];
    const valorReserva = candidatosReserva.find((v) => typeof v === 'number' && Number.isFinite(v) && v > 0);
    if (typeof valorReserva === 'number') return valorReserva;

    // No encontramos precio en la reserva; devolver 0 y esperar fallback desde habitaciones
    return 0;
  }

  private toYmd(raw: string): string {
    if (!raw) return '';
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  }

  private obtenerPrecioDeHabitacion(h: HabitacionDisponible): number {
    const p = (h as any)?.precioPorNoche ?? (h as any)?.tarifa?.precioPorNoche ?? (h as any)?.tarifa?.precio ?? 0;
    return typeof p === 'number' && Number.isFinite(p) ? p : 0;
  }

  formatearFecha(raw?: string): string {
    if (!raw) return '—';
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: '2-digit' });
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'USD' }).format(valor);
  }

  private mapearError(err: any, mensajePorDefecto: string): string {
    const mensajeBackend = err?.error?.detail || err?.error?.message;

    if (mensajeBackend) return mensajeBackend;

    if (err?.status === 400) return 'Petición inválida. Verifica los datos.';
    if (err?.status === 404) return 'La reserva no fue encontrada.';
    if (err?.status === 409) return 'Transición de estado no permitida o conflicto de datos.';

    return mensajePorDefecto;
  }
}
