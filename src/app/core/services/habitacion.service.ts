import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Habitacion } from '../models/habitacion.model';
import { HabitacionCreate } from '../models/habitacion-create.model';

@Injectable({
  providedIn: 'root'
})
export class HabitacionesService {

  private apiUrl = 'http://localhost:3030/habitaciones';

  constructor(private http: HttpClient) {}

  // ✅ GET
  getAll(): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(this.apiUrl);
  }

  // ✅ POST
  create(data: HabitacionCreate): Observable<Habitacion> {

    const payload = {
      numero: data.numero,
      estado: data.estado,
      piso: data.piso,
      tipo: {
        id: data.tipoId
      },
      equipamiento: (data as any).equipamiento || []
    };

    return this.http.post<Habitacion>(this.apiUrl, payload);
  }
}