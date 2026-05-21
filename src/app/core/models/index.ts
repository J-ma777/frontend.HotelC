export * from './habitacion.model';
export * from './habitacion-create.model';
export * from './tipo-habitacion.model';

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  userId: number;
  username: string;
  permisos: string[];
}

export interface User {
  userId: number;
  username: string;
  permisos: string[];
}
