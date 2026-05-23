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

  buscarDisponibles(inicio: string, fin: string): Observable<HabitacionDisponible[]> {

    const params = new HttpParams()
      .set('inicio', inicio)
      .set('fin', fin);

    return this.http.get<HabitacionDisponible[]>(
      `${this.API}/disponibles`,
      { params }
    );
  }
}