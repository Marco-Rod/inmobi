/**
 * Configuración de la aplicación Angular
 *
 * Este archivo es el punto central de configuración de la aplicación.
 * Registra todos los providers: routing, HTTP, NgRx Store, Effects y DevTools.
 *
 * PROVIDERS REGISTRADOS:
 * - provideRouter: Sistema de routing declarativo
 * - provideHttpClient: Cliente HTTP con interceptores funcionales
 * - provideStore: NgRx Store con el estado global inicial
 * - provideState: Registra el slice de estado del feature 'properties'
 * - provideEffects: Registra los Effects (efectos secundarios async)
 * - provideStoreDevtools: Herramientas de debugging (solo en desarrollo)
 *
 * CONCEPTOS IMPORTANTES:
 *
 * 1. provideStore vs provideState:
 *    - provideStore({}): Inicializa el store con estado vacío (raíz)
 *    - provideState('key', reducer): Agrega un slice de estado al store
 *    Separamos la inicialización del registro de features por claridad.
 *
 * 2. provideEffects:
 *    Registra las clases de Effects. NgRx las instancia, suscribe sus
 *    observables y los gestiona durante toda la vida de la aplicación.
 *
 * 3. StoreDevtools:
 *    Habilita la extensión Redux DevTools en el navegador.
 *    Permite inspeccionar el estado, ver las acciones, hacer time-travel.
 *    IMPORTANTE: Solo en desarrollo, en producción se deshabilita.
 */

import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore, provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { mockApiInterceptor } from './core/interceptors/mock-api.interceptor';
import { propertyReducer } from './features/properties/store/property.reducer';
import { PropertyEffects } from './features/properties/store/property.effects';
import { dashboardReducer } from './features/dashboard/store/dashboard.reducer';
import { DashboardEffects } from './features/dashboard/store/dashboard.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    // ========================================================================
    // CORE ANGULAR
    // ========================================================================

    // Captura errores globales no manejados (TypeError, ReferenceError, etc.)
    provideBrowserGlobalErrorListeners(),

    // Sistema de routing con las rutas definidas en app.routes.ts
    provideRouter(routes),

    // Client-side hydration para SSR (server-side rendering)
    provideClientHydration(),

    // HTTP Client con el interceptor de API Mock inyectado funcionalmente
    provideHttpClient(
      withInterceptors([mockApiInterceptor])
    ),

    // ========================================================================
    // PRIMENG (UI Components)
    // ========================================================================

    /**
     * providePrimeNG() configura PrimeNG con el tema Aura.
     *
     * Aura es uno de los presets oficiales de PrimeNG 21.
     * Define colores, tipografía, sombras, bordes redondeados, etc.
     *
     * El tema se inyecta como CSS variables en :root, por lo que:
     * - Funciona con modo claro/oscuro automático
     * - Las utilidades (surface-card, text-900) usan estas variables
     * - Es tree-shakeable (solo se carga lo que usas)
     */
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark-mode', // Selector para modo oscuro
        },
      },
    }),

    // ========================================================================
    // NGRX STORE
    // ========================================================================

    /**
     * provideStore({})
     *
     * Inicializa el store raíz con un estado vacío.
     * Los features agregan su propio estado con provideState().
     *
     * Alternativa (registro inline):
     * provideStore({ properties: propertyReducer })
     *
     * Preferimos la separación para que cada feature se registre
     * de forma independiente y clara.
     */
    provideStore({}),

    /**
     * provideState('properties', propertyReducer)
     *
     * Registra el slice 'properties' en el store global.
     *
     * Después de esto, el estado global es:
     * {
     *   properties: PropertyState  ← Manejado por propertyReducer
     * }
     *
     * La clave 'properties' DEBE coincidir con:
     * - createFeatureSelector('properties') en property.selectors.ts
     * - La propiedad en AppState en app.state.ts
     */
    provideState('properties', propertyReducer),

    /**
     * provideState('dashboard', dashboardReducer)
     *
     * Registra el slice 'dashboard' en el store global.
     * Contiene: summary, cityDistribution, typeDistribution, monthlyStats,
     * loading states granulares, errores por sección.
     */
    provideState('dashboard', dashboardReducer),

    // ========================================================================
    // NGRX EFFECTS
    // ========================================================================

    /**
     * provideEffects(PropertyEffects)
     *
     * Registra la clase PropertyEffects como un servicio singleton.
     * NgRx:
     * 1. Instancia la clase
     * 2. Suscribe todos los efectos declarados con createEffect()
     * 3. Los mantiene activos durante toda la vida de la app
     *
     * Múltiples features:
     * provideEffects(PropertyEffects, ClientEffects, ReportEffects)
     * O en llamadas separadas:
     * provideEffects(PropertyEffects),
     * provideEffects(ClientEffects),
     */
    provideEffects(PropertyEffects, DashboardEffects),

    // ========================================================================
    // NGRX DEVTOOLS
    // ========================================================================

    /**
     * provideStoreDevtools
     *
     * Habilita la integración con Redux DevTools Extension.
     *
     * Para usar:
     * 1. Instalar extensión "Redux DevTools" en Chrome/Firefox
     * 2. Abrir DevTools → pestaña "Redux"
     * 3. Ver todas las actions, el estado actual, hacer time-travel
     *
     * Configuración:
     * - maxAge: Número de acciones a recordar en el historial
     * - logOnly: En producción, solo logging (sin time-travel)
     * - autoPause: Pausa grabación cuando DevTools está cerrado
     *
     * isDevMode(): Retorna true en desarrollo, false en producción.
     * Angular lo determina por el valor de enableProdMode().
     */
    provideStoreDevtools({
      maxAge: 50,                    // Guarda las últimas 50 acciones
      logOnly: !isDevMode(),         // Solo logging en producción
      autoPause: true,               // Pausa cuando DevTools está cerrado
      trace: false,                  // Stack traces (costoso, solo si necesitas)
      traceLimit: 75,                // Máximo de frames en el trace
      connectInZone: true,           // Compatibilidad con Angular Zone.js
    }),
  ],
};
