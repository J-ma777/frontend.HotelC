import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { DashboardService, DashboardResponse } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  dataActual?: DashboardResponse;
  dataAnterior?: DashboardResponse;
  fechaInicio: string = '';
  fechaFin: string = '';
  variacionIngresos: number = 0;
  variacionOcupacion: number = 0;

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    const hoy = new Date();
    this.fechaInicio = this.formatearFecha(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
    this.fechaFin = this.formatearFecha(hoy);
    this.cargarDashboard();
  }

  cargarDashboard(): void {
    if (!this.fechaInicio || !this.fechaFin) return;

    const dInicio = new Date(this.fechaInicio + 'T00:00:00');
    const dFin = new Date(this.fechaFin + 'T00:00:00');

    const diffTime = dFin.getTime() - dInicio.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const dInicioAnterior = new Date(dInicio.getTime());
    dInicioAnterior.setDate(dInicioAnterior.getDate() - diffDays);

    const dFinAnterior = new Date(dFin.getTime());
    dFinAnterior.setDate(dFinAnterior.getDate() - diffDays);

    const inicioAnterior = this.formatearFecha(dInicioAnterior);
    const finAnterior = this.formatearFecha(dFinAnterior);

    forkJoin({
      actual: this.dashboardService.obtenerDashboard(this.fechaInicio, this.fechaFin),
      anterior: this.dashboardService.obtenerDashboard(inicioAnterior, finAnterior)
    }).subscribe({
      next: (res: { actual: DashboardResponse, anterior: DashboardResponse }) => {
        this.dataActual = res.actual;
        this.dataAnterior = res.anterior;
        this.calcularVariaciones();

        console.log('Actual:', this.dataActual);
        console.log('Anterior:', this.dataAnterior);
        console.log('Variación ingresos:', this.variacionIngresos);
        console.log('Variación ocupación:', this.variacionOcupacion);
      },
      error: (err: any) => {
        console.error('Error al cargar datos del dashboard:', err);
      }
    });
  }

  calcularVariaciones(): void {
    if (!this.dataActual || !this.dataAnterior) {
      this.variacionIngresos = 0;
      this.variacionOcupacion = 0;
      return;
    }

    const ingresosAnterior = this.dataAnterior.ingresos;
    const ingresosActual = this.dataActual.ingresos;
    this.variacionIngresos = ingresosAnterior === 0
      ? 0
      : ((ingresosActual - ingresosAnterior) / ingresosAnterior) * 100;

    const ocupacionAnterior = this.dataAnterior.ocupacion;
    const ocupacionActual = this.dataActual.ocupacion;
    this.variacionOcupacion = ocupacionAnterior === 0
      ? 0
      : ((ocupacionActual - ocupacionAnterior) / ocupacionAnterior) * 100;
  }

  abs(val: number): number {
    return Math.abs(val);
  }

  private formatearFecha(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }
}