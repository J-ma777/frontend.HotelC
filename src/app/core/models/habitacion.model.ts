import { TipoHabitacion } from './tipo-habitacion.model';

export interface Habitacion {
  id: number;
  numero: string;
  estado: string;
  piso: number;
  tipo: TipoHabitacion;
}