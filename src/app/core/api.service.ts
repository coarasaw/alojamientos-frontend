import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { Alojamiento, Disponibilidad, Pagina, Reserva, Valoracion } from './models';

export interface NuevoAlojamiento {
  titulo: string;
  descripcion: string;
  ciudad: string;
  precio_noche: number;
  capacidad: number;
}

export interface Filtros {
  ciudad?: string;
  huespedes?: number | null;
  precio_max?: number | null;
  desde?: string;
  hasta?: string;
}

/** Única clase que conoce las rutas de la API REST. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private url = environment.apiUrl;

  private params(obj: Record<string, unknown>): HttpParams {
    let p = new HttpParams();
    for (const [k, v] of Object.entries(obj)) {
      if (v !== null && v !== undefined && v !== '') p = p.set(k, String(v));
    }
    return p;
  }

  buscar(filtros: Filtros, page = 1) {
    return this.http.get<Pagina<Alojamiento>>(`${this.url}/alojamientos/`, {
      params: this.params({ ...filtros, page }),
    });
  }
  alojamiento(id: number) {
    return this.http.get<Alojamiento>(`${this.url}/alojamientos/${id}/`);
  }
  disponibilidad(id: number, desde: string, hasta: string) {
    return this.http.get<Disponibilidad>(`${this.url}/alojamientos/${id}/disponibilidad/`, {
      params: { desde, hasta },
    });
  }
  crearAlojamiento(body: NuevoAlojamiento) {
    return this.http.post<Alojamiento>(`${this.url}/alojamientos/`, body);
  }

  reservar(body: { alojamiento: number; check_in: string; check_out: string; huespedes: number }) {
    return this.http.post<Reserva>(`${this.url}/reservas/`, body);
  }
  misReservas(page = 1) {
    return this.http.get<Pagina<Reserva>>(`${this.url}/reservas/`, { params: { page } });
  }
  confirmar(id: number) {
    return this.http.post<Reserva>(`${this.url}/reservas/${id}/confirmar/`, {});
  }
  cancelar(id: number) {
    return this.http.post<Reserva>(`${this.url}/reservas/${id}/cancelar/`, {});
  }

  valoraciones(alojamiento: number) {
    return this.http.get<Pagina<Valoracion>>(`${this.url}/valoraciones/`, { params: { alojamiento } });
  }
  valorar(body: { reserva: number; puntaje: number; comentario: string }) {
    return this.http.post<Valoracion>(`${this.url}/valoraciones/`, body);
  }
}
