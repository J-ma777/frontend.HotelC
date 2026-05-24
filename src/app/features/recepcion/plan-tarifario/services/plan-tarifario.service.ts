import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, tap, catchError } from 'rxjs';

import { PlanTarifario, PlanTarifarioCreate } from '../../../../core/models/plan-tarifario.model';

@Injectable({
  providedIn: 'root'
})
export class PlanTarifarioService {

  private readonly apiUrl = 'https://backend-hotel-2xhw.onrender.com/plan-tarifarios';

  constructor(private http: HttpClient) {}

  // Listado
  getAll(): Observable<PlanTarifario[]> {
    return this.http.get<PlanTarifario[]>(this.apiUrl).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  // Crear con manejo completo
  create(data: PlanTarifarioCreate): Observable<PlanTarifario> {

    const payload = {
      nombre: data.nombre,
      precioPorNoche: data.precioPorNoche,
      esFinDeSemana: data.esFinDeSemana,
      esFeriado: data.esFeriado,
      validoDesde: data.validoDesde,
      validoHasta: data.validoHasta,
      tipoHabitacionId: data.tipoHabitacionId
    };

    return this.http.post<PlanTarifario>(this.apiUrl, payload).pipe(

      // Éxito
      tap(() => {
        console.log('✅ Plan tarifario creado correctamente');
      }),

      // Error
      catchError((error) => this.handleError(error))
    );
  }

  // Mapper centralizado de errores
    private handleError(error: HttpErrorResponse) {

    let mensaje = 'Error inesperado';

    // 1. PRIORIDAD: mensaje de negocio real
    if (error.error?.detail) {
        mensaje = error.error.detail;
    }

    // 2. mensaje standard backend
    else if (error.error?.message) {
        mensaje = error.error.message;
    }

    // 3. string plano
    else if (typeof error.error === 'string') {
        mensaje = error.error;
    }

    // 4. fallback
    else {
        if (error.status === 0) {
        mensaje = 'No se pudo conectar con el servidor';
        } else if (error.status === 400) {
        mensaje = 'Solicitud inválida';
        } else if (error.status === 403) {
        mensaje = 'No tienes permisos';
        } else if (error.status === 500) {
        mensaje = 'Error interno del servidor';
        }
    }

    console.error('❌ Error HTTP:', error);

    return throwError(() => new Error(mensaje));
    }
}