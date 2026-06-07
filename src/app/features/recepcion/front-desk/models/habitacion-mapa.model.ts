
export interface HabitacionMapa {

    id: number;
    numero: string;
    estado: string;
    piso: number;
    tipoNombre: string;
  
    nombreHuesped: string | null;
    cantidadHuespedes: number | null;
    fechaSalida: string | null;
    capacidad: number;
    reservaId: number | null;
    tipoId: number;
  
  }  