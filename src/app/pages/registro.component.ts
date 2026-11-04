import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { mensajeError } from '../core/errores';

@Component({
  selector: 'app-registro',
  imports: [FormsModule],
  template: `
    <div class="row justify-content-center">
      <div class="col-md-5">
        <h1 class="h3 mb-3">Crear cuenta</h1>
        @if (error()) {
          <div class="alert alert-danger">{{ error() }}</div>
        }
        <form (ngSubmit)="registrar()" class="bg-white p-4 border rounded">
          <div class="mb-3">
            <label class="form-label" for="u">Usuario</label>
            <input id="u" name="username" class="form-control" [(ngModel)]="datos.username" required />
          </div>
          <div class="mb-3">
            <label class="form-label" for="e">Email</label>
            <input id="e" name="email" type="email" class="form-control" [(ngModel)]="datos.email" />
          </div>
          <div class="mb-3">
            <label class="form-label" for="p">Contraseña (mín. 8 caracteres)</label>
            <input id="p" name="password" type="password" minlength="8" class="form-control" [(ngModel)]="datos.password" required />
          </div>
          <div class="mb-3">
            <label class="form-label" for="r">Quiero</label>
            <select id="r" name="rol" class="form-select" [(ngModel)]="datos.rol">
              <option value="HUESPED">Reservar alojamientos (huésped)</option>
              <option value="PROPIETARIO">Publicar alojamientos (propietario)</option>
            </select>
          </div>
          <button class="btn btn-primary w-100">Crear cuenta</button>
        </form>
      </div>
    </div>
  `,
})
export class RegistroComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  datos = { username: '', email: '', password: '', rol: 'HUESPED' };
  readonly error = signal('');

  registrar(): void {
    this.error.set('');
    this.auth.registro(this.datos).subscribe({
      next: () => this.router.navigate(['/login'], { state: { ok: 'Cuenta creada. Ya podés iniciar sesión.' } }),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }
}
