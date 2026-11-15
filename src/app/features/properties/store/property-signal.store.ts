/**
 * PropertySignalStore
 *
 * Implementación del estado de propiedades usando NgRx SignalStore.
 *
 * COMPARACIÓN: SignalStore vs Store tradicional
 *
 * ┌─────────────────────────────────┬────────────────────────────────────┐
 * │ Store tradicional (Fase 6)       │ SignalStore (este archivo)         │
 * ├─────────────────────────────────┼────────────────────────────────────┤
 * │ Actions (archivo separado)       │ withMethods (inline)               │
 * │ Reducer (archivo separado)       │ patchState (inline)                │
 * │ Effects (archivo separado)       │ withMethods + rxjs (inline)        │
 * │ Selectors (archivo separado)      │ withComputed (inline)              │
 * │ 5 archivos por feature            │ 1 archivo por feature              │
 * │ Más boilerplate                   │ Menos boilerplate                  │
 * │ Redux DevTools compatible         │ Menos herramientas de debugging    │
 * │ Escala para apps muy grandes      │ Ideal para features medianas       │
 * └─────────────────────────────────┴────────────────────────────────────┘
 *
 * CUÁNDO USAR CADA UNO:
 *
 * Store tradicional:
 * - Apps grandes con muchos desarrolladores
 * - Necesitas time-travel debugging
 * - Quieres separación estricta de concerns
 * - Equipos que conocen el patrón Redux
 *
 * SignalStore:
 * - Features medianas o pequeñas
 * - Quieres menos boilerplate
 * - Prefieres composition sobre dispatch
 * - Integración natural con Angular Signals
 */

import { inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState, withHooks } from '@ngrx/signals';
import { computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PropertyApiService } from '../../../core/services/api/property-api.service';
import { Property, PropertyCreateDto, PropertyFilter } from '../../../core/models';

/**
 * Interface del estado del SignalStore.
 *
 * Igual que en el Store tradicional, el estado es un objeto plano.
 * La diferencia es que aquí NO creamos un archivo separado para el estado;
 * lo definimos inline con withState().
 */
interface PropertySignalState {
  properties: Property[];
  loading: boolean;
  error: string | null;
  filters: PropertyFilter;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  selectedPropertyId: number | null;
}

/**
 * Estado inicial.
 *
 * Igual que en el Store tradicional, definimos valores por defecto.
 */
const initialState: PropertySignalState = {
  properties: [],
  loading: false,
  error: null,
  filters: {},
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
  selectedPropertyId: null,
};

/**
 * PropertySignalStore
 *
 * signalStore() es la función principal de NgRx SignalStore.
 * Recibe "features" que añaden capacidades al store:
 *
 * - withState:    Define el estado inicial (como initialPropertyState)
 * - withComputed: Define signals computados (como selectores)
 * - withMethods:  Define métodos que modifican el estado (como dispatch + reducer)
 * - withHooks:    Lifecycle hooks (onInit, onDestroy)
 *
 * El resultado es un SERVICE injectable que puedes usar en cualquier componente.
 * A diferencia del Store tradicional, NO necesitas provideState() en app.config.ts.
 *
 * USO en un componente:
 * ```typescript
 * private readonly store = inject(PropertySignalStore);
 *
 * // Leer datos (signals):
 * const props = this.store.properties();   // ← signal(), se llama como función
 * const loading = this.store.loading();
 *
 * // Modificar estado (methods):
 * this.store.loadProperties();
 * this.store.setFilters({ city: 'Guadalajara' });
 * ```
 *
 * DIFERENCIA CLAVE con Store tradicional:
 * - Tradicional: this.store.dispatch(loadProperties())
 *   → La action viaja por el pipeline → Reducer actualiza estado → Selector emite
 *
 * - SignalStore: this.store.loadProperties()
 *   → El método hace la llamada HTTP directamente → patchState actualiza → Signal emite
 *
 * SignalStore es más directo y fácil de seguir.
 */
