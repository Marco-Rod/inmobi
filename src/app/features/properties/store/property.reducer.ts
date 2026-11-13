/**
 * Property Reducer
 *
 * El Reducer es una función PURA que recibe el estado actual y una action,
 * y retorna un NUEVO estado. Nunca modifica el estado existente.
 *
 * CONCEPTOS IMPORTANTES:
 *
 * 1. Función pura:
 *    - Mismo input → siempre mismo output
 *    - Sin efectos secundarios (no hace llamadas HTTP, no modifica DOM)
 *    - No modifica sus argumentos
 *
 * 2. Inmutabilidad:
 *    - Nunca: state.properties.push(newProp)   ❌
 *    - Siempre: { ...state, properties: [...state.properties, newProp] } ✅
 *
 * 3. on() syntax:
 *    - Mapea cada action a su handler de estado
 *    - TypeScript infiere los tipos automáticamente
 *
 * 4. createReducer:
 *    - Crea el reducer de forma type-safe
 *    - Maneja la acción "INIT" de NgRx automáticamente
 */

import { createReducer, on } from '@ngrx/store';
import { initialPropertyState } from './property.state';
import * as PropertyActions from './property.actions';

/**
 * Property Reducer
 *
 * createReducer toma:
 * 1. El estado inicial
 * 2. Una serie de manejadores on(action, handler)
 *
 * Cada on() recibe:
 * - La action a manejar
 * - Una función (state, action) => newState
 *
 * TypeScript infiere automáticamente:
 * - El tipo de `state` es PropertyState
 * - El tipo de `action` incluye los props de la action
 */
