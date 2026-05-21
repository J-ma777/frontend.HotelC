import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { TipoHabitacion } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TipoHabitacionService {

  private apiUrl = 'http://localhost:3030/tipo-habitaciones';

  constructor(private http: HttpClient) {}

  getAll(): Observable<TipoHabitacion[]> {
    return this.http.get<TipoHabitacion[]>(this.apiUrl);
  }

  create(data: Omit<TipoHabitacion, 'id'>): Observable<TipoHabitacion> {
    return this.http.post<TipoHabitacion>(this.apiUrl, data);
  }
}
