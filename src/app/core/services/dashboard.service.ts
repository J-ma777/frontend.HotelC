import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardResponse {
  ingresos: number;
  ocupacion: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = 'http://localhost:3030/reservas/dashboard';

  constructor(private http: HttpClient) {}

  obtenerDashboard(inicio: string, fin: string): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(this.apiUrl, {
      params: { inicio, fin }
    });
  }
}