import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { Ticket, TicketApiResponse, TicketCreateRequest, TicketEstado } from '../models/ticket.model';

@Injectable({
	providedIn: 'root'
})
export class TicketService {
	private readonly apiUrl = 'http://localhost:3030/mantenimiento';
	private readonly ticketsSubject = new BehaviorSubject<Ticket[]>([]);

	tickets$ = this.ticketsSubject.asObservable();

	constructor(private http: HttpClient) {}

	getTickets(): Observable<Ticket[]> {
		return this.http.get<TicketApiResponse[]>(this.apiUrl).pipe(
			map(tickets => tickets.map(ticket => this.normalizarTicket(ticket))),
			tap(tickets => this.ticketsSubject.next(tickets))
		);
	}

	createTicket(data: TicketCreateRequest): Observable<Ticket> {
		return this.http.post<TicketApiResponse>(this.apiUrl, data).pipe(
			map(ticket => this.normalizarTicket(ticket)),
			tap(ticketCreado => {
				const ticketsActuales = this.ticketsSubject.value;
				this.ticketsSubject.next([ticketCreado, ...ticketsActuales]);
			})
		);
	}

	marcarEnProceso(id: number): Observable<void> {
		return this.http.put<void>(`${this.apiUrl}/${id}/en-proceso`, {}).pipe(
			tap(() => this.actualizarEstadoLocal(id, 'EN_PROCESO'))
		);
	}

	resolver(id: number): Observable<void> {
		return this.http.put<void>(`${this.apiUrl}/${id}/resolver`, {}).pipe(
			tap(() => this.actualizarEstadoLocal(id, 'RESUELTO'))
		);
	}

	private actualizarEstadoLocal(id: number, estado: TicketEstado): void {
		const ticketsActuales = this.ticketsSubject.value;
		this.ticketsSubject.next(
			ticketsActuales.map(ticket => ticket.id === id ? { ...ticket, estado } : ticket)
		);
	}

	private normalizarTicket(ticket: TicketApiResponse): Ticket {
		const estadoNormalizado = ticket.estado === 'PENDIENTE' ? 'ABIERTO' : ticket.estado;
		const habitacion = ticket.habitacion;

		return {
			id: ticket.id,
			habitacionId: ticket.habitacionId ?? habitacion?.id ?? 0,
			descripcion: ticket.descripcion,
			estado: estadoNormalizado as TicketEstado,
			habitacionNumero: ticket.habitacionNumero ?? habitacion?.numero ?? String(ticket.habitacionId ?? habitacion?.id ?? ''),
			habitacionTipo: ticket.habitacionTipo ?? habitacion?.tipoNombre ?? '',
			reportadoEn: ticket.reportadoEn ?? ticket.creadoEn,
			creadoEn: ticket.creadoEn,
			actualizadoEn: ticket.actualizadoEn
		};
	}
}

export { TicketService as TicketsService };