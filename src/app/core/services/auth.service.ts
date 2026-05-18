import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse, User } from '../models/index.models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private API_URL = 'http://localhost:3030/auth';
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
            console.log('[AuthService] getUser() -> null (no localStorage user)');
            return null;
        }

        try {
            const parsed = JSON.parse(raw);
            console.log('[AuthService] getUser() -> parsed', parsed);
            return parsed as User;
        } catch (err) {
            console.error('[AuthService] getUser() JSON.parse error. raw=', raw, err);
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

        console.log('[AuthService] getPermisos() ->', {
            permisos,
            permisosLength: permisos.length,
            permisosType: typeof permisosAny,
            permisosIsArray: Array.isArray(permisosAny)
        });

        return permisos;
    }

    clearSession(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }
}