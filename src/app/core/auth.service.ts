import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario } from './models';

interface Tokens {
  access: string;
  refresh: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly usuario = signal<Usuario | null>(this.leerUsuario());
  readonly esHuesped = computed(() => this.usuario()?.rol === 'HUESPED');
  readonly esPropietarioOAdmin = computed(() => ['PROPIETARIO', 'ADMIN'].includes(this.usuario()?.rol ?? ''));

  get access(): string | null {
    return localStorage.getItem('access');
  }
  get refreshToken(): string | null {
    return localStorage.getItem('refresh');
  }

  login(username: string, password: string): Observable<Usuario> {
    return this.http.post<Tokens>(`${environment.apiUrl}/auth/login/`, { username, password }).pipe(
      tap((t) => {
        localStorage.setItem('access', t.access);
        localStorage.setItem('refresh', t.refresh);
      }),
      switchMap(() => this.http.get<Usuario>(`${environment.apiUrl}/auth/me/`)),
      tap((u) => {
        localStorage.setItem('usuario', JSON.stringify(u));
        this.usuario.set(u);
      }),
    );
  }

  registro(datos: { username: string; email: string; password: string; rol: string }) {
    return this.http.post<Usuario>(`${environment.apiUrl}/auth/registro/`, datos);
  }

  /** Pide un access nuevo con el refresh token. */
  refrescar(): Observable<string> {
    return this.http
      .post<{ access: string }>(`${environment.apiUrl}/auth/refresh/`, { refresh: this.refreshToken })
      .pipe(
        tap((r) => localStorage.setItem('access', r.access)),
        map((r) => r.access),
      );
  }

  logout(): void {
    ['access', 'refresh', 'usuario'].forEach((k) => localStorage.removeItem(k));
    this.usuario.set(null);
    this.router.navigate(['/login']);
  }

  private leerUsuario(): Usuario | null {
    try {
      return JSON.parse(localStorage.getItem('usuario') ?? 'null');
    } catch {
      return null;
    }
  }
}
