import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario, CrearUsuarioRequest } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private API_URL = 'http://localhost:3030/usuarios';

  constructor(private http: HttpClient) { }

  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.API_URL);
  }

  obtenerUsuarioPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.API_URL}/${id}`);
  }

  crearUsuario(request: CrearUsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(this.API_URL, request);
  }

  asignarRol(usuarioId: number, rolId: number): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.API_URL}/${usuarioId}/rol/${rolId}`, {});
  }
}