import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Transaccion } from '../models/transaccion.model';
import { Saldo } from '../models/saldo.model';

@Injectable({
  providedIn: 'root'
})
export class FolioService {
  private apiUrl = 'http://localhost:3030';

  constructor(private http: HttpClient) { }

  getTransacciones(reservaId: number): Observable<Transaccion[]> {
    return this.http.get<Transaccion[]>(`${this.apiUrl}/folios/reservas/${reservaId}/transacciones`);
  }

  getSaldo(reservaId: number): Observable<Saldo> {
    return this.http.get<Saldo>(`${this.apiUrl}/folios/reservas/${reservaId}/saldo`);
  }

  registrarConsumo(reservaId: number, consumo: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/folios/reservas/${reservaId}/consumos`, consumo);
  }

  registrarPago(reservaId: number, pago: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/folios/reservas/${reservaId}/pagos`, pago);
  }

  aplicarDescuento(reservaId: number, descuento: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/folios/reservas/${reservaId}/descuentos`, descuento);
  }

  realizarCheckout(reservaId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/reservas/${reservaId}/checkout`, {});
  }
}
