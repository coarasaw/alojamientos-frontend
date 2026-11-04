import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

const RUTAS_SIN_TOKEN = ['/auth/login/', '/auth/registro/', '/auth/refresh/'];

/** Agrega el JWT a cada request y, si vence (401), lo renueva y reintenta una vez. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const esAuth = (r: HttpRequest<unknown>) => RUTAS_SIN_TOKEN.some((p) => r.url.endsWith(p));
  const conToken = (r: HttpRequest<unknown>) =>
    auth.access && !esAuth(r) ? r.clone({ setHeaders: { Authorization: `Bearer ${auth.access}` } }) : r;

  return next(conToken(req)).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !esAuth(req) && auth.refreshToken) {
        return auth.refrescar().pipe(
          switchMap(() => next(conToken(req))),
          catchError((e) => {
            auth.logout();
            return throwError(() => e);
          }),
        );
      }
      return throwError(() => err);
    }),
  );
};
