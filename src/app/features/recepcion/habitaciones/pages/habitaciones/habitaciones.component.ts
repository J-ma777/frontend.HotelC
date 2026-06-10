import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { HabitacionesService } from '../../service/habitacion.service';
import { TipoHabitacionService } from '../../../tipos-habitacion/services/tipo-habitacion.service';
import { AuthService } from '../../../../../core/services/auth.service';

import { HabitacionCreate } from '../../../../../core/models/habitacion-create.model';
import { TipoHabitacion } from '../../../../../core/models/tipo-habitacion.model';
import { HabitacionMapa } from '../../../front-desk/models/habitacion-mapa.model';

@Component({
  selector: 'app-habitaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './habitaciones.component.html',
  styleUrls: ['./habitaciones.component.css']
})
export class HabitacionesComponent implements OnInit {

  private authService = inject(AuthService);
  private router = inject(Router);

  habitaciones: HabitacionMapa[] = [];
  tipos: TipoHabitacion[] = [];
  editandoId: number | null = null;

  nuevaHabitacion: HabitacionCreate = {
    numero: '',
    piso: 1,
    tipoHabitacionId: null
  };

  constructor(
    private habService: HabitacionesService,
    private tipoService: TipoHabitacionService
  ) { }

  // PERMISOS
  canCreate(): boolean {
    return this.authService.hasPermission('HABITACION_CREAR');
  }

  canEdit(h: HabitacionMapa): boolean {
    return this.authService.hasPermission('HABITACION_EDITAR')
      && h.estado !== 'OCUPADA';
  }

  canDelete(h: HabitacionMapa): boolean {
    return this.authService.hasPermission('HABITACION_ELIMINAR')
      && h.estado !== 'OCUPADA';
  }

  // INIT
  ngOnInit(): void {
    this.cargarHabitaciones();
    this.cargarTipos();
  }

  // CARGA LISTADO
  cargarHabitaciones() {
    this.habService.getMapa().subscribe({
      next: (data: HabitacionMapa[]) => this.habitaciones = data,
      error: (err) => console.error('Error cargando habitaciones', err)
    });
  }

  // TIPOS
  cargarTipos() {
    this.tipoService.getAll().subscribe({
      next: (data: TipoHabitacion[]) => this.tipos = data,
      error: (err) => console.error('Error cargando tipos', err)
    });
  }

  // GUARDAR / EDITAR
  guardar() {

    if (!this.nuevaHabitacion.numero) {
      this.showError('El número de habitación es obligatorio');
      return;
    }

    if (!this.nuevaHabitacion.tipoHabitacionId) {
      this.showError('Debes seleccionar un tipo de habitación válido');
      return;
    }

    if (this.editandoId) {
      this.habService.update(this.editandoId, this.nuevaHabitacion).subscribe({
        next: () => {
          this.showSuccess('Habitación actualizada correctamente');
          this.cargarHabitaciones();
          this.resetForm();
        },
        error: (err) => this.handleError(err)
      });

    } else {

      console.log('NUEVA HABITACION:', this.nuevaHabitacion);
      this.habService.create(this.nuevaHabitacion).subscribe({
        next: () => {
          this.showSuccess('Habitación creada correctamente');
          this.cargarHabitaciones();
          this.resetForm();
        },
        error: (err) => this.handleError(err)
      });

    }
  }

  // EDITAR
  editar(h: HabitacionMapa) {

    this.nuevaHabitacion = {
      numero: h.numero,
      piso: h.piso,
      tipoHabitacionId: h.tipoId
    };

    this.editandoId = h.id;
  }

  // ELIMINAR
  eliminar(id: number) {
    if (!confirm('¿Eliminar habitación?')) return;

    this.habService.delete(id).subscribe({
      next: () => {
        this.showSuccess('Habitación eliminada');
        this.cargarHabitaciones();
      },
      error: (err) => this.handleError(err)
    });
  }

  // RESET LIMPIO
  resetForm() {
    this.nuevaHabitacion = {
      numero: '',
      piso: 1,
      tipoHabitacionId: null
    };
    this.editandoId = null;
  }

  // ERRORES CENTRALIZADOS
  handleError(error: any) {

    // 🔴 Conflictos de negocio (lo más importante)
    if (error.status === 409) {
      this.showError(error.error?.message || 'Conflicto en la operación');
      return;
    }

    // 🟡 permisos
    if (error.status === 403) {
      this.showError('No tienes permisos para realizar esta acción');
      return;
    }

    // ⚠️ validaciones
    if (error.status === 400) {
      this.showError(error.error?.message || 'Datos inválidos');
      return;
    }

    // 💥 fallback
    this.showError('Error inesperado del sistema');

  }

  // MENSAJES
  showError(message: string) {
    console.error('❌', message);
    alert(message);
  }

  showSuccess(message: string) {
    console.log('✅', message);
    alert(message);
  }

  // ACCIONES POR ESTADO (LISTO PARA UI PRO)

  irALimpieza(h: HabitacionMapa) {
    this.router.navigate(['/recepcion/housekeeping/limpieza', h.id]);
  }

  verProgreso(h: HabitacionMapa) {
    this.router.navigate(['/recepcion/housekeeping/progreso', h.id]);
  }

  aprobar(h: HabitacionMapa) {
    console.log('Aprobar habitación:', h.id);
    // 🔥 aquí luego conectas backend
  }

  crearReserva(h: HabitacionMapa) {
    this.router.navigate(['/recepcion/reservas/nueva'], {
      state: { habitacionId: h.id }
    });
  }

  verFolio(h: HabitacionMapa) {
    if (h.reservaId) {
      this.router.navigate(['/recepcion/reservas', h.reservaId, 'folio']);
    }
  }
}
