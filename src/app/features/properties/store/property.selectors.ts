/**
 * Property Selectors
 *
 * Los Selectors son funciones puras que extraen y transforman datos del estado.
 * Son la capa de "lectura" del store: los componentes nunca acceden al estado
 * directamente, siempre lo hacen a través de selectors.
 *
 * CONCEPTOS IMPORTANTES:
 *
 * 1. Memoización:
 *    createSelector() memoiza el resultado. Si los inputs no cambiaron,
 *    retorna el valor cacheado sin recalcular. Esto es una optimización
 *    de performance crítica en apps grandes.
 *
 * 2. Composición:
 *    Los selectors se pueden componer: un selector puede usar otros selectores
 *    como inputs. Esto crea una jerarquía de derivaciones de datos.
 *
 * 3. Single Responsibility:
 *    Cada selector tiene una responsabilidad: extraer un dato específico.
 *    Los componentes combinan múltiples selectores según necesiten.
 *
 * 4. Feature selector:
 *    createFeatureSelector() es el punto de entrada al estado de un feature.
 *    Lee el "slice" del estado global que corresponde a este módulo.
 */

import { createSelector, createFeatureSelector } from '@ngrx/store';
import type { PropertyState } from './property.state';

// ============================================================================
// FEATURE SELECTOR (PUNTO DE ENTRADA)
// ============================================================================

/**
 * Feature Selector
 *
 * El punto de entrada al estado del feature de propiedades.
 *
 * 'properties' es la clave que registramos en el store global.
 * Corresponde a la clave en AppState:
 * ```typescript
 * interface AppState {
 *   properties: PropertyState;  // ← 'properties' es la clave
 * }
 * ```
 *
 * createFeatureSelector<PropertyState>('properties') retorna:
 * (state: AppState) => PropertyState
 *
 * Es decir, navega desde el estado global hasta el slice de properties.
 */
export const selectPropertyFeature =
  createFeatureSelector<PropertyState>('properties');

// ============================================================================
// SELECTORS BÁSICOS (Acceso directo a propiedades del estado)
// ============================================================================

/**
 * Selector de la lista de propiedades
 *
 * createSelector toma:
 * 1. Un o más selectors de INPUT
 * 2. Una función proyección que recibe los outputs de los inputs
 *
 * Aquí:
 * - Input: selectPropertyFeature → PropertyState
 * - Proyección: (state) => state.properties → Property[]
 *
 * La memoización funciona así:
 * - Primera llamada: calcula y cachea
 * - Siguientes llamadas: si selectPropertyFeature retorna el mismo objeto,
 *   retorna el valor cacheado sin ejecutar la proyección
 */
export const selectAllProperties = createSelector(
  selectPropertyFeature,
  (state: PropertyState) => state.properties
);

export const selectSelectedProperty = createSelector(
  selectPropertyFeature,
  (state: PropertyState) => state.selectedProperty
);

export const selectCurrentPage = createSelector(
  selectPropertyFeature,
  (state: PropertyState) => state.currentPage
);

export const selectPageSize = createSelector(
  selectPropertyFeature,
  (state: PropertyState) => state.pageSize
);

export const selectTotalCount = createSelector(
  selectPropertyFeature,
  (state: PropertyState) => state.totalCount
);

export const selectFilters = createSelector(
  selectPropertyFeature,
  (state: PropertyState) => state.filters
);

// Loading states
export const selectLoading = createSelector(
  selectPropertyFeature,
  (state: PropertyState) => state.loading
);

export const selectCreating = createSelector(
  selectPropertyFeature,
  (state: PropertyState) => state.creating
);

export const selectUpdating = createSelector(
  selectPropertyFeature,
  (state: PropertyState) => state.updating
);

export const selectDeleting = createSelector(
  selectPropertyFeature,
  (state: PropertyState) => state.deleting
);

// Errores
export const selectError = createSelector(
  selectPropertyFeature,
  (state: PropertyState) => state.error
);

export const selectValidationErrors = createSelector(
  selectPropertyFeature,
  (state: PropertyState) => state.validationErrors
);

// ============================================================================
// SELECTORS DERIVADOS (Calculan datos a partir de otros selectors)
// ============================================================================

/**
 * Selector: ¿Hay alguna operación en progreso?
 *
 * Este selector COMPONE múltiples selectors básicos.
 *
 * createSelector con múltiples inputs:
 * - Input 1: selectLoading
 * - Input 2: selectCreating
 * - Input 3: selectUpdating
 * - Input 4: selectDeleting
 * - Proyección: (loading, creating, updating, deleting) => boolean
 *
 * La memoización solo recalcula si ALGUNO de los 4 inputs cambió.
 * Si todos siguen igual, retorna el valor cacheado.
 *
 * Uso en componente:
 * ```typescript
 * isAnyLoading$ = this.store.select(selectAnyLoading);
 * // Desactiva toda la UI mientras hay operaciones en progreso
 * ```
 */
