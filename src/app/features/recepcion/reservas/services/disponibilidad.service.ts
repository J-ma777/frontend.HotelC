import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { HabitacionDisponible } from '../types/habitacion.types';

@Injectable({
  providedIn: 'root'
})
export class DisponibilidadService {

  private readonly API = 'http://localhost:3030/habitaciones';

  constructor(private http: HttpClient) { }

  buscarDisponibles(tipoId: number, inicio: string, fin: string): Observable<HabitacionDisponible[]> {

    const params = new HttpParams()
      .set('tipoHabitacionId', tipoId)
      .set('fechaInicio', inicio)
      .set('fechaFin', fin);

    return this.http.get<HabitacionDisponible[]>(
      `${this.API}/disponibles`,
      { params }
    );
  }

}