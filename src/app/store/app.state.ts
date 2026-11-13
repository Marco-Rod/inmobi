/**
 * App State - Estado Global de la Aplicación
 *
 * Este archivo define la forma del estado GLOBAL de la aplicación.
 * Es la raíz del árbol de estado de NgRx.
 *
 * CONCEPTOS IMPORTANTES:
 *
 * 1. Estado global vs estado de feature:
 *    - AppState: Contiene referencias a todos los slices de estado
 *    - PropertyState: El estado específico del módulo de propiedades
 *    - En el futuro: ClientState, ReportState, etc.
 *
 * 2. Lazy loading:
 *    Los features registrados con provideState() se cargan
 *    solo cuando se navega al módulo. El estado se agrega
 *    dinámicamente al store global en ese momento.
 *
 * 3. Separación de concerns:
 *    Cada feature maneja su propio slice de estado.
 *    No hay estado compartido entre features (a menos que sea intencional).
 *
 * ÁRBOL DE ESTADO:
 * ```
 * AppState {
 *   properties: PropertyState     ← Feature de propiedades
 *   // (futuro) clients: ClientState
 *   // (futuro) reports: ReportState
 *   // (futuro) auth: AuthState
 * }
 * ```
 */

import { PropertyState } from '../features/properties/store/property.state';
import { DashboardState } from '../features/dashboard/store/dashboard.state';

/**
 * Interface del estado global de la aplicación
 *
 * Cada propiedad de esta interface corresponde a un "slice" de estado
 * manejado por un feature reducer.
 *
 * La clave (ej. 'properties') debe coincidir con:
 * 1. El nombre registrado en provideState('properties', propertyReducer)
 * 2. El nombre usado en createFeatureSelector('properties')
 *
 * Si estas claves no coinciden, el selector retornará undefined.
 */
export interface AppState {
  /**
   * Estado del módulo de propiedades
   *
   * Contiene: lista de propiedades, paginación, filtros,
   * loading states, errores.
   *
   * Registrado en: app.config.ts → provideState('properties', ...)
   * Accedido via: createFeatureSelector('properties')
   */
  properties: PropertyState;

  // ============================================================================
  // ESTADOS FUTUROS (comentados hasta que se implementen)
  // ============================================================================

  /** Estado del módulo de dashboard (estadísticas y gráficos) */
  dashboard: DashboardState;

  // /**
  //  * Estado de autenticación
  //  * Registrado con: provideState('auth', authReducer)
  //  */
  // auth: AuthState;

  // /**
  //  * Estado del módulo de clientes/leads
  //  * Registrado con: provideState('clients', clientReducer)
  //  */
  // clients: ClientState;

  // /**
  //  * Estado del módulo de reportes
  //  * Registrado con: provideState('reports', reportReducer)
  //  */
  // reports: ReportState;
}

// ============================================================================
// NOTAS PEDAGÓGICAS
// ============================================================================

/**
 * ¿Por qué mantener AppState si NgRx puede inferirlo automáticamente?
 *
 * NgRx puede inferir el tipo del estado globalmente sin que declares AppState.
 * Sin embargo, declarar AppState explícitamente tiene beneficios:
 *
 * 1. Documentación visual: Ves de un vistazo toda la estructura del estado
 * 2. Type-checking manual: Puedes inyectar Store<AppState> en servicios
 * 3. Claridad de arquitectura: Muestra qué features existen
 * 4. Facilidad de mantenimiento: Un lugar central para ver el estado global
 *
 * Uso explícito con Store<AppState>:
 * ```typescript
 * constructor(private store: Store<AppState>) {}
 * // vs genérico:
 * constructor(private store: Store) {}
 * ```
 *
 * Para este proyecto didáctico, lo declaramos explícitamente
 * por claridad y como buena práctica.
 */

/**
 * Pattern: Feature State Registration
 *
 * Hay dos formas de registrar features en NgRx:
 *
 * 1. EAGER (en app.config.ts):
 *    ```typescript
 *    provideStore({ properties: propertyReducer })
 *    ```
 *    El estado se carga INMEDIATAMENTE al iniciar la app.
 *    Bueno para: auth, configuración global, datos siempre necesarios.
 *
 * 2. LAZY (en route providers):
 *    ```typescript
 *    // En la configuración de ruta:
 *    {
 *      path: 'properties',
 *      loadComponent: () => import('./...'),
 *      providers: [
 *        provideState('properties', propertyReducer),
 *        provideEffects(PropertyEffects)
 *      ]
 *    }
 *    ```
 *    El estado se agrega al store solo cuando se navega a esa ruta.
 *    Bueno para: módulos grandes, features opcionales.
 *
 * Para este proyecto usamos EAGER por simplicidad didáctica.
 * En una app grande, considera LAZY para features pesados.
 */

/**
 * ¿Qué es el "slice" de estado?
 *
 * El estado global es un árbol:
 * ```
 * {
 *   properties: {           ← Slice "properties"
 *     properties: [...],
 *     loading: false,
 *     ...
 *   },
 *   auth: {                 ← Slice "auth" (futuro)
 *     user: null,
 *     token: null,
 *     ...
 *   }
 * }
 * ```
 *
 * Cada reducer maneja su propio slice.
 * El propertyReducer solo ve y modifica PropertyState.
 * No puede acceder a AuthState, ni AuthState puede acceder a PropertyState.
 *
 * Esta separación garantiza:
 * - Encapsulamiento
 * - Sin efectos secundarios entre módulos
 * - Fácil testing (cada reducer es independiente)
 * - Escalabilidad (agregar features sin afectar los existentes)
 */