export const selectAnyLoading = createSelector(
  selectLoading,
  selectCreating,
  selectUpdating,
  selectDeleting,
  (loading, creating, updating, deleting) =>
    loading || creating || updating || deleting
);

/**
 * Selector: Número total de páginas
 *
 * Calcula cuántas páginas hay basándose en totalCount y pageSize.
 *
 * Ejemplo:
 * - totalCount = 95, pageSize = 10 → 10 páginas
 * - totalCount = 100, pageSize = 10 → 10 páginas
 * - totalCount = 101, pageSize = 10 → 11 páginas
 *
 * Math.ceil() redondea HACIA ARRIBA para incluir la última página parcial.
 */
export const selectTotalPages = createSelector(
  selectTotalCount,
  selectPageSize,
  (totalCount, pageSize) => (pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0)
);

/**
 * Selector: ¿Hay página siguiente?
 */
export const selectHasNextPage = createSelector(
  selectCurrentPage,
  selectTotalPages,
  (currentPage, totalPages) => currentPage < totalPages
);

/**
 * Selector: ¿Hay página anterior?
 */
export const selectHasPreviousPage = createSelector(
  selectCurrentPage,
  (currentPage) => currentPage > 1
);

/**
 * Selector: Información completa de paginación
 *
 * Agrupa toda la info de paginación en un objeto.
 * El componente paginador puede usar este único selector
 * en lugar de suscribirse a 5 selectores por separado.
 *
 * Uso:
 * ```typescript
 * pagination$ = this.store.select(selectPaginationInfo);
 * ```
 *
 * Template:
 * ```html
 * <p-paginator
 *   [rows]="(pagination$ | async)?.pageSize"
 *   [totalRecords]="(pagination$ | async)?.totalCount"
 *   [first]="((pagination$ | async)?.currentPage - 1) * (pagination$ | async)?.pageSize">
 * </p-paginator>
 * ```
 */
export const selectPaginationInfo = createSelector(
  selectCurrentPage,
  selectPageSize,
  selectTotalCount,
  selectTotalPages,
  selectHasNextPage,
  selectHasPreviousPage,
  (currentPage, pageSize, totalCount, totalPages, hasNext, hasPrevious) => ({
    currentPage,
    pageSize,
    totalCount,
    totalPages,
    hasNext,
    hasPrevious,
    // Rango de elementos mostrados: "Mostrando 11-20 de 95"
    rangeStart: totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1,
    rangeEnd: Math.min(currentPage * pageSize, totalCount),
  })
);

/**
 * Selector: ¿Hay filtros activos?
 *
 * Retorna true si hay al menos un filtro aplicado.
 *
 * Object.keys() obtiene las claves del objeto de filtros.
 * Si tiene claves, hay filtros activos.
 *
 * Uso:
 * ```typescript
 * hasFilters$ = this.store.select(selectHasActiveFilters);
 * // Muestra botón "Limpiar filtros" solo cuando hay filtros activos
 * ```
 */
export const selectHasActiveFilters = createSelector(
  selectFilters,
  (filters) => Object.keys(filters).length > 0
);

/**
 * Selector: Número de filtros activos
 *
 * Útil para mostrar un badge con la cantidad de filtros.
 *
 * Uso:
 * ```html
 * <p-badge [value]="(filterCount$ | async)?.toString()"></p-badge>
 * ```
 */
export const selectActiveFilterCount = createSelector(
  selectFilters,
  (filters) => Object.keys(filters).filter((key) => {
    const value = filters[key as keyof typeof filters];
    // Filtra valores vacíos/nulos
    return value !== undefined && value !== null && value !== '';
  }).length
);

/**
 * Selector: Propiedad por ID
 *
 * Busca una propiedad específica en el array de propiedades cargadas.
 *
 * ADVERTENCIA: Este selector usa una función factory.
 * No se puede memoizar directamente porque el ID es un parámetro dinámico.
 *
 * Uso:
 * ```typescript
 * // En el componente:
 * property$ = this.store.select(selectPropertyById(123));
 *
 * // Alternativa con parámetro reactivo:
 * property$ = this.route.params.pipe(
 *   switchMap(params =>
 *     this.store.select(selectPropertyById(+params['id']))
 *   )
 * );
 * ```
 *
 * NOTA: Si la propiedad no está en el store (ej. navegación directa),
 * el resultado será undefined. El componente debe manejar este caso
 * despachando loadPropertyById en ese caso.
 */
export const selectPropertyById = (id: number) =>
  createSelector(selectAllProperties, (properties) =>
    properties.find((p) => p.id === id)
  );

/**
 * Selector: Estado completo del UI
 *
 * Agrupa toda la información necesaria para renderizar la página de propiedades.
 * Usando este selector único, el componente hace una sola suscripción.
 *
 * VENTAJA DE PERFORMANCE:
 * Con un selector compuesto, el componente recibe un objeto nuevo
 * solo cuando ALGUNO de los valores cambia, no en cada acción del store.
 *
 * Uso:
 * ```typescript
 * vm$ = this.store.select(selectPropertyListViewModel);
 *
 * // Template:
 * // <ng-container *ngIf="vm$ | async as vm">
 * //   <div *ngIf="vm.loading">Cargando...</div>
 * //   <div *ngIf="vm.error">{{ vm.error }}</div>
 * //   <property-list [properties]="vm.properties"></property-list>
 * // </ng-container>
 * ```
 */
