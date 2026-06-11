import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Permiso } from '../models/permiso.model';

@Injectable({
  providedIn: 'root'
})
export class PermisoService {
  private API_URL = 'http://localhost:3030/permisos';

  constructor(private http: HttpClient) { }

  obtenerPermisos(): Observable<Permiso[]> {
    return this.http.get<Permiso[]>(this.API_URL);
  }
}