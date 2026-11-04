export type Rol = 'HUESPED' | 'PROPIETARIO' | 'ADMIN';

export interface Usuario {
  id: number;
  username: string;
  email: string;
  rol: Rol;
}

export interface Pagina<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Alojamiento {
  id: number;
  propietario: string;
  titulo: string;
  descripcion: string;
  ciudad: string;
  precio_noche: string;
  capacidad: number;
  promedio_valoracion: number | null;
  cantidad_valoraciones: number;
}

export interface Disponibilidad {
  alojamiento: number;
  desde: string;
  hasta: string;
  disponible: boolean;
  fechas_ocupadas: { check_in: string; check_out: string }[];
}

export type EstadoReserva = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA';

export interface Reserva {
  id: number;
  alojamiento: number;
  alojamiento_titulo: string;
  huesped: string;
  check_in: string;
  check_out: string;
  noches: number;
  huespedes: number;
  precio_total: string;
  estado: EstadoReserva;
  monto_reembolsado: string;
}

export interface Valoracion {
  id: number;
  reserva: number;
  autor: string;
  puntaje: number;
  comentario: string;
}