export const selectPropertyListViewModel = createSelector(
  selectAllProperties,
  selectLoading,
  selectError,
  selectPaginationInfo,
  selectHasActiveFilters,
  selectActiveFilterCount,
  selectFilters,
  (
    properties,
    loading,
    error,
    pagination,
    hasActiveFilters,
    activeFilterCount,
    filters
  ) => ({
    properties,
    loading,
    error,
    pagination,
    hasActiveFilters,
    activeFilterCount,
    filters,
    isEmpty: !loading && properties.length === 0,
  })
);

/**
 * Selector: ViewModel para formulario de propiedad
 *
 * Agrupa el estado relevante para el formulario de crear/editar.
 */
export const selectPropertyFormViewModel = createSelector(
  selectSelectedProperty,
  selectCreating,
  selectUpdating,
  selectError,
  selectValidationErrors,
  (selectedProperty, creating, updating, error, validationErrors) => ({
    property: selectedProperty,
    isEditing: selectedProperty !== null,
    isSaving: creating || updating,
    error,
    validationErrors,
  })
);

// ============================================================================
// NOTAS PEDAGÓGICAS
// ============================================================================

/**
 * ¿Cómo funciona la memoización en createSelector?
 *
 * Internamente, createSelector usa este algoritmo:
 *
 * ```
 * let lastInputs = null;
 * let lastResult = null;
 *
 * function memoizedSelector(state) {
 *   const inputs = inputSelectors.map(s => s(state));
 *
 *   if (inputs every === lastInputs) {
 *     return lastResult;  // ← Retorna caché sin recalcular
 *   }
 *
 *   lastResult = projectionFn(...inputs);
 *   lastInputs = inputs;
 *   return lastResult;
 * }
 * ```
 *
 * La comparación usa ===, así que funciona perfectamente con
 * inmutabilidad: si el Reducer creó un nuevo objeto, === falla
 * y se recalcula. Si el objeto es el mismo, === pasa y se usa caché.
 */

/**
 * Pattern: ViewModel selector
 *
 * En lugar de múltiples suscripciones:
 * ```typescript
 * // ❌ Múltiples suscripciones (ineficiente)
 * properties$ = this.store.select(selectAllProperties);
 * loading$ = this.store.select(selectLoading);
 * error$ = this.store.select(selectError);
 * // → 3 suscripciones, cada una puede disparar change detection
 * ```
 *
 * Usar un ViewModel selector:
 * ```typescript
 * // ✅ Una suscripción (eficiente)
 * vm$ = this.store.select(selectPropertyListViewModel);
 * // → 1 suscripción, recalcula solo si algún valor cambió
 * ```
 *
 * Este pattern es especialmente útil con OnPush change detection,
 * que solo actualiza el componente cuando la referencia del input cambia.
 */

/**
 * ¿Cuándo usar selectPropertyById vs loadPropertyById?
 *
 * selectPropertyById:
 * - Busca en el estado local del store
 * - Rápido (O(n) en el array)
 * - No hace llamadas HTTP
 * - Puede retornar undefined si la propiedad no está cargada
 *
 * loadPropertyById (action → effect):
 * - Hace llamada HTTP al servidor
 * - Lento (red)
 * - Siempre trae datos frescos
 * - Actualiza el store con el resultado
 *
 * Estrategia recomendada:
 * ```typescript
 * ngOnInit() {
 *   const id = +this.route.snapshot.params['id'];
 *
 *   // Primero intentamos del store local
 *   this.store.select(selectPropertyById(id))
 *     .pipe(take(1))
 *     .subscribe(property => {
 *       if (!property) {
 *         // No está en el store, cargar del servidor
 *         this.store.dispatch(loadPropertyById({ id }));
 *       }
 *     });
 * }
 * ```
 */

/**
 * Pattern: Composición de selectores
 *
 * Los selectors se pueden componer en capas:
 *
 * Layer 1 (Feature):
 *   selectPropertyFeature → PropertyState
 *
 * Layer 2 (Primitivos):
 *   selectAllProperties → Property[]
 *   selectCurrentPage → number
 *   selectTotalCount → number
 *
 * Layer 3 (Derivados simples):
 *   selectTotalPages → number (de currentPage + totalCount)
 *   selectHasNextPage → boolean (de currentPage + totalPages)
 *
 * Layer 4 (ViewModels):
 *   selectPaginationInfo → objeto completo
 *   selectPropertyListViewModel → todo lo que necesita la lista
 *
 * Beneficio:
 * Los componentes solo necesitan importar el ViewModel selector de alto nivel.
 * Los cambios en capas bajas se propagan automáticamente hacia arriba.
 */
