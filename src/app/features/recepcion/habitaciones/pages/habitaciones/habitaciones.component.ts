import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HabitacionesService } from '../../service/habitacion.service';
import { TipoHabitacionService } from '../../../tipos-habitacion/services/tipo-habitacion.service';

import { Habitacion } from '../../../../../core/models/habitacion.model';
import { HabitacionCreate } from '../../../../../core/models/habitacion-create.model';
import { TipoHabitacion } from '../../../../../core/models/tipo-habitacion.model';

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
  editandoId: number | null = null;

  nuevaHabitacion: HabitacionCreate = {
    numero: '',
    estado: 'DISPONIBLE',
    piso: 1,
    tipoId: null as any
  };

  constructor(
    private habService: HabitacionesService,
    private tipoService: TipoHabitacionService
  ) { }

  ngOnInit(): void {
    this.cargarHabitaciones();
    this.cargarTipos();
  }

  cargarHabitaciones() {
    this.habService.getAll().subscribe({
      next: (data: any) => this.habitaciones = data,
      error: (err: any) => console.error('Error cargando habitaciones', err)
    });
  }

  cargarTipos() {
    this.tipoService.getAll().subscribe({
      next: (data: any) => this.tipos = data,
      error: (err: any) => console.error('Error cargando tipos', err)
    });
  }

  guardar() {

    console.log('tipoId antes:', this.nuevaHabitacion.tipoId);

    if (!this.nuevaHabitacion.numero) {
      this.showError('El número de habitación es obligatorio');
      return;
    }

    if (!this.nuevaHabitacion.tipoId) {
      this.showError('Debes seleccionar un tipo de habitación válido');
      return;
    }

    if (this.editandoId) {
      this.habService.update(this.editandoId, this.nuevaHabitacion).subscribe({
        next: () => {
          this.showSuccess('Habitación actualizada correctamente');
          this.cargarHabitaciones();
          this.nuevaHabitacion = {
            numero: '',
            estado: 'DISPONIBLE',
            piso: 1,
            tipoId: null as any
          };
          this.editandoId = null;
        },
        error: (err: any) => this.handleError(err)
      });
    } else {
      this.habService.create(this.nuevaHabitacion).subscribe({
        next: () => {
          this.showSuccess('Habitación creada correctamente');
          this.cargarHabitaciones();
          this.nuevaHabitacion = {
            numero: '',
            estado: 'DISPONIBLE',
            piso: 1,
            tipoId: null as any
          };
        },
        error: (err: any) => this.handleError(err)
      });
    }
  }

  editar(h: Habitacion) {
    this.nuevaHabitacion = {
      numero: h.numero,
      estado: h.estado,
      piso: h.piso,
      tipoId: null as any // no usar tipoNombre
    };
    this.editandoId = h.id;
  }

  eliminar(id: number) {
    if (!confirm('¿Eliminar habitación?')) return;

    this.habService.delete(id).subscribe({
      next: () => {
        this.showSuccess('Habitación eliminada');
        this.cargarHabitaciones();
      },
      error: (err: any) => this.handleError(err)
    });
  }



  handleError(error: any) {
    if (error.status === 500) {
      if (error.error?.detail?.includes('tipo_habitacion_id')) {
        this.showError('Debes seleccionar un tipo de habitación válido');
        return;
      }
      this.showError('Error interno del servidor. Intenta nuevamente.');
      return;
    }

    if (error.status === 403) {
      this.showError('No tienes permisos para realizar esta acción');
      return;
    }

    this.showError('Ocurrió un error inesperado');
  }

  showError(message: string) {
    alert(message);
  }

  showSuccess(message: string) {
    alert(message);
  }
}
