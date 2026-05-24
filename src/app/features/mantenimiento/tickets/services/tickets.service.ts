import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Ticket } from '../models/ticket.model';

@Injectable({
  providedIn: 'root'
})
export class TicketsService {
  private ticketsSubject = new BehaviorSubject<Ticket[]>([
    {
      id: 1,
      habitacion: { numero: '402', tipo: 'Junior Suite' },
      descripcion: 'Aire acondicionado no enfría adecuadamente tras 30 min de encendido.',
      reportadoPor: { id: 1, nombre: 'Sofia Martinez', cargo: 'Front Desk' },
      reportadoEn: '14 Oct, 09:15',
      estado: 'PENDIENTE',
      tiempoEstado: 'Hace 2 horas'
    },
    {
      id: 2,
      habitacion: { numero: '105', tipo: 'Standard Room' },
      descripcion: 'Fuga de agua en el grifo del lavabo principal.',
      reportadoPor: { id: 2, nombre: 'Carlos Ruiz', cargo: 'Housekeeping' },
      reportadoEn: '14 Oct, 08:30',
      estado: 'EN PROCESO',
      tiempoEstado: 'En atención'
    },
    {
      id: 3,
      habitacion: { numero: '211', tipo: 'Ocean View' },
      descripcion: 'Bombilla fundida en la lámpara de noche derecha.',
      reportadoPor: { id: 3, nombre: 'Marta Gomez', cargo: 'Housekeeping' },
      reportadoEn: '13 Oct, 18:00',
      estado: 'RESUELTO',
      resueltoEn: 'Resuelto: 13 Oct, 18:45'
    }
  ]);

  constructor() {}

  getTickets(): Observable<Ticket[]> {
    return this.ticketsSubject.asObservable();
  }

  createTicket(ticket: Omit<Ticket, 'id' | 'reportadoEn' | 'estado'>): void {
    const currentTickets = this.ticketsSubject.value;
    const now = new Date();
    const formattedDate = now.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) + `, ${now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    
    const newTicket: Ticket = {
      id: currentTickets.length + 1,
      habitacion: ticket.habitacion,
      descripcion: ticket.descripcion,
      reportadoPor: ticket.reportadoPor,
      reportadoEn: formattedDate,
      estado: 'PENDIENTE',
      tiempoEstado: 'Hace unos instantes'
    };

    this.ticketsSubject.next([newTicket, ...currentTickets]);
  }

  updateEstado(id: number, estado: 'PENDIENTE' | 'EN PROCESO' | 'RESUELTO'): void {
    const currentTickets = this.ticketsSubject.value;
    const updatedTickets = currentTickets.map(t => {
      if (t.id === id) {
        const now = new Date();
        const formattedDate = now.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) + `, ${now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
        return {
          ...t,
          estado,
          tiempoEstado: estado === 'EN PROCESO' ? 'En atención' : t.tiempoEstado,
          resueltoEn: estado === 'RESUELTO' ? `Resuelto: ${formattedDate}` : t.resueltoEn
        };
      }
      return t;
    });
    this.ticketsSubject.next(updatedTickets);
  }
}
