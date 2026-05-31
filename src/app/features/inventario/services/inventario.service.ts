import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ArticuloInventario } from '../models/articulo-inventario.model';
import { AjusteStockRequest } from '../models/ajuste-stock-request.model';
import { MovimientoRequest } from '../models/movimiento-request.model';
import { MovimientoResponse } from '../models/movimiento.model';

@Injectable({
	providedIn: 'root'
})
export class InventarioService {

	private readonly apiUrl = 'http://localhost:3030/inventario';

	constructor(private http: HttpClient) {}

	getArticulo(articuloId: number): Observable<ArticuloInventario> {
		return this.http.get<ArticuloInventario>(`${this.apiUrl}/articulo/${articuloId}`);
	}

	getAlertasStockMinimo(): Observable<ArticuloInventario[]> {
		return this.http.get<ArticuloInventario[]>(`${this.apiUrl}/alertas/stock-minimo`);
	}

	registrarEntrada(request: MovimientoRequest): Observable<MovimientoResponse> {
		return this.http.post<MovimientoResponse>(`${this.apiUrl}/entrada`, request);
	}

	registrarSalida(request: MovimientoRequest): Observable<MovimientoResponse> {
		return this.http.post<MovimientoResponse>(`${this.apiUrl}/salida`, request);
	}

	registrarMovimiento(tipo: 'ENTRADA' | 'SALIDA', request: MovimientoRequest): Observable<MovimientoResponse> {
		const endpoint = tipo === 'SALIDA' ? 'salida' : 'entrada';
		return this.http.post<MovimientoResponse>(`${this.apiUrl}/${endpoint}`, request);
	}

	ajustarStock(request: AjusteStockRequest): Observable<MovimientoResponse> {
		return this.http.post<MovimientoResponse>(`${this.apiUrl}/ajuste`, request);
	}
}
