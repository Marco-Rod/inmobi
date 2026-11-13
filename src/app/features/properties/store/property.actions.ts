/**
 * Property Actions
 *
 * Las Actions son eventos que describen cambios en la aplicación.
 * Son el ÚNICO mecanismo para modificar el estado en NgRx.
 *
 * CONCEPTOS IMPORTANTES:
 *
 * 1. Actions como eventos:
 *    Las actions describen "qué pasó", no "qué hacer".
 *    Ejemplo: "Usuario hizo click en guardar" vs "Guardar propiedad"
 *
 * 2. Naming convention:
 *    [Source] Event
 *    [Properties Page] Load Properties
 *    [Properties API] Load Properties Success
 *
 * 3. Pattern de tres actions para operaciones async:
 *    - loadProperties: Se dispara la petición
 *    - loadPropertiesSuccess: Petición exitosa
 *    - loadPropertiesFailure: Petición falló
 *
 * 4. Props:
 *    Datos adicionales que viajan con la action.
 *    Deben ser serializables (no funciones, no clases).
 */

import { createAction, props } from '@ngrx/store';
import {
  Property,
  PropertyCreateDto,
  PropertyUpdateDto,
  PropertyFilter,
  PaginatedResponse,
} from '../../../core/models';

// ============================================================================
// LOAD PROPERTIES (Lista con paginación y filtros)
// ============================================================================

/**
 * Load Properties
 *
 * Se dispara cuando se necesita cargar la lista de propiedades.
 *
 * Casos de uso:
 * - Al entrar a la página de propiedades
 * - Al cambiar de página en el paginador
 * - Al aplicar filtros
 * - Al refrescar manualmente
 *
 * Esta action NO carga los datos directamente.
 * Un Effect escuchará esta action y hará la petición HTTP.
 */
export const loadProperties = createAction(
  '[Properties Page] Load Properties',
  props<{
    page?: number;
    pageSize?: number;
    filters?: PropertyFilter;
  }>()
);

/**
 * Load Properties Success
 *
 * Se dispara cuando la petición de propiedades fue exitosa.
 *
 * El Effect que hace la petición HTTP dispara esta action
 * con los datos recibidos del servidor.
 */
export const loadPropertiesSuccess = createAction(
  '[Properties API] Load Properties Success',
  props<{
    response: PaginatedResponse<Property>;
    page: number;
    pageSize: number;
  }>()
);

/**
 * Load Properties Failure
 *
 * Se dispara cuando la petición de propiedades falló.
 *
 * Recibe el mensaje de error para mostrarlo en la UI.
 */
export const loadPropertiesFailure = createAction(
  '[Properties API] Load Properties Failure',
  props<{
    error: string;
  }>()
);

// ============================================================================
// LOAD PROPERTY BY ID (Detalle)
// ============================================================================

/**
 * Load Property By Id
 *
 * Carga una propiedad específica por su ID.
 *
 * Casos de uso:
 * - Al entrar a la página de detalle
 * - Al abrir un modal de edición
 * - Al necesitar datos frescos de una propiedad
 */
export const loadPropertyById = createAction(
  '[Property Detail Page] Load Property By Id',
  props<{
    id: number;
  }>()
);

export const loadPropertyByIdSuccess = createAction(
  '[Properties API] Load Property By Id Success',
  props<{
    property: Property;
  }>()
);

export const loadPropertyByIdFailure = createAction(
  '[Properties API] Load Property By Id Failure',
  props<{
    error: string;
  }>()
);

// ============================================================================
// CREATE PROPERTY (Alta)
// ============================================================================

/**
 * Create Property
 *
 * Inicia el proceso de creación de una nueva propiedad.
 *
 * Flujo:
 * 1. Usuario llena formulario
 * 2. Usuario hace click en "Guardar"
 * 3. Se dispara esta action con los datos del formulario
 * 4. Effect hace POST al servidor
 * 5. Si éxito: createPropertySuccess
 * 6. Si error: createPropertyFailure
 */
export const createProperty = createAction(
  '[Property Form] Create Property',
  props<{
    property: PropertyCreateDto;
  }>()
);

export const createPropertySuccess = createAction(
  '[Properties API] Create Property Success',
  props<{
    property: Property;
  }>()
);

export const createPropertyFailure = createAction(
  '[Properties API] Create Property Failure',
  props<{
    error: string;
    validationErrors?: Record<string, string[]>;
  }>()
);

// ============================================================================
// UPDATE PROPERTY (Modificación)
// ============================================================================

