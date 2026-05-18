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
