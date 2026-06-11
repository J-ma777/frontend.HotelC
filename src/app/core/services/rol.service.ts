import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rol } from '../models/rol.model';

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private API_URL = 'http://localhost:3030/roles';

  constructor(private http: HttpClient) { }

  obtenerRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.API_URL);
  }

  obtenerRolPorId(id: number): Observable<Rol> {
    return this.http.get<Rol>(`${this.API_URL}/${id}`);
  }

  crearRol(rol: { nombre: string; descripcion: string }): Observable<Rol> {
    return this.http.post<Rol>(this.API_URL, rol);
  }

  asignarPermisos(rolId: number, permisosIds: number[]): Observable<Rol> {
    return this.http.put<Rol>(`${this.API_URL}/${rolId}/permisos`, permisosIds);
  }
}