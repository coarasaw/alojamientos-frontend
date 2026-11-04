import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="row justify-content-center">
      <div class="col-md-5">
        <h1 class="h3 mb-3">Ingresar</h1>
        @if (ok()) {
          <div class="alert alert-success">{{ ok() }}</div>
        }
        @if (error()) {
          <div class="alert alert-danger">{{ error() }}</div>
        }
        <form (ngSubmit)="ingresar()" class="bg-white p-4 border rounded">
          <div class="mb-3">
            <label class="form-label" for="u">Usuario</label>
            <input id="u" name="username" class="form-control" [(ngModel)]="username" required />
          </div>
          <div class="mb-3">
            <label class="form-label" for="p">Contraseña</label>
            <input id="p" name="password" type="password" class="form-control" [(ngModel)]="password" required />
          </div>
          <button class="btn btn-primary w-100" [disabled]="cargando()">Ingresar</button>
        </form>
        <p class="mt-3 small">¿No tenés cuenta? <a routerLink="/registro">Registrate</a></p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  username = '';
  password = '';
  readonly error = signal('');
  readonly ok = signal<string>(history.state?.ok ?? '');
  readonly cargando = signal(false);

  ingresar(): void {
    this.error.set('');
    this.cargando.set(true);
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        const next = this.route.snapshot.queryParamMap.get('next');
        // Solo rutas internas, para evitar redirecciones a otros sitios
        this.router.navigateByUrl(next && next.startsWith('/') ? next : '/');
      },
      error: (e) => {
        this.cargando.set(false);
        this.error.set(e.status === 401 ? 'Usuario o contraseña incorrectos.' : 'No se pudo iniciar sesión.');
      },
    });
  }
}
