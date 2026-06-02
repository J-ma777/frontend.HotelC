import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { HabitacionDisponible, ReservaDetalle } from '../models/check-in.model';

@Injectable({
  providedIn: 'root'
})
export class CheckInService {
  private http = inject(HttpClient);

  private readonly RESERVAS_API = 'http://localhost:3030/reservas';
  private readonly HABITACIONES_API = 'http://localhost:3030/habitaciones';

  getReserva(id: number): Observable<ReservaDetalle> {
    return this.http.get<ReservaDetalle>(`${this.RESERVAS_API}/${id}`);
  }

  getHabitacionesDisponibles(inicio: string, fin: string): Observable<HabitacionDisponible[]> {
    const params = new HttpParams().set('inicio', inicio).set('fin', fin);

    return this.http.get<HabitacionDisponible[]>(`${this.HABITACIONES_API}/disponibles`, { params });
  }

  confirmarCheckIn(reservaId: number, habitacionId: number): Observable<void> {
    return this.http.put<void>(`${this.RESERVAS_API}/${reservaId}/checkin`, {
      habitacionId
    });
  }
}
