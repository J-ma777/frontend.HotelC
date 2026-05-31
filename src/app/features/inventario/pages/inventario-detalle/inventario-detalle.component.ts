import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ArticuloInventario } from '../../models/articulo-inventario.model';
import { MovimientosTableComponent } from '../../components/movimientos-table/movimientos-table.component';
import { Movimiento } from '../../models/movimiento.model';

@Component({
  selector: 'app-inventario-detalle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MovimientosTableComponent],
  templateUrl: './inventario-detalle.component.html',
  styleUrls: ['./inventario-detalle.component.css']
})
export class InventarioDetalleComponent implements OnInit {

  movimientos: Movimiento[] = [];
  movimientosFiltrados: Movimiento[] = [];
  loading = false;
  errorMessage = '';
  articuloId = 0;
  articulo: (ArticuloInventario & { stockMaximo: number }) | null = null;

  filtrosForm: ReturnType<FormBuilder['group']>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.filtrosForm = this.fb.group({
      fechaDesde: [''],
      fechaHasta: [''],
      tipo: ['TODOS']
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.articuloId = Number(params['id'] ?? 0);
      this.loadArticulo();
      this.loadMovimientos();
    });

    // Inicial: mostrar todo
    this.movimientosFiltrados = [...this.movimientos];
  }

  loadArticulo(): void {
    if (!this.articuloId) {
      this.errorMessage = 'No se pudo identificar el artículo solicitado.';
      return;
    }

    this.http.get<any>(`http://localhost:3030/inventario/articulo/${this.articuloId}`)
      .subscribe({
        next: (articulo) => {
          this.articulo = {
            ...articulo,
            stockMaximo: Math.max(Number(articulo.stockMinimo ?? 0) * 2, Number(articulo.stockActual ?? 0), 1)
          };
          this.errorMessage = '';
        },
        error: () => {
          this.articulo = null;
          this.errorMessage = 'No se pudo cargar el artículo desde el backend.';
        }
      });
  }

  loadMovimientos(): void {
    if (!this.articuloId) {
      this.movimientos = [];
      this.movimientosFiltrados = [];
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.http.get<Movimiento[]>(`http://localhost:3030/inventario/articulo/${this.articuloId}`)
      .subscribe({
        next: (response) => {
          this.movimientos = this.normalizarMovimientos(response ?? []);
          this.movimientosFiltrados = [...this.movimientos];
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = 'No se pudo cargar los movimientos del artículo.';
          console.error('[InventarioDetalle] error loading movimientos', error);
        }
      });
  }

  volver() {
    this.router.navigate(['/inventario']);
  }

  aplicarFiltros() {
    console.log('[InventarioDetalle] aplicarFiltros() ejecutado');
    const { tipo, fechaDesde, fechaHasta } = this.filtrosForm.getRawValue();
    const tipoFiltro = (tipo ?? 'TODOS') as string;

    const desde = this.normalizarFechaInicio(fechaDesde);
    const hasta = this.normalizarFechaFin(fechaHasta);

    this.movimientosFiltrados = (this.movimientos ?? []).filter((m) => {
      const cumpleTipo = tipoFiltro === 'TODOS' || m.tipo === tipoFiltro;

      const fechaMovimiento = this.parseMovimientoFecha(m.fecha);
      const cumpleFecha =
        (!desde || (!!fechaMovimiento && fechaMovimiento >= desde)) &&
        (!hasta || (!!fechaMovimiento && fechaMovimiento <= hasta));

      return cumpleTipo && cumpleFecha;
    });

    console.log('[InventarioDetalle] filtros:', { tipoFiltro, fechaDesde, fechaHasta });
    console.log('[InventarioDetalle] resultados:', {
      total: this.movimientos?.length ?? 0,
      filtrados: this.movimientosFiltrados.length
    });
  }

  limpiarFiltros() {
    console.log('[InventarioDetalle] limpiarFiltros() ejecutado');
    this.filtrosForm.reset({ fechaDesde: '', fechaHasta: '', tipo: 'TODOS' });
    this.movimientosFiltrados = [...(this.movimientos ?? [])];
  }

  openCalendar(input: HTMLInputElement, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();

    const anyInput = input as any;
    if (typeof anyInput.showPicker === 'function') {
      anyInput.showPicker();
    } else {
      input.focus();
      input.click();
    }
  }

  private normalizarFechaInicio(valor?: string | null): Date | null {
    if (!valor) return null;
    const d = this.parseDateOnlyLocal(valor);
    if (!d) return null;
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private normalizarFechaFin(valor?: string | null): Date | null {
    if (!valor) return null;
    const d = this.parseDateOnlyLocal(valor);
    if (!d) return null;
    d.setHours(23, 59, 59, 999);
    return d;
  }

  /**
   * Parsea valores YYYY-MM-DD (input[type=date]) como fecha LOCAL.
   * `new Date('YYYY-MM-DD')` se interpreta como UTC y puede mover el día según la zona horaria.
   */
  private parseDateOnlyLocal(valor: string): Date | null {
    const match = /^\d{4}-\d{2}-\d{2}$/.test(valor);
    if (!match) return null;
    const [y, m, d] = valor.split('-').map(Number);
    if (!y || !m || !d) return null;
    const date = new Date(y, m - 1, d);
    return isNaN(date.getTime()) ? null : date;
  }

  private normalizarMovimientos(movimientos: Movimiento[]): Movimiento[] {
    return (movimientos ?? []).map((m) => {
      const parsed = this.parseMovimientoFecha(m.fecha);
      return {
        ...m,
        fecha: parsed ? parsed.toISOString() : m.fecha
      };
    });
  }

  /**
   * Parsea fechas que podrían venir en distintos formatos del backend.
   * Soporta ISO, timestamps, `dd/MM/yyyy`, `dd/MM/yyyy HH:mm[:ss]`, `yyyy-MM-dd HH:mm[:ss]`.
   */
  private parseMovimientoFecha(valor: unknown): Date | null {
    if (valor == null) return null;
    if (valor instanceof Date) {
      return isNaN(valor.getTime()) ? null : valor;
    }
    if (typeof valor === 'number') {
      const d = new Date(valor);
      return isNaN(d.getTime()) ? null : d;
    }

    const str = String(valor).trim();
    if (!str) return null;

    // Intento directo (ISO / RFC)
    const direct = new Date(str);
    if (!isNaN(direct.getTime())) return direct;

    // dd/MM/yyyy o dd/MM/yyyy HH:mm[:ss]
    const m1 = str.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
    if (m1) {
      const day = Number(m1[1]);
      const month = Number(m1[2]);
      const year = Number(m1[3]);
      const hour = Number(m1[4] ?? 0);
      const minute = Number(m1[5] ?? 0);
      const second = Number(m1[6] ?? 0);
      const d = new Date(year, month - 1, day, hour, minute, second);
      return isNaN(d.getTime()) ? null : d;
    }

    // yyyy-MM-dd o yyyy-MM-dd HH:mm[:ss]
    const m2 = str.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
    if (m2) {
      const year = Number(m2[1]);
      const month = Number(m2[2]);
      const day = Number(m2[3]);
      const hour = Number(m2[4] ?? 0);
      const minute = Number(m2[5] ?? 0);
      const second = Number(m2[6] ?? 0);
      const d = new Date(year, month - 1, day, hour, minute, second);
      return isNaN(d.getTime()) ? null : d;
    }

    return null;
  }
}