export const propertyReducer = createReducer(
  initialPropertyState,

  // ============================================================================
  // LOAD PROPERTIES
  // ============================================================================

  /**
   * Cuando se inicia la carga de propiedades:
   * - loading = true: Activamos el spinner
   * - error = null: Limpiamos errores anteriores
   * - Mantenemos el resto del estado intacto (filtros, página, etc.)
   *
   * Spread operator: { ...state } crea una copia superficial del objeto.
   * Las propiedades que no mencionamos se mantienen sin cambios.
   */
  on(PropertyActions.loadProperties, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  /**
   * Cuando la carga fue exitosa:
   * - loading = false: Quitamos el spinner
   * - properties: Reemplazamos con los nuevos datos
   * - totalCount: Actualizamos el total para el paginador
   * - currentPage: Actualizamos la página actual
   *
   * IMPORTANTE:
   * No hacemos push() al array existente, creamos un NUEVO array.
   * Esto es fundamental para que Angular detecte los cambios.
   */
  /**
   * PaginatedResponse tiene la forma:
   * { count, results, next, previous }
   *
   * Mapeamos:
   * - results → properties (los datos)
   * - count   → totalCount (total de registros)
   * - next    → si es número, currentPage = next - 1 (página actual)
   *
   * Para la página actual, la extraemos desde la action
   * (ver loadProperties action que lleva el page pedido).
   */
  on(PropertyActions.loadPropertiesSuccess, (state, { response, page, pageSize }) => ({
    ...state,
    loading: false,
    properties: response.results,
    totalCount: response.count,
    currentPage: page ?? state.currentPage,
    pageSize: pageSize ?? state.pageSize,
    error: null,
  })),

  /**
   * Cuando la carga falló:
   * - loading = false: Quitamos el spinner
   * - error: Guardamos el mensaje de error para mostrar en UI
   * - properties = []: Limpiamos propiedades anteriores (opcional, depende del UX)
   */
  on(PropertyActions.loadPropertiesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // ============================================================================
  // LOAD PROPERTY BY ID
  // ============================================================================

  /**
   * Cuando se inicia la carga de una propiedad específica:
   * - loading = true
   * - selectedProperty = null: Limpiamos la selección anterior
   */
  on(PropertyActions.loadPropertyById, (state) => ({
    ...state,
    loading: true,
    error: null,
    selectedProperty: null,
  })),

  on(PropertyActions.loadPropertyByIdSuccess, (state, { property }) => ({
    ...state,
    loading: false,
    selectedProperty: property,
    error: null,
  })),

  on(PropertyActions.loadPropertyByIdFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // ============================================================================
  // CREATE PROPERTY
  // ============================================================================

  /**
   * Cuando se inicia la creación:
   * - creating = true: Deshabilitamos el botón "Guardar"
   * - validationErrors = null: Limpiamos errores de formulario anteriores
   */
  on(PropertyActions.createProperty, (state) => ({
    ...state,
    creating: true,
    error: null,
    validationErrors: null,
  })),

  /**
   * Cuando la creación fue exitosa:
   * - creating = false
   * - Agregamos la nueva propiedad al INICIO de la lista
   * - totalCount + 1: Actualizamos el contador
   *
   * TÉCNICA: Spread para agregar al inicio:
   * [...nuevo, ...existentes] → la nueva propiedad aparece primero
   */
  on(PropertyActions.createPropertySuccess, (state, { property }) => ({
    ...state,
    creating: false,
    properties: [property, ...state.properties],
    totalCount: state.totalCount + 1,
    error: null,
    validationErrors: null,
  })),

  /**
   * Cuando la creación falló:
   * - creating = false
   * - Guardamos ambos tipos de error
   */
  on(
    PropertyActions.createPropertyFailure,
    (state, { error, validationErrors }) => ({
      ...state,
      creating: false,
      error,
      validationErrors: validationErrors ?? null,
    })
  ),

  // ============================================================================
  // UPDATE PROPERTY
  // ============================================================================

  /**
   * Cuando se inicia la actualización:
   * - updating = true: Deshabilitamos el botón "Actualizar"
   */
  on(PropertyActions.updateProperty, (state) => ({
    ...state,
    updating: true,
    error: null,
    validationErrors: null,
  })),

  /**
   * Cuando la actualización fue exitosa:
   * - updating = false
   * - Reemplazamos la propiedad en el array
   *
   * TÉCNICA: map() para actualizar un elemento en el array:
   * - Por cada propiedad, si su ID coincide, retornamos la nueva versión
   * - Si no coincide, retornamos la propiedad sin cambios
   *
   * Esto crea un NUEVO array, cumpliendo inmutabilidad.
   *
   * Alternativa con spread:
   * [
   *   ...state.properties.slice(0, index),
   *   updatedProperty,
   *   ...state.properties.slice(index + 1)
   * ]
   * Más verboso, map() es más limpio.
   */
  on(PropertyActions.updatePropertySuccess, (state, { property }) => ({
    ...state,
    updating: false,
    properties: state.properties.map((p) =>
      p.id === property.id ? property : p
    ),
    // Si la propiedad actualizada es la seleccionada, actualizamos también
    selectedProperty:
      state.selectedProperty?.id === property.id
        ? property
        : state.selectedProperty,
    error: null,
    validationErrors: null,
  })),

  on(
    PropertyActions.updatePropertyFailure,
    (state, { error, validationErrors }) => ({
      ...state,
      updating: false,
      error,
      validationErrors: validationErrors ?? null,
    })
  ),

  // ============================================================================
  // DELETE PROPERTY
  // ============================================================================

  /**
   * Cuando se inicia la eliminación:
   * - deleting = true: Deshabilitamos el botón "Eliminar"
   */
  on(PropertyActions.deleteProperty, (state) => ({
    ...state,
    deleting: true,
    error: null,
  })),

  /**
   * Cuando la eliminación fue exitosa:
   * - deleting = false
   * - Removemos la propiedad del array con filter()
   * - Si era la seleccionada, la deseleccionamos
   * - totalCount - 1
   *
   * TÉCNICA: filter() para remover elementos:
   * state.properties.filter(p => p.id !== id)
   * Retorna un NUEVO array sin la propiedad eliminada.
   */
  on(PropertyActions.deletePropertySuccess, (state, { id }) => ({
    ...state,
    deleting: false,
    properties: state.properties.filter((p) => p.id !== id),
    selectedProperty:
      state.selectedProperty?.id === id ? null : state.selectedProperty,
    totalCount: state.totalCount - 1,
    error: null,
  })),

  on(PropertyActions.deletePropertyFailure, (state, { error }) => ({
    ...state,
    deleting: false,
    error,
  })),

  // ============================================================================
  // FILTROS Y PAGINACIÓN
  // ============================================================================

  /**
   * Cuando se establecen filtros:
   * Solo actualizamos los filtros.
   * No tocamos properties ni loading (eso lo hace loadProperties).
   */
  on(PropertyActions.setFilters, (state, { filters }) => ({
    ...state,
    filters,
    currentPage: 1, // Al cambiar filtros, volvemos a la primera página
  })),

  /**
   * Cuando se limpian los filtros:
   * Reseteamos al objeto vacío y volvemos a página 1.
   */
  on(PropertyActions.clearFilters, (state) => ({
    ...state,
    filters: {},
    currentPage: 1,
  })),

  on(PropertyActions.setCurrentPage, (state, { page }) => ({
    ...state,
    currentPage: page,
  })),

  /**
   * Cuando se cambia el pageSize:
   * También reseteamos a página 1 para evitar páginas fuera de rango.
   */
  on(PropertyActions.setPageSize, (state, { pageSize }) => ({
    ...state,
    pageSize,
    currentPage: 1,
  })),

  // ============================================================================
  // SELECCIÓN
  // ============================================================================

  on(PropertyActions.selectProperty, (state, { property }) => ({
    ...state,
    selectedProperty: property,
  })),

  on(PropertyActions.deselectProperty, (state) => ({
    ...state,
    selectedProperty: null,
  })),

  // ============================================================================
  // LIMPIAR ERRORES
  // ============================================================================

  on(PropertyActions.clearError, (state) => ({
    ...state,
    error: null,
  })),

  on(PropertyActions.clearValidationErrors, (state) => ({
    ...state,
    validationErrors: null,
  }))
);

// ============================================================================
// NOTAS PEDAGÓGICAS
// ============================================================================

/**
 * ¿Por qué las funciones del reducer deben ser puras?
 *
 * Una función pura:
 * - No modifica sus argumentos
 * - No tiene efectos secundarios
 * - Mismo input → siempre mismo output
 *
 * Beneficios:
 * 1. Predecible: Fácil de razonar
 * 2. Testeable: No necesita mocks
 * 3. Time-travel debugging: NgRx puede "rebobinar" el estado
 * 4. Serializable: Se puede guardar/restaurar el estado
 *
 * ❌ Función IMPURA (nunca hacer esto):
 * ```typescript
 * on(loadPropertiesSuccess, (state, { response }) => {
 *   state.properties = response.data;  // MUTACIÓN DIRECTA!
 *   state.loading = false;             // MUTACIÓN DIRECTA!
 *   return state;
 * })
 * ```
 *
 * ✅ Función PURA (siempre hacer esto):
 * ```typescript
 * on(loadPropertiesSuccess, (state, { response }) => ({
 *   ...state,
 *   properties: response.data,  // Nuevo objeto
 *   loading: false              // Nuevo valor
 * }))
 * ```
 */

/**
 * ¿Cómo funciona el spread operator con objetos?
 *
 * const original = { a: 1, b: 2, c: 3 };
 *
 * // Copia con una propiedad cambiada:
 * const nuevo = { ...original, b: 99 };
 * // Resultado: { a: 1, b: 99, c: 3 }
 *
 * // Las propiedades DESPUÉS del spread sobreescriben:
 * const a = { x: 1, y: 2 };
 * const b = { ...a, x: 99 };  // x = 99 (sobreescribe)
 * // { x: 99, y: 2 }
 *
 * // Las propiedades ANTES del spread son sobreescritas:
 * const c = { x: 99, ...a };  // x = 1 (sobreescrito por a)
 * // { x: 1, y: 2 }
 *
 * IMPORTANTE: Spread es copia SUPERFICIAL (shallow copy).
 * Para objetos anidados, solo copia la referencia:
 *
 * const state = { filters: { type: 'casa' }, properties: [] };
 * const nuevo = { ...state };
 *
 * // nuevo.filters === state.filters (misma referencia)
 * // Si modificas nuevo.filters, también modificas state.filters!
 *
 * Por eso cuando modificamos filters:
 * const nuevo = { ...state, filters: { ...state.filters, type: 'depa' } };
 * // Creamos un NUEVO objeto para filters también.
 */

/**
 * ¿Por qué usamos map() y filter() en lugar de splice() o push()?
 *
 * Array MUTABLES (NO usar en reducers):
 * - push(): Modifica el array original
 * - pop(): Modifica el array original
 * - splice(): Modifica el array original
 * - sort(): Modifica el array original
 * - reverse(): Modifica el array original
 *
 * Array INMUTABLES (usar en reducers):
 * - map(): Retorna NUEVO array transformado
 * - filter(): Retorna NUEVO array filtrado
 * - slice(): Retorna NUEVO array (porción)
 * - concat(): Retorna NUEVO array combinado
 * - [...arr, nuevo]: Spread para agregar elementos
 * - [...arr.slice(0, i), nuevo, ...arr.slice(i)]: Insertar en posición
 *
 * Ejemplo de inmutabilidad con arrays:
 *
 * const original = [1, 2, 3];
 *
 * // Agregar al final (inmutable):
 * const nuevo = [...original, 4];        // [1, 2, 3, 4]
 *
 * // Remover elemento (inmutable):
 * const sin2 = original.filter(n => n !== 2);  // [1, 3]
 *
 * // Actualizar elemento (inmutable):
 * const actualizado = original.map(n => n === 2 ? 99 : n);  // [1, 99, 3]
 */

/**
 * Pattern: Actualizar propiedad en array
 *
 * Este pattern es muy común en NgRx:
 *
 * ```typescript
 * properties: state.properties.map(p =>
 *   p.id === property.id ? property : p
 * )
 * ```
 *
 * Equivalente más explícito:
 * ```typescript
 * properties: state.properties.map(p => {
 *   if (p.id === property.id) {
 *     return property;  // Retorna la versión actualizada
 *   }
 *   return p;           // Retorna sin cambios
 * })
 * ```
 *
 * También puedes hacer partial update:
 * ```typescript
 * properties: state.properties.map(p =>
 *   p.id === changes.id
 *     ? { ...p, ...changes }  // Merge de cambios
 *     : p
 * )
 * ```
 */
