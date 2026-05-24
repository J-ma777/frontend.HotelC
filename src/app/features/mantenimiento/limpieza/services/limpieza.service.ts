import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegistroLimpieza } from '../models/registro-limpieza.model';

@Injectable({
    providedIn: 'root'
})
export class LimpiezaService {

    private apiUrl = 'https://backend-hotel-2xhw.onrender.com/limpieza';

    constructor(private http: HttpClient) { }

    getByHabitacion(id: number): Observable<RegistroLimpieza[]> {
        return this.http.get<RegistroLimpieza[]>(
            `${this.apiUrl}/habitacion/${id}`
        );
    }

    registrarLimpieza(
        habitacionId: number,
        estadoNuevo: string,
        notas?: string
    ) {
        return this.http.post(
            `${this.apiUrl}/habitacion/${habitacionId}`,
            {},
            {
                params: {
                    estadoNuevo,
                    notas: notas ?? ''
                }
            }
        );
    }
}