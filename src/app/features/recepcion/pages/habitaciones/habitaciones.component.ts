import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HabitacionesService } from '../../../../core/services/habitacion.service';
import { TipoHabitacionService } from '../../../../core/services/tipo-habitacion.service';

import { Habitacion } from '../../../../core/models/habitacion.model';
import { HabitacionCreate } from '../../../../core/models/habitacion-create.model';
import { TipoHabitacion } from '../../../../core/models/tipo-habitacion.model';

@Component({
  selector: 'app-habitaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './habitaciones.component.html',
  styleUrls: ['./habitaciones.component.css']
})
export class HabitacionesComponent implements OnInit {

  habitaciones: Habitacion[] = [];
  tipos: TipoHabitacion[] = [];

  availableEquipamiento: { key: string; label: string }[] = [
    { key: 'minibar', label: 'Minibar' },
    { key: 'wifi', label: 'Wi‑Fi' },
    { key: 'smartTv', label: 'Smart TV' },
    { key: 'jacuzzi', label: 'Jacuzzi' }
  ];

  nuevaHabitacion: HabitacionCreate = {
    numero: '',
    estado: 'DISPONIBLE',
    piso: 1,
    tipoId: 0,
    equipamiento: []
  };

  constructor(
    private habService: HabitacionesService,
    private tipoService: TipoHabitacionService
  ) {}

  ngOnInit(): void {
    this.cargarHabitaciones();
    this.cargarTipos();
  }

  cargarHabitaciones() {
    this.habService.getAll().subscribe({
      next: data => this.habitaciones = data,
      error: err => console.error('Error cargando habitaciones', err)
    });
  }

  cargarTipos() {
    this.tipoService.getAll().subscribe({
      next: data => this.tipos = data,
      error: err => console.error('Error cargando tipos', err)
    });
  }

  guardar() {
    if (!this.nuevaHabitacion.numero || !this.nuevaHabitacion.tipoId) {
      alert('Completa los campos');
      return;
    }

    this.habService.create(this.nuevaHabitacion).subscribe({
      next: () => {
        this.cargarHabitaciones();

        this.nuevaHabitacion = {
          numero: '',
          estado: 'DISPONIBLE',
          piso: 1,
          tipoId: 0
        };
      },
      error: err => console.error('Error creando habitación', err)
    });
  }

  toggleEquipamiento(key: string, checked: boolean) {
    const eq = this.nuevaHabitacion.equipamiento || [];
    if (checked) {
      if (!eq.includes(key)) eq.push(key);
    } else {
      const idx = eq.indexOf(key);
      if (idx >= 0) eq.splice(idx, 1);
    }
    this.nuevaHabitacion.equipamiento = eq;
  }
}
