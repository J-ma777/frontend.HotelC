import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CrearReservaRequest, Reserva } from '../types/reserva.types';

@Injectable({
  providedIn: 'root'
})
export class ReservasService {

  private http = inject(HttpClient);

  private readonly API_URL = 'http://localhost:3030/reservas';

  // CHECK-IN 
  realizarCheckIn(id: number, habitacionId: number): Observable<void> {
    const url = `${this.API_URL}/${id}/checkin`;

    console.log('[ReservasService] Check-in:', url, { habitacionId });

    return this.http.put<void>(url, {
      habitacionId
    });
  }

  // LISTAR
  getReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.API_URL);
  }

  // DETALLE
  getReservaById(id: number): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.API_URL}/${id}`);
  }

  // CREAR
  crearReserva(data: CrearReservaRequest): Observable<Reserva> {
    console.log('📤 [ReservasService] POST:', this.API_URL, data);
    return this.http.post<Reserva>(this.API_URL, data);
  }

  // CHECKOUT
  checkOut(id: number): Observable<void> {
    const url = `${this.API_URL}/${id}/checkout`;

    console.log('[ReservasService] Checkout:', url);

    return this.http.put<void>(url, {});
  }

  // CONFIRMAR
  confirmarReserva(id: number): Observable<void> {
    const url = `${this.API_URL}/${id}/confirmar`;

    console.log('[ReservasService] Confirmar:', url);

    return this.http.put<void>(url, {});
  }

  // CANCELAR
  cancelarReserva(id: number): Observable<void> {
    const url = `${this.API_URL}/${id}/cancelar`;

    console.log('[ReservasService] Cancelar:', url);

    return this.http.put<void>(url, {});
  }
}