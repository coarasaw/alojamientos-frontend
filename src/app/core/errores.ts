import { HttpErrorResponse } from '@angular/common/http';

/** Convierte los errores de la API (DRF) en un texto legible. */
export function mensajeError(err: unknown): string {
  if (!(err instanceof HttpErrorResponse)) return 'Error inesperado.';
  if (err.status === 0) return 'No se pudo conectar con la API. ¿Está levantada?';
  const d = err.error;
  if (d && typeof d === 'object' && !Array.isArray(d)) {
    if ('detail' in d) return String(d.detail);
    return Object.entries(d)
      .map(([campo, e]) => {
        const texto = Array.isArray(e) ? e.join(' ') : String(e);
        return campo === 'non_field_errors' ? texto : `${campo}: ${texto}`;
      })
      .join(' | ');
  }
  if (Array.isArray(d)) return d.join(' ');
  return 'Error inesperado.';
}
