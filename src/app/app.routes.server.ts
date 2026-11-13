/**
 * Server Routes (SSR)
 *
 * Configura cómo el servidor procesa cada ruta.
 *
 * RenderMode:
 * - Prerender: Genera HTML estático en build time (rápido, SEO-friendly)
 * - Server:    Renderiza en el servidor en cada request (datos dinámicos)
 * - Client:    Solo SPA, el servidor no procesa (el navegador renderiza todo)
 *
 * Configuración actual:
 * - Rutas estáticas (/dashboard, /properties): Prerender
 * - Rutas con parámetros (/properties/:id): Server (no se pueden prerenderizar
 *   porque dependen del ID que viene en la URL en runtime)
 */
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'properties/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'properties/:id/edit',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
