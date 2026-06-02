export interface Transaccion {
    id: number;
    fechaTransaccion: string;
    tipo: 'ALOJAMIENTO' | 'CARGO_CONSUMO' | 'PAGO' | 'DESCUENTO';
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    total: number;
  }
  