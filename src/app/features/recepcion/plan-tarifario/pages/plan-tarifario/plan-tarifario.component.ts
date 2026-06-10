import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PlanTarifarioService } from '../../services/plan-tarifario.service';
import { TipoHabitacionService } from '../../../tipos-habitacion/services/tipo-habitacion.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { PlanTarifario, PlanTarifarioCreate } from '../../../../../core/models/plan-tarifario.model';
import { TipoHabitacion } from '../../../../../core/models/tipo-habitacion.model';

type FiltroTarifa = '' | 'WEEKDAY' | 'WEEKEND' | 'HOLIDAY';

@Component({
  selector: 'app-plan-tarifario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plan-tarifario.component.html',
  styleUrls: ['./plan-tarifario.component.css']
})
export class PlanTarifarioComponent implements OnInit {

  crearModalVisible = false;
  cargando = false;
  mensajeEstado: string | null = null;
  mensajeTipo: 'success' | 'error' | null = null;
  private mensajeTimeout: ReturnType<typeof setTimeout> | null = null;

  busqueda = '';
  filtroTipoHabitacion = '';
  filtroTipoTarifa: FiltroTarifa = '';
  filtroFechaDesde = '';
  filtroFechaHasta = '';
  planes: PlanTarifario[] = [];
  tiposHabitacion: TipoHabitacion[] = [];
  tiposHabitacionVisibles: TipoHabitacion[] = [];
  planesFiltrados: PlanTarifario[] = [];

  private readonly planTarifarioService = inject(PlanTarifarioService);
  private readonly tipoHabitacionService = inject(TipoHabitacionService);
  private readonly authService = inject(AuthService);

  canView(): boolean {
    return this.authService.hasPermission('PLAN_TARIFARIO_VER');
  }

  canManage(): boolean {
    return this.authService.hasPermission('PLAN_TARIFARIO_GESTIONAR');
  }

  formulario = {
    nombre: '',
    precioPorNoche: null as number | null,
    tipoHabitacionId: null as number | null,
    tipoTarifa: 'WEEKDAY' as FiltroTarifa,
    validoDesde: '',
    validoHasta: ''
  };

  private readonly planesDemo: PlanTarifario[] = [
    {
      id: 1,
      nombre: 'Standard Best Available Rate',
      precioPorNoche: 450,
      tipoTarifa: 'WEEKDAY',
      validoDesde: '2024-10-01',
      validoHasta: '2024-12-31',
      tipoHabitacionNombre: 'Deluxe King Room',
      activo: true

    },
    {
      id: 2,
      nombre: 'Christmas Peak Season',
      precioPorNoche: 1200,
      tipoTarifa: 'HOLIDAY',
      validoDesde: '2024-12-20',
      validoHasta: '2025-01-05',
      tipoHabitacionNombre: 'All Luxury Suites',
      activo: true
    },
    {
      id: 3,
      nombre: 'Non-Refundable Advance Purchase',
      precioPorNoche: 385,
      tipoTarifa: 'WEEKEND',
      validoDesde: '2024-01-01',
      validoHasta: '2024-12-31',
      tipoHabitacionNombre: 'Ocean Front Suite',
      activo: true
    },
    {
      id: 4,
      nombre: 'Early Bird Promotion - Summer',
      precioPorNoche: 2800,
      tipoTarifa: 'WEEKDAY',
      validoDesde: '2024-06-01',
      validoHasta: '2024-08-31',
      tipoHabitacionNombre: 'Penthouse',
      activo: true
    }
  ];

  ngOnInit(): void {
    this.tiposHabitacionVisibles = this.obtenerTiposHabitacionFallback();
    this.cargarTiposHabitacion();
    this.cargarPlanes();
  }

  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error'): void {
    this.mensajeEstado = mensaje;
    this.mensajeTipo = tipo;

    if (this.mensajeTimeout) {
      clearTimeout(this.mensajeTimeout);
    }

