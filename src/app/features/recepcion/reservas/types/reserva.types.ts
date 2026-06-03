export interface Reserva {
  id: number;
  nombreHuesped: string;
  documentoHuesped: string;
  fechaEntrada: string;
  fechaSalida: string;
  estado: string;
  cantidadHuespedes: number;
  categoria?: string;
  tipoHabitacionId: number;
  planTarifarioId?: number;
}

// DTO de creación (backend: CrearReservaRequest)
export interface CrearReservaRequest {
  fechaEntrada: string;
  fechaSalida: string;
  cantidadHuespedes: number;
  nombreHuesped: string;
  documentoHuesped: string;
  tipoHabitacionId: number;
  planTarifarioId: number;
}

export interface CheckinRequest {
  habitacionId: number;
}