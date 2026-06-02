export interface HabitacionDisponible {
  id: number;
  numero: string;
  piso: number;
  tipoNombre: string;
  tipoId?: number;
  estado: string;
  imagenUrl?: string;
  precioPorNoche?: number;
  tarifa?: {
    precioPorNoche?: number;
    precio?: number;
  };
}

export interface ReservaDetalle {
  id: number;
  estado?: string;

  // Fechas (backend puede usar distintos nombres)
  fechaEntrada?: string;
  fechaSalida?: string;
  checkIn?: string;
  checkOut?: string;

  // Huésped simple (legacy)
  nombreHuesped?: string;
  documentoHuesped?: string;

  // Posibles estructuras anidadas (backend)
  cliente?: {
    nombre?: string;
    nombreCompleto?: string;
    documento?: string;
    email?: string;
    telefono?: string;
  };

  huesped?: {
    nombre?: string;
    documento?: string;
    email?: string;
    telefono?: string;
  };

  tipoHabitacion?: {
    id?: number;
    nombre?: string;
  };

  tipoHabitacionId?: number;
  tipoHabitacionNombre?: string;

  planTarifario?: {
    id?: number;
    nombre?: string;
    precioPorNoche?: number;
  };

  precioPorNoche?: number;
}

export interface FrontDeskCheckInVm {
  reserva: ReservaDetalle;
  habitacionesDisponibles: HabitacionDisponible[];
  noches: number;
  precioPorNoche: number;
  totalEstimado: number;
}
