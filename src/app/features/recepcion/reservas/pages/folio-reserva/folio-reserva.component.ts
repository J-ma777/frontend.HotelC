import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Transaccion } from '../../../../../core/models/transaccion.model';
import { Saldo } from '../../../../../core/models/saldo.model';
import { FolioService } from '../../../../../core/services/folio.service';
import { forkJoin } from 'rxjs';
import { ReservasService } from '../../services/reservas.service';
import { Reserva } from '../../types/reserva.types';

@Component({
  selector: 'app-folio-reserva',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './folio-reserva.component.html',
  styleUrls: ['./folio-reserva.component.css']
})
export class FolioReservaComponent implements OnInit {
  reservaId!: number;
  reserva: Reserva | null = null;
  transacciones: Transaccion[] = [];
  saldo: Saldo = { total: 0 };

  loading = false;
  error: string | null = null;

  subtotalAlojamiento = 0;
  subtotalConsumos = 0;
  totalPagos = 0;
  totalDescuentos = 0;

  constructor(
    private route: ActivatedRoute,
    private folioService: FolioService,
    private reservasService: ReservasService
  ) { }

  ngOnInit(): void {
    const idParam =
      this.route.snapshot.paramMap.get('id') ??
      this.route.parent?.snapshot.paramMap.get('id');

    this.reservaId = Number(idParam);
    if (!this.reservaId) {
      this.error = 'No se encontró el id de la reserva.';
      return;
    }

    this.cargarFolio();
  }

  cargarFolio(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      reserva: this.reservasService.getReservaById(this.reservaId),
      transacciones: this.folioService.getTransacciones(this.reservaId),
      saldo: this.folioService.getSaldo(this.reservaId)
    }).subscribe({
      next: ({ reserva, transacciones, saldo }) => {
        this.reserva = reserva;
        this.transacciones = (transacciones || []).slice().sort(
          (a, b) => new Date(b.fechaTransaccion).getTime() - new Date(a.fechaTransaccion).getTime()
        );
        this.saldo = saldo;
        this.calcularResumenFinanciero();
        this.loading = false;
      },
      error: (err) => {
        console.error('[FolioReservaComponent] Error cargando folio:', err);
        this.error = err?.error?.detail || err?.error?.message || 'No se pudo cargar el folio.';
        this.loading = false;
      }
    });
  }

  calcularResumenFinanciero(): void {
    this.subtotalAlojamiento = this.transacciones
      .filter(t => t.tipo === 'ALOJAMIENTO')
      .reduce((sum, t) => sum + t.total, 0);
    this.subtotalConsumos = this.transacciones
      .filter(t => t.tipo === 'CARGO_CONSUMO')
      .reduce((sum, t) => sum + t.total, 0);
    this.totalPagos = this.transacciones
      .filter(t => t.tipo === 'PAGO')
      .reduce((sum, t) => sum + t.total, 0);
    this.totalDescuentos = this.transacciones
      .filter(t => t.tipo === 'DESCUENTO')
      .reduce((sum, t) => sum + t.total, 0);
  }

  getTipoClase(tipo: string): string {
    switch (tipo) {
      case 'ALOJAMIENTO':
        return 'tipo-alojamiento';
      case 'CARGO_CONSUMO':
        return 'tipo-consumo';
      case 'PAGO':
        return 'tipo-pago';
      case 'DESCUENTO':
        return 'tipo-descuento';
      default:
        return 'tipo-otro';
    }
  }

  getTipoLabel(tipo: string): string {
    switch (tipo) {
      case 'ALOJAMIENTO':
        return 'Alojamiento';
      case 'CARGO_CONSUMO':
        return 'Consumo';
      case 'PAGO':
        return 'Pago';
      case 'DESCUENTO':
        return 'Descuento';
      default:
        return tipo;
    }
  }

  getMontoTransaccion(t: Transaccion): number {
    if (t.tipo === 'DESCUENTO') {
      return -Math.abs(t.total);
    }
    return t.total;
  }

  getTotalDescuentosDisplay(): number {
    return -Math.abs(this.totalDescuentos);
  }

  getNoches(): number {
    if (!this.reserva?.fechaEntrada || !this.reserva?.fechaSalida) return 0;
    const entrada = new Date(this.reserva.fechaEntrada);
    const salida = new Date(this.reserva.fechaSalida);
    const ms = salida.getTime() - entrada.getTime();
    if (Number.isNaN(ms)) return 0;
    return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }

  registrarConsumo(): void {
    const descripcion = window.prompt('Descripción del consumo:');
    if (!descripcion) return;
    const cantidadRaw = window.prompt('Cantidad:', '1');
    if (!cantidadRaw) return;
    const precioRaw = window.prompt('Precio unitario:', '0');
    if (precioRaw == null) return;

    const payload = {
      descripcion,
      cantidad: Number(cantidadRaw),
      precioUnitario: Number(precioRaw)
    };

    this.folioService.registrarConsumo(this.reservaId, payload).subscribe({
      next: () => this.cargarFolio(),
      error: (err) => {
        console.error('[FolioReservaComponent] Error registrarConsumo:', err);
        window.alert(err?.error?.detail || err?.error?.message || 'No se pudo registrar el consumo.');
      }
    });
  }

  registrarPago(): void {
    const montoRaw = window.prompt('Monto del pago:', '0');
    if (montoRaw == null) return;
    const descripcion = window.prompt('Descripción (opcional):', 'Pago recibido');

    const payload = {
      monto: Number(montoRaw),
      descripcion: descripcion || undefined
    };

    this.folioService.registrarPago(this.reservaId, payload).subscribe({
      next: () => this.cargarFolio(),
      error: (err) => {
        console.error('[FolioReservaComponent] Error registrarPago:', err);
        window.alert(err?.error?.detail || err?.error?.message || 'No se pudo registrar el pago.');
      }
    });
  }

  aplicarDescuento(): void {
    const montoRaw = window.prompt('Monto de descuento:', '0');
    if (montoRaw == null) return;
    const descripcion = window.prompt('Motivo (opcional):', 'Descuento aplicado');

    const payload = {
      monto: Number(montoRaw),
      descripcion: descripcion || undefined
    };

    this.folioService.aplicarDescuento(this.reservaId, payload).subscribe({
      next: () => this.cargarFolio(),
      error: (err) => {
        console.error('[FolioReservaComponent] Error aplicarDescuento:', err);
        window.alert(err?.error?.detail || err?.error?.message || 'No se pudo aplicar el descuento.');
      }
    });
  }

  realizarCheckout(): void {
    if (this.saldo.total === 0) {
      if (!window.confirm('¿Confirmar check-out de la reserva?')) return;
      this.folioService.realizarCheckout(this.reservaId).subscribe(() => {
        window.alert('Check-out realizado.');
      });
    }
  }
}
