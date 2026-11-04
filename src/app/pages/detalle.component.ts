import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { mensajeError } from '../core/errores';
import { Alojamiento, Disponibilidad, Valoracion } from '../core/models';

@Component({
  selector: 'app-detalle',
  imports: [FormsModule, RouterLink],
  template: `
    <a routerLink="/" class="small">← Volver a la búsqueda</a>

    @if (error()) {
      <div class="alert alert-danger mt-2">{{ error() }}</div>
    }

    @if (alojamiento(); as a) {
      <div class="row mt-2 g-4">
        <div class="col-lg-7">
          <h1 class="h3">{{ a.titulo }}</h1>
          <p class="text-muted">📍 {{ a.ciudad }} · Propietario: {{ a.propietario }}</p>
          <p>{{ a.descripcion || 'Sin descripción.' }}</p>
          <p><strong>\${{ a.precio_noche }}</strong> por noche · hasta {{ a.capacidad }} huéspedes</p>
          @if (a.promedio_valoracion) {
            <p>⭐ {{ a.promedio_valoracion }} ({{ a.cantidad_valoraciones }} valoraciones)</p>
          }

          <h2 class="h5 mt-4">Valoraciones</h2>
          @for (v of valoraciones(); track v.id) {
            <div class="border rounded bg-white p-2 mb-2">
              ⭐ {{ v.puntaje }}/5 · <strong>{{ v.autor }}</strong><br />{{ v.comentario }}
            </div>
          } @empty {
            <p class="text-muted">Todavía no hay valoraciones.</p>
          }
        </div>

        <div class="col-lg-5">
          <div class="card mb-3">
            <div class="card-body">
              <h2 class="h6">Consultar disponibilidad</h2>
              <form (ngSubmit)="consultar(a.id)" class="row g-2">
                <div class="col"><input type="date" name="desde" class="form-control" [(ngModel)]="desde" required /></div>
                <div class="col"><input type="date" name="hasta" class="form-control" [(ngModel)]="hasta" required /></div>
                <div class="col-auto"><button class="btn btn-outline-primary">Ver</button></div>
              </form>
              @if (disponibilidad(); as d) {
                @if (d.disponible) {
                  <div class="alert alert-success mt-3 mb-0">✅ Disponible en esas fechas.</div>
                } @else {
                  <div class="alert alert-warning mt-3 mb-0">❌ No disponible en esas fechas.</div>
                }
                @if (d.fechas_ocupadas.length) {
                  <p class="small mt-2 mb-0">Fechas ocupadas:</p>
                  <ul class="small mb-0">
                    @for (o of d.fechas_ocupadas; track o.check_in) {
                      <li>{{ o.check_in }} → {{ o.check_out }}</li>
                    }
                  </ul>
                }
              }
            </div>
          </div>

          @if (auth.esHuesped()) {
            <div class="card">
              <div class="card-body">
                <h2 class="h6">Reservar</h2>
                <form (ngSubmit)="reservar(a.id)">
                  <div class="row g-2">
                    <div class="col-6">
                      <label class="form-label small" for="ci">Check-in</label>
                      <input id="ci" type="date" name="ci" [min]="hoy" class="form-control" [(ngModel)]="desde" required />
                    </div>
                    <div class="col-6">
                      <label class="form-label small" for="co">Check-out</label>
                      <input id="co" type="date" name="co" [min]="hoy" class="form-control" [(ngModel)]="hasta" required />
                    </div>
                    <div class="col-12">
                      <label class="form-label small" for="hu">Huéspedes</label>
                      <input id="hu" type="number" name="hu" min="1" [max]="a.capacidad" class="form-control" [(ngModel)]="huespedes" required />
                    </div>
                  </div>
                  @if (errorReserva()) {
                    <div class="alert alert-danger mt-3 mb-0">{{ errorReserva() }}</div>
                  }
                  <button class="btn btn-primary w-100 mt-3">Reservar</button>
                </form>
              </div>
            </div>
          } @else if (!auth.usuario()) {
            <div class="alert alert-info">
              Para reservar <a routerLink="/login" [queryParams]="{ next: router.url }">iniciá sesión</a> como huésped.
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class DetalleComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  protected router = inject(Router);
  protected auth = inject(AuthService);

  readonly alojamiento = signal<Alojamiento | null>(null);
  readonly valoraciones = signal<Valoracion[]>([]);
  readonly disponibilidad = signal<Disponibilidad | null>(null);
  readonly error = signal('');
  readonly errorReserva = signal('');

  hoy = new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD en hora local
  desde = this.route.snapshot.queryParamMap.get('desde') ?? '';
  hasta = this.route.snapshot.queryParamMap.get('hasta') ?? '';
  huespedes = 1;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.alojamiento(id).subscribe({
      next: (a) => {
        this.alojamiento.set(a);
        if (this.desde && this.hasta) this.consultar(a.id);
      },
      error: (e) => this.error.set(e.status === 404 ? 'Alojamiento no encontrado.' : mensajeError(e)),
    });
    this.api.valoraciones(id).subscribe((p) => this.valoraciones.set(p.results));
  }

  consultar(id: number): void {
    this.error.set('');
    this.api.disponibilidad(id, this.desde, this.hasta).subscribe({
      next: (d) => this.disponibilidad.set(d),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  reservar(id: number): void {
    this.errorReserva.set('');
    this.api
      .reservar({ alojamiento: id, check_in: this.desde, check_out: this.hasta, huespedes: this.huespedes })
      .subscribe({
        next: () =>
          this.router.navigate(['/mis-reservas'], {
            state: { ok: 'Reserva creada. Queda pendiente de confirmación del propietario.' },
          }),
        error: (e) => this.errorReserva.set(mensajeError(e)),
      });
  }
}
