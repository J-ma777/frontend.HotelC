import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Reserva {  
id: number;
  nombreHuesped: string;
  documentoHuesped: string;
  fechaEntrada: string;
  fechaSalida: string;
  estado: string;
  cantidadHuespedes: number;

}

@Injectable({
  providedIn: 'root'
})
export class ReservaService {

  private http = inject(HttpClient);

  private readonly API_URL = 'http://localhost:3030/reservas'; // Ajustar si usas environment

  getReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.API_URL);
  }

  getReservaById(id: number): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.API_URL}/${id}`);
  }

  crearReserva(data: any): Observable<any> {
    console.log('📤 [ReservaService] Enviando POST a', this.API_URL, 'con datos:', data);
    return this.http.post(this.API_URL, data);
  }

  checkIn(id: number): Observable<any> {
    return this.http.put(`${this.API_URL}/${id}/checkin`, {});
  }

  checkOut(id: number): Observable<any> {
    return this.http.put(`${this.API_URL}/${id}/checkout`, {});
  }

  cancelarReserva(id: number): Observable<any> {
    return this.http.put(`${this.API_URL}/${id}/cancelar`, {});
  }
}