import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';
import { InventarioService } from '../../services/inventario.service';
import { ArticuloInventario } from '../../models/articulo-inventario.model';
import { InventarioTableComponent } from '../../components/inventario-table/inventario-table.component';
import { AlertasStockComponent } from '../../components/alertas-stock/alertas-stock.component';
import { MovimientoModalComponent } from '../../components/movimiento-modal/movimiento-modal.component';
import { AjusteStockModalComponent } from '../../components/ajuste-stock-modal/movimiento-stock-modal.component';
import { MovimientoRequest } from '../../models/movimiento-request.model';
import { AjusteStockRequest } from '../../models/ajuste-stock-request.model';

@Component({
  selector: 'app-inventario-dashboard',
  standalone: true,
  imports: [CommonModule, InventarioTableComponent, AlertasStockComponent, MovimientoModalComponent, AjusteStockModalComponent],
  templateUrl: './inventario-dashboard.component.html',
  styleUrls: ['./inventario-dashboard.component.css']
})
export class InventarioDashboardComponent implements OnInit {

  articulos: any[] = [];
  alertasCriticas: ArticuloInventario[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
  lastUpdated = '';
  searchTerm = '';
  movimientoModalVisible = false;
  ajusteModalVisible = false;
  articuloModalSeleccionado: ArticuloInventario | null = null;
  tipoMovimientoSeleccionado: 'ENTRADA' | 'SALIDA' | null = null;

  totalArticulos = 0;
  bajoStock = 0;
  stockActualTotal = 0;
  stockMinimoTotal = 0;

  constructor(
    private inventarioService: InventarioService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const state = history.state as { successMessage?: string };
    if (state?.successMessage) {
      this.successMessage = state.successMessage;
    }
    this.cargarDashboard();
  }

  cargarDashboard(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.get<any[]>('http://localhost:3030/inventario/articulos')
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (articulos) => {
          this.articulos = articulos ?? [];
          this.alertasCriticas = (this.articulos as ArticuloInventario[]).filter((articulo) => this.esCritico(articulo));
          this.actualizarMetricas();
          this.lastUpdated = new Date().toLocaleString('es-PE');
          this.successMessage = this.articulos.length > 0
            ? `Se cargaron ${this.articulos.length} artículos de inventario.`
            : 'No se encontraron artículos de inventario.';
        },
        error: (error: HttpErrorResponse) => {
          this.articulos = [];
          this.alertasCriticas = [];
          this.actualizarMetricas();
          this.errorMessage = this.obtenerMensajeError(error);
        }
      });
  }

  get articulosFiltrados(): ArticuloInventario[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.articulos as ArticuloInventario[];
    }

    return (this.articulos as ArticuloInventario[]).filter((articulo) => {
      return [articulo.nombre, articulo.sku, articulo.tipo, articulo.categoria]
        .filter(Boolean)
        .some((valor) => String(valor).toLowerCase().includes(term));
    });
  }

  onBuscar(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value ?? '';
  }

  refrescar(): void {
    this.cargarDashboard();
  }

  onRegistrarMovimiento(): void {
    this.articuloModalSeleccionado = null;
    this.tipoMovimientoSeleccionado = 'ENTRADA';
    this.movimientoModalVisible = true;
    this.ajusteModalVisible = false;
  }

  onNuevoArticulo(): void {
    this.router.navigate(['/inventario', 'nuevo-articulo']);
  }

  onEntrada(articulo: ArticuloInventario): void {
    this.articuloModalSeleccionado = articulo;
    this.tipoMovimientoSeleccionado = 'ENTRADA';
    this.movimientoModalVisible = true;
    this.ajusteModalVisible = false;
  }

  onSalida(articulo: ArticuloInventario): void {
    this.articuloModalSeleccionado = articulo;
    this.tipoMovimientoSeleccionado = 'SALIDA';
    this.movimientoModalVisible = true;
    this.ajusteModalVisible = false;
  }

  onAjustar(articulo: ArticuloInventario): void {
    this.articuloModalSeleccionado = articulo;
    this.movimientoModalVisible = false;
    this.ajusteModalVisible = true;
  }


  cerrarMovimientoModal(): void {
    this.movimientoModalVisible = false;
    this.articuloModalSeleccionado = null;
    this.tipoMovimientoSeleccionado = null;
  }

  cerrarAjusteModal(): void {
    this.ajusteModalVisible = false;
    this.articuloModalSeleccionado = null;
  }

  guardarMovimiento(payload: MovimientoRequest & { tipo: 'ENTRADA' | 'SALIDA' }): void {
    const request = {
      articuloId: Number(payload.articuloId),
      cantidad: Math.abs(Number(payload.cantidad)),
      motivo: payload.motivo?.trim() ?? ''
    };

    this.inventarioService.registrarMovimiento(payload.tipo, request).subscribe({
      next: () => {
        this.successMessage = 'Movimiento registrado correctamente.';
        this.errorMessage = '';
        this.cerrarMovimientoModal();
        this.cargarDashboard();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.obtenerMensajeError(error);
        this.successMessage = '';
      }
    });
  }

  guardarAjuste(payload: AjusteStockRequest): void {
    const request = {
      articuloId: Number(payload.articuloId),
      nuevoStock: Number(payload.nuevoStock),
      motivo: payload.motivo?.trim() ?? ''
    };

    this.inventarioService.ajustarStock(request).subscribe({
      next: () => {
        this.successMessage = 'Ajuste de stock guardado correctamente.';
        this.errorMessage = '';
        this.cerrarAjusteModal();
        this.cargarDashboard();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.obtenerMensajeError(error);
        this.successMessage = '';
      }
    });
  }

  trackByArticuloId(_: number, articulo: ArticuloInventario): number {
    return articulo.id;
  }

  private actualizarMetricas(): void {
    this.totalArticulos = this.articulos.length;
    this.bajoStock = this.articulos.filter((articulo) => this.esCritico(articulo)).length;
    this.stockActualTotal = this.articulos.reduce((acumulado, articulo) => acumulado + Number(articulo.stockActual ?? 0), 0);
    this.stockMinimoTotal = this.articulos.reduce((acumulado, articulo) => acumulado + Number(articulo.stockMinimo ?? 0), 0);
  }

  private esCritico(articulo: ArticuloInventario): boolean {
    return Number(articulo.stockActual) <= Number(articulo.stockMinimo);
  }

  private obtenerMensajeError(error: HttpErrorResponse): string {
    const backendMessage = this.extraerMensajeBackend(error);

    if (backendMessage) {
      return backendMessage;
    }

    if (error.status === 0) {
      return 'No fue posible conectar con el backend de inventario.';
    }

    return `No se pudo cargar el dashboard de inventario. Código ${error.status}.`;
  }

  private extraerMensajeBackend(error: HttpErrorResponse): string {
    const payload = error.error;

    if (typeof payload === 'string' && payload.trim()) {
      return payload;
    }

    if (payload && typeof payload === 'object') {
      const message = (payload as { message?: string; error?: string }).message ?? (payload as { message?: string; error?: string }).error;
      if (message) {
        return message;
      }
    }

    return '';
  }
}