/**
 * Update Property
 *
 * Actualiza una propiedad existente.
 *
 * IMPORTANTE:
 * El DTO puede contener solo los campos que cambiaron (partial update).
 * El servidor decide cómo merge los cambios.
 */
export const updateProperty = createAction(
  '[Property Form] Update Property',
  props<{
    id: number;
    changes: PropertyUpdateDto;
  }>()
);

export const updatePropertySuccess = createAction(
  '[Properties API] Update Property Success',
  props<{
    property: Property;
  }>()
);

export const updatePropertyFailure = createAction(
  '[Properties API] Update Property Failure',
  props<{
    error: string;
    validationErrors?: Record<string, string[]>;
  }>()
);

// ============================================================================
// DELETE PROPERTY (Baja)
// ============================================================================

/**
 * Delete Property
 *
 * Elimina una propiedad.
 *
 * IMPORTANTE:
 * Debe haber confirmación del usuario antes de disparar esta action.
 * Es una operación destructiva.
 */
export const deleteProperty = createAction(
  '[Property List] Delete Property',
  props<{
    id: number;
  }>()
);

export const deletePropertySuccess = createAction(
  '[Properties API] Delete Property Success',
  props<{
    id: number;
  }>()
);

export const deletePropertyFailure = createAction(
  '[Properties API] Delete Property Failure',
  props<{
    error: string;
  }>()
);

// ============================================================================
// FILTROS Y PAGINACIÓN
// ============================================================================

/**
 * Set Filters
 *
 * Actualiza los filtros activos.
 *
 * IMPORTANTE:
 * Esta action NO carga datos automáticamente.
 * Debes disparar loadProperties después de setFilters.
 *
 * Pattern recomendado en el componente:
 * ```typescript
 * this.store.dispatch(setFilters({ filters: newFilters }));
 * this.store.dispatch(loadProperties({ page: 1 }));
 * ```
 *
 * O mejor, crea una action compuesta:
 * ```typescript
 * export const applyFilters = createAction(...);
 * ```
 */
export const setFilters = createAction(
  '[Properties Filter] Set Filters',
  props<{
    filters: PropertyFilter;
  }>()
);

/**
 * Clear Filters
 *
 * Limpia todos los filtros activos.
 *
 * Resetea el objeto filters a {}.
 * No recarga automáticamente, necesitas disparar loadProperties.
 */
export const clearFilters = createAction('[Properties Filter] Clear Filters');

/**
 * Set Current Page
 *
 * Cambia la página actual sin modificar los filtros.
 *
 * Pattern en el componente:
 * ```typescript
 * onPageChange(page: number) {
 *   this.store.dispatch(setCurrentPage({ page }));
 *   this.store.dispatch(loadProperties({ page }));
 * }
 * ```
 */
export const setCurrentPage = createAction(
  '[Properties Paginator] Set Current Page',
  props<{
    page: number;
  }>()
);

/**
 * Set Page Size
 *
 * Cambia el número de elementos por página.
 *
 * IMPORTANTE:
 * Al cambiar pageSize, debe resetear a página 1.
 */
export const setPageSize = createAction(
  '[Properties Paginator] Set Page Size',
  props<{
    pageSize: number;
  }>()
);

// ============================================================================
// SELECCIÓN
// ============================================================================

/**
 * Select Property
 *
 * Marca una propiedad como seleccionada actualmente.
 *
 * Casos de uso:
 * - Usuario hace click en una fila de la tabla
 * - Se abre un panel lateral con detalles
 * - Se habilitan acciones contextuales
 *
 * NOTA:
 * Esta action NO carga datos del servidor.
 * Solo actualiza selectedProperty con una propiedad ya en el store.
 */
export const selectProperty = createAction(
  '[Property List] Select Property',
  props<{
    property: Property;
  }>()
);

/**
 * Deselect Property
 *
 * Quita la selección actual (selectedProperty = null).
 */
export const deselectProperty = createAction(
  '[Property List] Deselect Property'
);

// ============================================================================
// ERRORES
// ============================================================================

/**
 * Clear Error
 *
 * Limpia el error actual del estado.
 *
 * Casos de uso:
 * - Usuario cierra el mensaje de error
 * - Se intenta una nueva operación
 * - Se navega a otra sección
 */
export const clearError = createAction('[Properties] Clear Error');

/**
 * Clear Validation Errors
 *
 * Limpia los errores de validación del formulario.
 *
 * Casos de uso:
 * - Usuario cierra el formulario
 * - Se resetea el formulario
 * - Se inicia una nueva operación
 */
