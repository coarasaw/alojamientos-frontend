import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService, Filtros } from '../core/api.service';
import { mensajeError } from '../core/errores';
import { Alojamiento, Pagina } from '../core/models';

@Component({
  selector: 'app-buscar',
  imports: [FormsModule, RouterLink],
  template: `
    <h1 class="h3 mb-3">Buscar alojamientos</h1>

    <form (ngSubmit)="buscar()" class="row g-2 mb-4 bg-white p-3 rounded border">
      <div class="col-md-3">
        <label class="form-label" for="ciudad">Ciudad</label>
        <input id="ciudad" name="ciudad" class="form-control" [(ngModel)]="filtros.ciudad" />
      </div>
      <div class="col-md-2">
        <label class="form-label" for="huespedes">Huéspedes</label>
        <input id="huespedes" name="huespedes" type="number" min="1" class="form-control" [(ngModel)]="filtros.huespedes" />
      </div>
      <div class="col-md-2">
        <label class="form-label" for="precio">Precio máx.</label>
        <input id="precio" name="precio_max" type="number" min="1" class="form-control" [(ngModel)]="filtros.precio_max" />
      </div>
      <div class="col-md-2">
        <label class="form-label" for="desde">Desde</label>
        <input id="desde" name="desde" type="date" class="form-control" [(ngModel)]="filtros.desde" />
      </div>
      <div class="col-md-2">
        <label class="form-label" for="hasta">Hasta</label>
        <input id="hasta" name="hasta" type="date" class="form-control" [(ngModel)]="filtros.hasta" />
      </div>
      <div class="col-md-1 d-flex align-items-end">
        <button class="btn btn-primary w-100">Buscar</button>
      </div>
    </form>

    @if (error()) {
      <div class="alert alert-danger">{{ error() }}</div>
    }

    @if (resultado(); as r) {
      <p class="text-muted">{{ r.count }} resultado{{ r.count === 1 ? '' : 's' }}</p>
      <div class="row g-3">
        @for (a of r.results; track a.id) {
          <div class="col-md-6 col-lg-4">
            <div class="card h-100">
              <div class="card-body">
                <h2 class="h5 card-title">{{ a.titulo }}</h2>
                <p class="text-muted mb-1">📍 {{ a.ciudad }} · hasta {{ a.capacidad }} huéspedes</p>
                <p class="mb-1"><strong>\${{ a.precio_noche }}</strong> por noche</p>
                <p class="mb-2">
                  @if (a.promedio_valoracion) {
                    ⭐ {{ a.promedio_valoracion }} ({{ a.cantidad_valoraciones }})
                  } @else {
                    <span class="text-muted">Sin valoraciones</span>
                  }
                </p>
                <a class="btn btn-outline-primary btn-sm" [routerLink]="['/alojamientos', a.id]" [queryParams]="fechas()">Ver detalle</a>
              </div>
            </div>
          </div>
        } @empty {
          <p>No hay alojamientos para esos filtros.</p>
        }
      </div>

      @if (r.previous || r.next) {
        <nav class="mt-4 d-flex gap-2 align-items-center">
          @if (r.previous) {
            <button class="btn btn-outline-secondary btn-sm" (click)="irAPagina(pagina() - 1)">← Anterior</button>
          }
          <span class="text-muted small">Página {{ pagina() }}</span>
          @if (r.next) {
            <button class="btn btn-outline-secondary btn-sm" (click)="irAPagina(pagina() + 1)">Siguiente →</button>
          }
        </nav>
      }
    }
  `,
})
export class BuscarComponent implements OnInit {
  private api = inject(ApiService);

  filtros: Filtros = {};
  readonly pagina = signal(1);
  readonly resultado = signal<Pagina<Alojamiento> | null>(null);
  readonly error = signal('');

  ngOnInit(): void {
    this.cargar();
  }

  buscar(): void {
    this.pagina.set(1);
    this.cargar();
  }

  irAPagina(n: number): void {
    this.pagina.set(n);
    this.cargar();
  }

  /** Si hay fechas elegidas, se pasan al detalle para consultar disponibilidad. */
  fechas(): { desde: string; hasta: string } | null {
    return this.filtros.desde && this.filtros.hasta ? { desde: this.filtros.desde, hasta: this.filtros.hasta } : null;
  }

  private cargar(): void {
    this.error.set('');
    this.api.buscar(this.filtros, this.pagina()).subscribe({
      next: (r) => this.resultado.set(r),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }
}
