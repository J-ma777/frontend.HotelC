export interface HabitacionCreate {
  numero: string;
  estado: string;
  piso: number;
  tipoId: number;
  equipamiento?: string[];
}