export const PropertySignalStore = signalStore(
  { providedIn: 'root' },
  // ==========================================================================
  // STATE: Estado inicial del store
  // ==========================================================================
  withState<PropertySignalState>(initialState),

  // ==========================================================================
  // COMPUTED: Signals derivados (equivalente a selectores)
  // ==========================================================================
  withComputed(({ properties, selectedPropertyId, totalCount, currentPage, pageSize, filters }) => ({
    selectedProperty: computed(() =>
      properties().find((p) => p.id === selectedPropertyId()) ?? null
    ),
    totalPages: computed(() =>
      pageSize() > 0 ? Math.ceil(totalCount() / pageSize()) : 0
    ),
    isFirstPage: computed(() => currentPage() === 1),
    /** isLastPage recalcula totalPages localmente para evitar dependencia circular de scope */
    isLastPage: computed(() => {
      const pages = pageSize() > 0 ? Math.ceil(totalCount() / pageSize()) : 0;
      return currentPage() >= pages;
    }),
    /**
     * hasFilters verifica si hay filtros activos.
     * Cuenta las propiedades definidas (no undefined/null) en el objeto filters.
     */
    hasFilters: computed(() => {
      const currentFilters = filters();
      return Object.values(currentFilters).some(value => value !== undefined && value !== null && value !== '');
    }),
  })),

  // ==========================================================================
  // METHODS: Métodos que modifican el estado (equivalente a actions + reducer)
  // ==========================================================================
  withMethods((store, apiService = inject(PropertyApiService)) => ({
    /**
     * Cargar propiedades.
     *
     * En el Store tradicional esto requería:
     * 1. Action: loadProperties
     * 2. Effect: switchMap → HTTP → loadPropertiesSuccess/Failure
     * 3. Reducer: on(loadPropertiesSuccess, (state, { response }) => ...)
     *
     * Con SignalStore, todo está en un método:
     */
    async loadProperties() {
      patchState(store, { loading: true, error: null });
      try {
        const response = await firstValueFrom(
          apiService.getProperties(
            store.filters(),
            store.currentPage(),
            store.pageSize()
          )
        );
        patchState(store, {
          properties: response.results,
          totalCount: response.count,
          loading: false,
        });
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Error al cargar propiedades';
        patchState(store, {
          loading: false,
          error: errorMessage,
        });
      }
    },

    /** Establecer filtros y recargar */
    setFilters(filters: PropertyFilter) {
      patchState(store, { filters, currentPage: 1 });
      // En SignalStore, el método puede llamar a otros métodos del mismo store
      // directamente, sin necesidad de dispatch.
    },

    /** Limpiar filtros */
    clearFilters() {
      patchState(store, { filters: {}, currentPage: 1 });
    },

    /** Cambiar página */
    setPage(page: number) {
      patchState(store, { currentPage: page });
    },

    /** Seleccionar una propiedad por ID */
    selectProperty(id: number | null) {
      patchState(store, { selectedPropertyId: id });
    },

    /**
     * Crear una nueva propiedad.
     *
     * En el Store tradicional esto era createProperty action →
     * exhaustMap effect → HTTP → createPropertySuccess action → reducer.
     * Aquí es un solo método.
     */
    async createProperty(dto: PropertyCreateDto) {
      patchState(store, { loading: true, error: null });
      try {
        const created = await firstValueFrom(apiService.createProperty(dto));
        patchState(store, {
          properties: [created, ...store.properties()],
          totalCount: store.totalCount() + 1,
          loading: false,
        });
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Error al crear propiedad';
        patchState(store, {
          loading: false,
          error: errorMessage,
        });
      }
    },

    /** Eliminar una propiedad */
    async deleteProperty(id: number) {
      patchState(store, { loading: true, error: null });
      try {
        await firstValueFrom(apiService.deleteProperty(id));
        patchState(store, {
          properties: store.properties().filter((p) => p.id !== id),
          totalCount: store.totalCount() - 1,
          loading: false,
          selectedPropertyId:
            store.selectedPropertyId() === id ? null : store.selectedPropertyId(),
        });
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Error al eliminar propiedad';
        patchState(store, {
          loading: false,
          error: errorMessage,
        });
      }
    },

    /** Limpiar error */
    clearError() {
      patchState(store, { error: null });
    },
  })),

  // ==========================================================================
  // HOOKS: Lifecycle del store (equivalente a Effects con initActions)
  // ==========================================================================
  withHooks({
    /**
     * onInit se ejecuta cuando el store es inyectado por primera vez.
     *
     * En el Store tradicional, necesitabas un Effect que escuchara
     * una action de inicialización:
     * ```typescript
     * loadOnInit$ = createEffect(() => of(loadProperties()));
     * ```
     *
     * Con SignalStore, simplemente llamas al método en onInit.
     *
     * IMPORTANTE: El store es providedIn: 'root' por defecto, así que
     * onInit se ejecuta UNA SOLA VEZ en toda la vida de la aplicación.
     * Si quieres un store por componente, usa { providedIn: 'context' }.
     */
    onInit(store) {
      console.log('🔄 [PropertySignalStore] Inicializando, cargando propiedades...');
      store.loadProperties();
    },
  })
);
