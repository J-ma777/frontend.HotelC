export interface Habitacion {
  numero: string;
  tipo: string;
}

export interface Empleado {
  id: number;
  nombre: string;
  cargo: string;
}

export interface Ticket {
  id: number;
  habitacion: Habitacion;
  descripcion: string;
  reportadoPor: Empleado;
  reportadoEn: string;
  estado: 'PENDIENTE' | 'EN PROCESO' | 'RESUELTO';
  tiempoEstado?: string;
  resueltoEn?: string;
}
