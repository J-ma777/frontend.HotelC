import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservasService } from '../../services/reservas.service';
import { TipoHabitacionService } from '../../../tipos-habitacion/services/tipo-habitacion.service';
import { TipoHabitacion } from '../../../../../core/models/tipo-habitacion.model';
import { PlanTarifarioService } from '../../../plan-tarifario/services/plan-tarifario.service';
import { PlanTarifario } from '../../../../../core/models/plan-tarifario.model';
import { CrearReservaRequest } from '../../types/reserva.types';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, distinctUntilChanged, finalize, of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-nueva-reserva',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './nueva-reserva.component.html',
  styleUrl: './nueva-reserva.component.css'
})
export class NuevaReservaComponent implements OnInit {

  private reservaService = inject(ReservasService);
  private tipoHabitacionService = inject(TipoHabitacionService);
  private planTarifarioService = inject(PlanTarifarioService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  loading = false;
  error: string | null = null;
  cargandoPlanes = false;

  tiposHabitacion: TipoHabitacion[] = [];
  planesTarifarios: PlanTarifario[] = [];

  form = this.fb.nonNullable.group({
    fechaEntrada: ['', Validators.required],
    fechaSalida: ['', Validators.required],
    cantidadHuespedes: [1, Validators.required],
    nombreHuesped: ['', Validators.required],
    documentoHuesped: ['', Validators.required],
    tipoHabitacionId: ['', Validators.required],
    planTarifarioId: ['', Validators.required]
  });

  ngOnInit(): void {
    this.tipoHabitacionService.getAll().subscribe({
      next: (data: TipoHabitacion[]) => {
        this.tiposHabitacion = data;
      },
      error: (err: unknown) => {
        console.error('❌ Error al obtener tipos de habitación:', err);
      }
    });

    // Deshabilitado hasta que se seleccione tipo de habitación
    this.form.controls.planTarifarioId.disable({ emitEvent: false });

    this.form.controls.tipoHabitacionId.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        distinctUntilChanged(),
        tap(() => {
          // Reset del select de plan al cambiar tipo
          this.planesTarifarios = [];
          this.form.controls.planTarifarioId.reset('', { emitEvent: false });
          this.form.controls.planTarifarioId.disable({ emitEvent: false });
        }),
        switchMap((tipoId) => {
          if (!tipoId) {
            this.cargandoPlanes = false;
            return of([] as PlanTarifario[]);
          }

          this.cargandoPlanes = true;
          return this.planTarifarioService.getByTipo(Number(tipoId)).pipe(
            catchError((err) => {
              console.error('❌ Error al obtener planes por tipo:', err);
              return of([] as PlanTarifario[]);
            }),
            finalize(() => {
              this.cargandoPlanes = false;
            })
          );
        })
      )
      .subscribe((data: PlanTarifario[]) => {
        this.planesTarifarios = data;
        if (data.length > 0) {
          this.form.controls.planTarifarioId.enable({ emitEvent: false });
        }
      });
  }

  guardar() {
    if (this.form.invalid) {
      this.error = 'Por favor completa todos los campos';
      return;
    }

    this.loading = true;
    this.error = null;

    const raw = this.form.getRawValue();

    const tipoHabitacionId = Number(raw.tipoHabitacionId);
    const planTarifarioId = Number(raw.planTarifarioId);
    if (!Number.isFinite(tipoHabitacionId) || tipoHabitacionId <= 0) {
      this.error = 'Selecciona un tipo de habitación válido';
      this.loading = false;
      return;
    }
    if (!Number.isFinite(planTarifarioId) || planTarifarioId <= 0) {
      this.error = 'Selecciona un plan tarifario válido';
      this.loading = false;
      return;
    }

    const payload: CrearReservaRequest = {
      fechaEntrada: raw.fechaEntrada,
      fechaSalida: raw.fechaSalida,
      cantidadHuespedes: Number(raw.cantidadHuespedes),
      nombreHuesped: raw.nombreHuesped,
      documentoHuesped: raw.documentoHuesped,
      tipoHabitacionId,
      planTarifarioId
    };

    console.log('Payload reserva:', payload);

    this.reservaService.crearReserva(payload).subscribe({
      next: (res: any) => {
        console.log('✅ Reserva creada exitosamente:', res);
        this.router.navigate(['/recepcion/reservas']);
      },
      error: (err: any) => {
        console.error('❌ Error al crear la reserva:', err);
        console.error('Error status:', err.status);
        console.error('Error body:', err.error);
        console.log('Form value (debug):', this.form.value);
        this.error = 'Error al crear la reserva: ' + (err.error?.message || err.message || 'Intenta de nuevo');
        this.loading = false;
      }
    });
  }

  cancelar() {
    this.router.navigate(['/recepcion/reservas']);
  }
}
