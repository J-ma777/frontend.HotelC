import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-plan-tarifario',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './plan-tarifario.component.html',
  styleUrls: ['./plan-tarifario.component.css']
})
export class PlanTarifarioComponent implements OnInit {

  // Modal
  crearModalVisible = false;

  // Filtros (ERROR ya corregido 🔥)
  filtroTipoHabitacion: string = '';
  filtroTipoTarifa: string = '';
  filtroFechaDesde: string = '';
  filtroFechaHasta: string = '';

  // Lista de planes
  planes: any[] = [];

  // Modelo del formulario
  nuevoPlan = {
    nombre: '',
    precioNoche: null as number | null,
    tipoHabitacion: '',
    esFeriado: false,
    esFinDeSemana: false,
    fechaDesde: '',
    fechaHasta: '',
    tipo: '',
    estado: 'ACTIVO',
    iconClass: 'icon-tag'
  };

  constructor() {}

  ngOnInit(): void {
    // Mock inicial para que veas UI funcionando
    this.planes = [
      {
        nombre: 'Tarifa Estándar',
        precioNoche: 120,
        tipoHabitacion: 'Suite',
        tipo: 'entre-semana',
        fechaDesde: '2026-05-01',
        fechaHasta: '2026-06-01',
        estado: 'ACTIVO',
        iconClass: 'icon-tag'
      }
    ];
  }

  abrirCrearPlan(): void {
    this.crearModalVisible = true;
  }

  cerrarCrearPlan(): void {
    this.crearModalVisible = false;
    this.limpiarFormulario();
  }

  guardarPlan(): void {

    let tipo = 'entre-semana';

    if (this.nuevoPlan.esFeriado) {
      tipo = 'feriado';
    } else if (this.nuevoPlan.esFinDeSemana) {
      tipo = 'fin-de-semana';
    }

    this.planes.push({
      ...this.nuevoPlan,
      tipo,
      estado: 'ACTIVO',
      iconClass: this.getIcon(tipo)
    });

    this.cerrarCrearPlan();
  }

  private limpiarFormulario(): void {
    this.nuevoPlan = {
      nombre: '',
      precioNoche: null,
      tipoHabitacion: '',
      esFeriado: false,
      esFinDeSemana: false,
      fechaDesde: '',
      fechaHasta: '',
      tipo: '',
      estado: 'ACTIVO',
      iconClass: 'icon-tag'
    };
  }

  private getIcon(tipo: string): string {
    if (tipo === 'feriado') return 'icon-calendar';
    if (tipo === 'fin-de-semana') return 'icon-briefcase';
    return 'icon-tag';
  }
}