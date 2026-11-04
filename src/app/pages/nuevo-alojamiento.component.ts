import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../core/api.service';
import { mensajeError } from '../core/errores';

@Component({
  selector: 'app-nuevo-alojamiento',
  imports: [FormsModule],
  template: `
    <div class="row justify-content-center">
      <div class="col-md-7">
        <h1 class="h3 mb-3">Publicar alojamiento</h1>
        @if (error()) {
          <div class="alert alert-danger">{{ error() }}</div>
        }
        <form (ngSubmit)="publicar()" class="bg-white p-4 border rounded">
          <div class="mb-3">
            <label class="form-label" for="t">Título</label>
            <input id="t" name="titulo" class="form-control" [(ngModel)]="f.titulo" required />
          </div>
          <div class="mb-3">
            <label class="form-label" for="d">Descripción</label>
            <textarea id="d" name="descripcion" rows="3" class="form-control" [(ngModel)]="f.descripcion"></textarea>
          </div>
          <div class="row g-3 mb-3">
            <div class="col-md-4">
              <label class="form-label" for="c">Ciudad</label>
              <input id="c" name="ciudad" class="form-control" [(ngModel)]="f.ciudad" required />
            </div>
            <div class="col-md-4">
              <label class="form-label" for="pr">Precio por noche</label>
              <input id="pr" name="precio" type="number" step="0.01" min="1" class="form-control" [(ngModel)]="f.precio_noche" required />
            </div>
            <div class="col-md-4">
              <label class="form-label" for="ca">Capacidad</label>
              <input id="ca" name="capacidad" type="number" min="1" class="form-control" [(ngModel)]="f.capacidad" required />
            </div>
          </div>
          <button class="btn btn-primary">Publicar</button>
        </form>
      </div>
    </div>
  `,
})
export class NuevoAlojamientoComponent {
  private api = inject(ApiService);
  private router = inject(Router);

  f = { titulo: '', descripcion: '', ciudad: '', precio_noche: 0, capacidad: 1 };
  readonly error = signal('');

  publicar(): void {
    this.error.set('');
    this.api.crearAlojamiento(this.f).subscribe({
      next: (a) => this.router.navigate(['/alojamientos', a.id]),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }
}
