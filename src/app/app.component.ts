import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav class="navbar navbar-expand-md navbar-dark bg-dark mb-4">
      <div class="container">
        <a class="navbar-brand" routerLink="/">🏠 Alojamientos</a>
        <div class="navbar-nav ms-auto flex-row flex-wrap align-items-center gap-2">
          <a class="nav-link" routerLink="/">Buscar</a>
          @if (auth.usuario(); as u) {
            @if (auth.esPropietarioOAdmin()) {
              <a class="nav-link" routerLink="/alojamientos/nuevo">Publicar alojamiento</a>
            }
            <a class="nav-link" routerLink="/mis-reservas">Reservas</a>
            <span class="navbar-text text-light small">{{ u.username }} · {{ u.rol }}</span>
            <button class="btn btn-outline-light btn-sm" (click)="auth.logout()">Salir</button>
          } @else {
            <a class="nav-link" routerLink="/login">Ingresar</a>
            <a class="btn btn-outline-light btn-sm" routerLink="/registro">Registrarme</a>
          }
        </div>
      </div>
    </nav>
    <main class="container pb-5">
      <router-outlet />
    </main>
  `,
})
export class AppComponent {
  protected auth = inject(AuthService);
}