    this.mensajeTimeout = setTimeout(() => {
      this.mensajeEstado = null;
      this.mensajeTipo = null;
      this.mensajeTimeout = null;
    }, 4000);
  }

  aplicarFiltros(): void {
    const textoBusqueda = this.busqueda.trim().toLowerCase();

    this.planesFiltrados = this.ordenarPorVigencia(this.planes).filter((plan) => {
      const nombre = plan.nombre.toLowerCase();
      const tipoHabitacion = this.obtenerNombreTipoHabitacion(plan).toLowerCase();
      const tipoTarifa = this.obtenerTipoTarifa(plan);
      const coincideBusqueda = !textoBusqueda || nombre.includes(textoBusqueda) || tipoHabitacion.includes(textoBusqueda);
      const coincideHabitacion = !this.filtroTipoHabitacion || tipoHabitacion === this.filtroTipoHabitacion.toLowerCase();
      const coincideTarifa = !this.filtroTipoTarifa || tipoTarifa === this.filtroTipoTarifa;
      const coincideDesde = !this.filtroFechaDesde || new Date(`${plan.validoHasta}T00:00:00`) >= new Date(`${this.filtroFechaDesde}T00:00:00`);
      const coincideHasta = !this.filtroFechaHasta || new Date(`${plan.validoDesde}T00:00:00`) <= new Date(`${this.filtroFechaHasta}T23:59:59`);

      return coincideBusqueda && coincideHabitacion && coincideTarifa && coincideDesde && coincideHasta;
    });
  }

  cargarPlanes(): void {
    this.cargando = true;
    this.planTarifarioService.getAll().subscribe({
      next: (data) => {
        this.planes = data.length > 0 ? data : [...this.planesDemo];
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (error: unknown) => {
        const mensaje = error instanceof Error ? error.message : 'Error cargando planes tarifarios';
        this.mostrarMensaje(mensaje, 'error');
        this.planes = [...this.planesDemo];
        this.aplicarFiltros();
        this.cargando = false;
      }
    });
  }

  cargarTiposHabitacion(): void {
    this.tipoHabitacionService.getAll().subscribe({
      next: (data) => {
        this.tiposHabitacion = data;
        this.tiposHabitacionVisibles = data;
      },
      error: (error: unknown) => {
        const mensaje = error instanceof Error ? error.message : 'Error cargando tipos de habitación';
        this.mostrarMensaje(mensaje, 'error');
        this.tiposHabitacionVisibles = this.obtenerTiposHabitacionFallback();
      }
    });
  }

  abrirCrearPlan(): void {
    this.crearModalVisible = true;
  }

  cerrarCrearPlan(): void {
    this.crearModalVisible = false;
    this.limpiarFormulario();
  }

  guardarPlan(): void {

    const { nombre, precioPorNoche, tipoHabitacionId } = this.formulario;

    // DEBUG TEMPORAL (puedes quitar después)
    console.log('FORMULARIO RAW:', JSON.stringify(this.formulario, null, 2));

    // VALIDACIÓN REAL (ANTES de cualquier uso)
    if (!nombre || !nombre.trim()) {
      this.mostrarMensaje('Nombre es obligatorio', 'error');
      return;
    }

    if (precioPorNoche === null || !Number.isFinite(Number(precioPorNoche)) || Number(precioPorNoche) <= 0) {
      this.mostrarMensaje('Precio inválido', 'error');
      return;
    }

    if (
      tipoHabitacionId === null ||
      tipoHabitacionId === undefined ||
      !Number.isFinite(Number(tipoHabitacionId)) ||
      Number(tipoHabitacionId) <= 0
    ) {
      this.mostrarMensaje('Selecciona un tipo de habitación válido', 'error');
      return;
    }

    if (!this.formulario.validoDesde || !this.formulario.validoHasta) {
      this.mostrarMensaje('Debes indicar la vigencia del plan.', 'error');
      return;
    }

    // CONVERSIÓN SEGURA
    const payload: PlanTarifarioCreate = {
      nombre: nombre.trim(),
      precioPorNoche: Number(precioPorNoche),
      tipoTarifa: this.formulario.tipoTarifa as 'WEEKDAY' | 'WEEKEND' | 'HOLIDAY',
      validoDesde: this.formulario.validoDesde,
      validoHasta: this.formulario.validoHasta,
      tipoHabitacionId: Number(tipoHabitacionId)
    };

    console.log('PAYLOAD FINAL:', JSON.stringify(payload, null, 2));

    this.planTarifarioService.create(payload).subscribe({
      next: () => {
        this.mostrarMensaje('Plan tarifario creado correctamente', 'success');
        this.cerrarCrearPlan();
        this.cargarPlanes();
      },
      error: (error: unknown) => {
        const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el plan tarifario.';
        this.mostrarMensaje(mensaje, 'error');
      }
    });
  }


  trackByPlanId(_: number, plan: PlanTarifario): number {
    return plan.id;
  }

  obtenerTipoTarifa(plan: PlanTarifario): FiltroTarifa {
    return plan.tipoTarifa as FiltroTarifa;
  }

  obtenerNombreTipoTarifa(plan: PlanTarifario): string {
    switch (plan.tipoTarifa) {
      case 'HOLIDAY':
        return 'Feriado';
      case 'WEEKEND':
        return 'Fin de semana';
      default:
        return 'Entre semana';
    }
  }

  obtenerNombreTipoHabitacion(plan: PlanTarifario): string {
    return plan.tipoHabitacionNombre ?? 'Sin tipo';
  }

  obtenerIcono(plan: PlanTarifario): string {
    switch (plan.tipoTarifa) {
      case 'HOLIDAY':
        return '📅';
      case 'WEEKEND':
        return '💼';
      default:
        return '🏷';
    }
  }

  obtenerIconoClase(plan: PlanTarifario): string {
    switch (plan.tipoTarifa) {
      case 'HOLIDAY':
        return 'icon-bg-red';
      case 'WEEKEND':
        return 'icon-bg-blue';
      default:
        return 'icon-bg-gold';
    }
  }


  obtenerPlanClase(plan: PlanTarifario): string {
    switch (plan.tipoTarifa) {
      case 'HOLIDAY':
        return 'border-feriado';
      case 'WEEKEND':
        return 'border-finde';
      default:
        return 'border-semana';
    }
  }

  obtenerBadgeTarifaClase(plan: PlanTarifario): string {
    switch (plan.tipoTarifa) {
      case 'HOLIDAY':
        return 'badge-holiday';
      case 'WEEKEND':
        return 'badge-weekend';
      default:
        return 'badge-weekday';
    }
  }


  obtenerEstado(plan: PlanTarifario): string {
    return this.esActivo(plan) ? 'ACTIVO' : 'INACTIVO';
  }

  obtenerEstadoClase(plan: PlanTarifario): string {
    return this.esActivo(plan) ? 'badge-activo' : 'badge-inactivo';
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(precio);
  }

  formatearFecha(fecha: string): string {
    if (!fecha) {
      return '--';
    }

    const date = new Date(`${fecha}T00:00:00`);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }).format(date);
  }

  private esActivo(plan: PlanTarifario): boolean {
    const hoy = new Date();
    const inicio = new Date(`${plan.validoDesde}T00:00:00`);
    const fin = new Date(`${plan.validoHasta}T23:59:59`);

    return hoy >= inicio && hoy <= fin;
  }

  private limpiarFormulario(): void {
    this.formulario = {
      nombre: '',
      precioPorNoche: null as number | null,
      tipoHabitacionId: null as number | null,
      tipoTarifa: 'WEEKDAY',
      validoDesde: '',
      validoHasta: ''
    };
  }

  private ordenarPorVigencia(planes: PlanTarifario[]): PlanTarifario[] {
    return [...planes].sort((a, b) => {
      return new Date(`${b.validoDesde}T00:00:00`).getTime() - new Date(`${a.validoDesde}T00:00:00`).getTime();
    });
  }

  private obtenerTiposHabitacionFallback(): TipoHabitacion[] {
    return this.planesDemo.map((plan, index) => ({
      id: index + 1,
      nombre: plan.tipoHabitacionNombre,
      capacidad: 1,
      descripcion: ''
    }));
  }
}