export const clearValidationErrors = createAction(
  '[Properties] Clear Validation Errors'
);

// ============================================================================
// NOTAS PEDAGÓGICAS
// ============================================================================

/**
 * ¿Por qué usar createAction en lugar de clases?
 *
 * NgRx antiguo (v7 y anteriores):
 * ```typescript
 * export class LoadProperties implements Action {
 *   readonly type = '[Properties] Load';
 *   constructor(public payload: { page: number }) {}
 * }
 * ```
 *
 * Problemas:
 * - Mucho boilerplate
 * - Type safety débil
 * - Difícil de refactorizar
 *
 * NgRx moderno (v8+):
 * ```typescript
 * export const loadProperties = createAction(
 *   '[Properties] Load',
 *   props<{ page: number }>()
 * );
 * ```
 *
 * Ventajas:
 * ✅ Menos código
 * ✅ Type safety fuerte
 * ✅ Mejor autocompletado en IDE
 * ✅ Más fácil de mantener
 */

/**
 * Pattern: Actions como eventos vs comandos
 *
 * ❌ Mal (comandos):
 * - saveProperty
 * - updateDatabase
 * - showNotification
 *
 * ✅ Bien (eventos):
 * - [Property Form] Save Button Clicked
 * - [Properties API] Save Property Success
 * - [Properties API] Save Property Failure
 *
 * Razón:
 * - Las actions describen QUÉ PASÓ, no QUÉ HACER
 * - Múltiples reducers/effects pueden reaccionar a un mismo evento
 * - Mejor trazabilidad y debugging
 * - Event sourcing pattern
 */

/**
 * Pattern: Naming convention [Source] Event
 *
 * [Source] indica DÓNDE se originó la action:
 *
 * - [Properties Page]: Desde el componente de lista
 * - [Property Form]: Desde el formulario
 * - [Properties API]: Respuesta del servidor
 * - [Property Detail Page]: Desde la página de detalle
 * - [Properties Filter]: Desde el componente de filtros
 *
 * Ventajas:
 * - Fácil rastrear el origen de la action en DevTools
 * - Evita colisiones de nombres
 * - Documenta el flujo de datos
 */

/**
 * ¿Cuándo crear actions compuestas?
 *
 * Action simple:
 * ```typescript
 * setFilters({ filters })
 * ```
 *
 * Action compuesta:
 * ```typescript
 * applyFiltersAndReload({ filters })
 * ```
 *
 * La action compuesta es manejada por un Effect que dispara:
 * 1. setFilters({ filters })
 * 2. setCurrentPage({ page: 1 })
 * 3. loadProperties({ page: 1, filters })
 *
 * Ventajas:
 * ✅ Componente más simple
 * ✅ Lógica coordinada en un solo lugar
 * ✅ Menos disparos de actions desde componentes
 *
 * Desventajas:
 * ⚠️ Menos explícito
 * ⚠️ Actions menos granulares
 *
 * Recomendación: Empezar con actions simples, crear compuestas cuando
 * notes que siempre disparas las mismas 2-3 actions juntas.
 */

/**
 * ¿Qué debe ir en props?
 *
 * ✅ Debe ser serializable:
 * - Primitivos: string, number, boolean
 * - Objetos planos: { ... }
 * - Arrays: [ ... ]
 * - null, undefined
 *
 * ❌ NO debe ser:
 * - Funciones
 * - Clases instanciadas
 * - Promises
 * - Observables
 * - DOM nodes
 * - Símbolos
 *
 * Razón:
 * NgRx Store puede persistir el estado (localStorage, IndexedDB).
 * Redux DevTools necesita serializar las actions.
 * Time-travel debugging requiere serialización.
 */

/**
 * Pattern: Errores de validación vs errores generales
 *
 * createPropertyFailure tiene DOS tipos de error:
 *
 * 1. error: string
 *    - Error general del sistema
 *    - "Error de conexión"
 *    - "Servidor no disponible"
 *    - Se muestra como notificación global
 *
 * 2. validationErrors?: Record<string, string[]>
 *    - Errores por campo del formulario
 *    - { "title": ["El título es requerido"] }
 *    - Se muestran junto a cada input
 *
 * En el componente:
 * ```typescript
 * this.store.select(selectError).subscribe(error => {
 *   if (error) this.showToast(error);
 * });
 *
 * this.store.select(selectValidationErrors).subscribe(errors => {
 *   if (errors) this.form.setErrors(errors);
 * });
 * ```
 */
