import { Rol } from './rol.model';

export interface Usuario {
    id: number;
    nombreUsuario: string;
    correo: string;
    estado: boolean;
    rol: Rol | null;
    creadoEn: string;
    modificadoEn: string;
  }
  
  export interface CrearUsuarioRequest {
    nombreUsuario: string;
    correo: string;
    contraseñaHash: string;
    rolId: number;
  }