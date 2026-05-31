export interface Movimiento {
  id: number;
  fecha: string;      // ISO (viene del backend)
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  cantidad: number;
  motivo: string;
  usuarioNombre?: string;
}

export interface MovimientoResponse {
  id: number;
  tipo: string;
  cantidad: number;
  motivo: string;
  fecha: string;
}