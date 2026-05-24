export interface PlanTarifarioTipoHabitacion {
  id: number;
  nombre: string;
}

export interface PlanTarifario {
  id: number;
  nombre: string;
  precioPorNoche: number;
  esFinDeSemana: boolean;
  esFeriado: boolean;
  validoDesde: string;
  validoHasta: string;
  tipoHabitacionNombre: string;
  activo: boolean;
}

export interface PlanTarifarioCreate {
  nombre: string;
  precioPorNoche: number | null;
  esFinDeSemana: boolean;
  esFeriado: boolean;
  validoDesde: string;
  validoHasta: string;
  tipoHabitacionId: number | null;
}