# Frontend Angular 19 — Reservas de Alojamientos

SPA (standalone components, signals, control flow `@if/@for`, interceptor y guards funcionales) que consume la API REST de Django.

```bash
npm install
npm start          # http://localhost:4200  (usa src/environments/environment.development.ts)
npm run build      # genera dist/frontend-angular/browser
```

La URL de la API se configura en `src/environments/environment.ts` (producción) y `environment.development.ts` (desarrollo). Por defecto `http://localhost:8000/api`.

Docker: `docker build --build-arg API_URL=https://tu-api.onrender.com/api -t frontend-angular .` y `docker run -p 4200:80 frontend-angular`.

Instrucciones completas en `INSTRUCTIVO.md` (en la carpeta superior).
