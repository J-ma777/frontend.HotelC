import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Habitacion } from '../../../../core/models/habitacion.model';
import { HabitacionCreate } from '../../../../core/models/habitacion-create.model';
import { HabitacionMapa } from '../../../recepcion/front-desk/models/habitacion-mapa.model';

@Injectable({
  providedIn: 'root'
})
export class HabitacionesService {

  private apiUrl = 'http://localhost:3030/habitaciones';

  constructor(private http: HttpClient) { }

  // GET
  getAll(): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(this.apiUrl);
  }

  getMapa(): Observable<HabitacionMapa[]> {
    return this.http.get<HabitacionMapa[]>(`${this.apiUrl}/mapa`);
  }

  getDisponiblesMantenimiento(): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(`${this.apiUrl}/disponibles-mantenimiento`);
  }

  getDisponiblesPorTipo(tipoId: number, inicio: string, fin: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/disponibles?tipoHabitacionId=${tipoId}&fechaInicio=${inicio}&fechaFin=${fin}`);
  }

  // POST
  create(data: HabitacionCreate): Observable<Habitacion> {

    console.log('CREATE → payload:', data);
    return this.http.post<Habitacion>(this.apiUrl, data);
  }

  // PUT
  update(id: number, data: HabitacionCreate): Observable<Habitacion> {

    console.log('UPDATE → payload:', data);
    return this.http.put<Habitacion>(`${this.apiUrl}/${id}`, data);
  }

  // PUT
  cambiarEstadoHabitacion(id: number, estado: string) {
    return this.http.put(
      `${this.apiUrl}/${id}/estado`,
      null,
      { params: { estado } }
    );
  }


  // DELETE
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}