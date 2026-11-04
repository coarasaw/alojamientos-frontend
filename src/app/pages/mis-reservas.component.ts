import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { mensajeError } from '../core/errores';
import { Pagina, Reserva } from '../core/models';

@Component({
  selector: 'app-mis-reservas',
  imports: [FormsModule, RouterLink],
  template: `
    <h1 class="h3 mb-3">{{ auth.esHuesped() ? 'Mis reservas' : 'Reservas recibidas' }}</h1>

    @if (ok()) {
      <div class="alert alert-success">{{ ok() }}</div>
    }
    @if (error()) {
      <div class="alert alert-danger">{{ error() }}</div>
    }

    <div class="table-responsive bg-white border rounded">
      <table class="table align-middle mb-0">
        <thead>
          <tr><th>#</th><th>Alojamiento</th><th>Huésped</th><th>Fechas</th><th>Total</th><th>Estado</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          @for (r of pagina()?.results ?? []; track r.id) {
            <tr>
              <td>{{ r.id }}</td>
              <td><a [routerLink]="['/alojamientos', r.alojamiento]">{{ r.alojamiento_titulo }}</a></td>
              <td>{{ r.huesped }}</td>
              <td>
                {{ r.check_in }} → {{ r.check_out }}<br />
                <span class="small text-muted">{{ r.noches }} noche{{ r.noches === 1 ? '' : 's' }}</span>
              </td>
              <td>
                \${{ r.precio_total }}
                @if (r.estado === 'CANCELADA') {
                  <br /><span class="small text-muted">Reembolso: \${{ r.monto_reembolsado }}</span>
                }
              </td>
              <td>
                <span class="badge" [class]="badge(r.estado)">{{ r.estado }}</span>
              </td>
              <td>
                @if (puedeConfirmar(r)) {
                  <button class="btn btn-success btn-sm me-1" (click)="confirmar(r)">Confirmar</button>
                }
                @if (puedeCancelar(r)) {
                  <button class="btn btn-outline-danger btn-sm" (click)="cancelar(r)">Cancelar</button>
                }
                @if (puedeValorar(r)) {
                  <form (ngSubmit)="valorar(r)" class="d-flex gap-1 mt-1">
                    <select name="p{{ r.id }}" class="form-select form-select-sm" style="width: auto" [(ngModel)]="form(r.id).puntaje">
                      @for (n of [5, 4, 3, 2, 1]; track n) {
                        <option [ngValue]="n">{{ n }}</option>
                      }
                    </select>
                    <input name="c{{ r.id }}" class="form-control form-control-sm" placeholder="Comentario" [(ngModel)]="form(r.id).comentario" />
                    <button class="btn btn-primary btn-sm">Valorar</button>
                  </form>
                }
              </td>
            </tr>
          } @empty {
            <tr><td colspan="7" class="text-center text-muted py-4">No hay reservas todavía.</td></tr>
          }
        </tbody>
      </table>
    </div>

    @if (pagina(); as p) {
      @if (p.previous || p.next) {
        <nav class="mt-3 d-flex gap-2 align-items-center">
          @if (p.previous) {
            <button class="btn btn-outline-secondary btn-sm" (click)="cargar(nro() - 1)">← Anterior</button>
          }
          <span class="text-muted small">Página {{ nro() }}</span>
          @if (p.next) {
            <button class="btn btn-outline-secondary btn-sm" (click)="cargar(nro() + 1)">Siguiente →</button>
          }
        </nav>
      }
    }
  `,
})
export class MisReservasComponent implements OnInit {
  private api = inject(ApiService);
  protected auth = inject(AuthService);

  readonly pagina = signal<Pagina<Reserva> | null>(null);
  readonly nro = signal(1);
  readonly ok = signal<string>(history.state?.ok ?? '');
  readonly error = signal('');

  private hoy = new Date().toLocaleDateString('sv-SE');
  private formularios: Record<number, { puntaje: number; comentario: string }> = {};

  ngOnInit(): void {
    this.cargar(1);
  }

  cargar(n: number): void {
    this.nro.set(n);
    this.api.misReservas(n).subscribe({
      next: (p) => this.pagina.set(p),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  form(id: number) {
    return (this.formularios[id] ??= { puntaje: 5, comentario: '' });
  }

  badge(estado: string): string {
    return estado === 'CONFIRMADA' ? 'bg-success' : estado === 'PENDIENTE' ? 'bg-warning text-dark' : 'bg-secondary';
  }

  puedeConfirmar(r: Reserva): boolean {
    return this.auth.esPropietarioOAdmin() && r.estado === 'PENDIENTE';
  }
  puedeCancelar(r: Reserva): boolean {
    const rol = this.auth.usuario()?.rol;
    return (rol === 'HUESPED' || rol === 'ADMIN') && r.estado !== 'CANCELADA' && r.check_in > this.hoy;
  }
  puedeValorar(r: Reserva): boolean {
    return this.auth.esHuesped() && r.estado === 'CONFIRMADA' && r.check_out <= this.hoy;
  }

  confirmar(r: Reserva): void {
    this.accion(this.api.confirmar(r.id), 'Reserva confirmada.');
  }

  cancelar(r: Reserva): void {
    if (!confirm('¿Cancelar la reserva?')) return;
    this.api.cancelar(r.id).subscribe({
      next: (x) => {
        this.mostrar(`Reserva cancelada. Reembolso: $${x.monto_reembolsado}`);
        this.cargar(this.nro());
      },
      error: (e) => this.fallo(e),
    });
  }

  valorar(r: Reserva): void {
    const f = this.form(r.id);
    this.accion(this.api.valorar({ reserva: r.id, ...f }), '¡Gracias por tu valoración!');
  }

  private accion(obs: Observable<unknown>, mensajeOk: string): void {
    obs.subscribe({
      next: () => {
        this.mostrar(mensajeOk);
        this.cargar(this.nro());
      },
      error: (e) => this.fallo(e),
    });
  }

  private mostrar(msg: string): void {
    this.error.set('');
    this.ok.set(msg);
  }

  private fallo(e: unknown): void {
    this.ok.set('');
    this.error.set(mensajeError(e));
  }
}
