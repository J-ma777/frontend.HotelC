import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitacionesService } from '../../habitaciones/service/habitacion.service';
import { HabitacionMapa } from '../models/habitacion-mapa.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.css']
})
export class MapaComponent implements OnInit {

  habitaciones: HabitacionMapa[] = [];
  habitacionesAgrupadas: Record<number, HabitacionMapa[]> = {};
  loading = true;
  pisoSeleccionado: number | null = null;

  constructor(
    private habitacionesService: HabitacionesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.habitacionesService.getMapa().subscribe({
      next: (data) => {
        this.habitaciones = data;
        this.agruparPorPiso();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  agruparPorPiso() {
    this.habitacionesAgrupadas = this.habitaciones.reduce((acc, hab) => {
      const piso = hab.piso;

      if (!acc[piso]) {
        acc[piso] = [];
      }

      acc[piso].push(hab);

      return acc;
    }, {} as Record<number, HabitacionMapa[]>);

    // Seleccionar automáticamente el primer piso
    const pisos = Object.keys(this.habitacionesAgrupadas)
      .map(Number)
      .sort((a, b) => a - b);

    this.pisoSeleccionado = pisos[0];

    console.log(this.habitacionesAgrupadas);
  }

  // NUEVO: método para click en card
  onHabitacionClick(h: HabitacionMapa) {

    switch (h.estado) {
  
      case 'DISPONIBLE':
        this.router.navigate(['/recepcion/reservas/nueva'], {
          state: { habitacionId: h.id}
        });
        break;
  
      case 'OCUPADA':
        if (h.reservaId) {
          this.router.navigate(['/recepcion/reservas', h.reservaId, 'folio']);
        } else {
          console.warn('Habitación ocupada sin reserva asociada', h);
        }
        break;
  
      case 'SUCIA':
        this.router.navigate([
          '/recepcion/housekeeping/limpieza',
          h.id
        ]);
        break;

      case 'LIMPIANDO':
        this.router.navigate([
          '/recepcion/housekeeping/progreso',
          h.id
        ]);
        break;
      
      case 'INSPECCIONADA':
        this.router.navigate(['/recepcion/housekeeping/limpieza', h.id]);
        break;
  
      default:
        this.router.navigate(['/recepcion/reservas/habitaciones']);
        break;
    }
  
  }
}