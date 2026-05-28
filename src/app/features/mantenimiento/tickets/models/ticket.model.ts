import { Habitacion } from '../../../../core/models/habitacion.model';

export type TicketEstado = 'ABIERTO' | 'EN_PROCESO' | 'RESUELTO';

export interface TicketCreateRequest {
  habitacionId: number;
  descripcion: string;
}

export interface TicketApiResponse {
  id: number;
  habitacionId?: number;
  descripcion: string;
  estado: TicketEstado | 'PENDIENTE';
  reportadoEn?: string;
  habitacion?: Habitacion;
  habitacionNumero?: string;
  habitacionTipo?: string;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface Ticket {
  id: number;
  habitacionId: number;
  descripcion: string;
  estado: TicketEstado;
  habitacionNumero: string;
  habitacionTipo: string;
  reportadoEn?: string;
  creadoEn?: string;
  actualizadoEn?: string;
}
