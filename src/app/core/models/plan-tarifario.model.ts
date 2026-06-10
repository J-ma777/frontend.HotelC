export interface PlanTarifarioTipoHabitacion {
  id: number;
  nombre: string;
}

export type TipoTarifa = 'WEEKDAY' | 'WEEKEND' | 'HOLIDAY';

export interface PlanTarifario {
  id: number;
  nombre: string;
  precioPorNoche: number;
  tipoTarifa: TipoTarifa;
  validoDesde: string;
  validoHasta: string;
  tipoHabitacionNombre: string;
  activo: boolean;
}

export interface PlanTarifarioCreate {
  nombre: string;
  precioPorNoche: number | null;
  tipoTarifa: TipoTarifa;
  validoDesde: string;
  validoHasta: string;
  tipoHabitacionId: number | null;
}