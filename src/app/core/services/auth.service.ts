import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse, User } from '../models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private API_URL = 'https://backend-hotel-2xhw.onrender.com/auth';
    private readonly TOKEN_KEY = 'accessToken';
    private readonly USER_KEY = 'user';

    constructor(private http: HttpClient) { }

    login(data: any): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.API_URL}/login`, data);
    }

    setSession(data: AuthResponse): void {
        localStorage.setItem(this.TOKEN_KEY, data.accessToken);
        const userToStore: User = {
            userId: data.userId,
            username: data.username,
            permisos: data.permisos
        };
        localStorage.setItem(this.USER_KEY, JSON.stringify(userToStore));

        console.log('[AuthService] setSession()', {
            tokenKey: this.TOKEN_KEY,
            userKey: this.USER_KEY,
            storedUser: userToStore,
            permisosType: typeof (data as any)?.permisos,
            permisosIsArray: Array.isArray((data as any)?.permisos)
        });
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    getUser(): User | null {
        const raw = localStorage.getItem(this.USER_KEY);
        if (!raw) {
            //console.log('[AuthService] getUser() -> null (no localStorage user)');
            return null;
        }


        try {
            return JSON.parse(raw) as User;
        } catch {
            return null;
        }

    }

    getPermisos(): string[] {
        const user = this.getUser();
        const permisosAny = (user as any)?.permisos;

        let permisos: string[] = [];

        if (Array.isArray(permisosAny)) {
            permisos = permisosAny;
        } else if (typeof permisosAny === 'string') {
            // En caso de que venga como JSON string o CSV
            try {
                const parsed = JSON.parse(permisosAny);
                if (Array.isArray(parsed)) {
                    permisos = parsed;
                } else {
                    permisos = permisosAny.split(',').map(p => p.trim()).filter(Boolean);
                }
            } catch {
                permisos = permisosAny.split(',').map(p => p.trim()).filter(Boolean);
            }
        }

        return permisos;
    }

    hasPermission(permission: string): boolean {
        return this.getPermisos().includes(permission);
    }

    clearSession(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }
}