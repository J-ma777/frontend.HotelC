import { Permiso } from './permiso.model';

export interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
  permisos?: Permiso[];
}