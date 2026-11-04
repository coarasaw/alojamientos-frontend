import { Routes } from '@angular/router';
import { authGuard, rolGuard } from './core/auth.guard';
import { BuscarComponent } from './pages/buscar.component';

export const routes: Routes = [
  { path: '', component: BuscarComponent },
  {
    path: 'alojamientos/nuevo',
    canActivate: [rolGuard('PROPIETARIO', 'ADMIN')],
    loadComponent: () => import('./pages/nuevo-alojamiento.component').then((m) => m.NuevoAlojamientoComponent),
  },
  {
    path: 'alojamientos/:id',
    loadComponent: () => import('./pages/detalle.component').then((m) => m.DetalleComponent),
  },
  {
    path: 'mis-reservas',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/mis-reservas.component').then((m) => m.MisReservasComponent),
  },
  { path: 'login', loadComponent: () => import('./pages/login.component').then((m) => m.LoginComponent) },
  { path: 'registro', loadComponent: () => import('./pages/registro.component').then((m) => m.RegistroComponent) },
  { path: '**', redirectTo: '' },
];
