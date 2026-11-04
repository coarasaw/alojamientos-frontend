import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Rol } from './models';
import { AuthService } from './auth.service';

/** Exige sesión iniciada. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  if (auth.usuario()) return true;
  return inject(Router).createUrlTree(['/login'], { queryParams: { next: state.url } });
};

/** Exige sesión iniciada y alguno de los roles indicados. */
export const rolGuard =
  (...roles: Rol[]): CanActivateFn =>
  (_route, state) => {
    const auth = inject(AuthService);
    const u = auth.usuario();
    if (!u) return inject(Router).createUrlTree(['/login'], { queryParams: { next: state.url } });
    return roles.includes(u.rol) ? true : inject(Router).createUrlTree(['/']);
  };
