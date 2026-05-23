export interface Reserva {
  id: number;
  nombreHuesped: string;
  documentoHuesped: string;
  fechaEntrada: string;
  fechaSalida: string;
  estado: string;
  cantidadHuespedes: number;
  categoria?: string;
  tipoHabitacionId?: number;
}

export interface CheckinRequest {
  habitacionId: number;
}
