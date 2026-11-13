/**
 * Property Effects
 *
 * Los Effects son el lugar donde vive la lógica con efectos secundarios
 * en NgRx. Los efectos secundarios incluyen:
 * - Llamadas HTTP (lo más común)
 * - LocalStorage
 * - Routing
 * - Notificaciones
 * - Analytics
 *
 * CONCEPTOS IMPORTANTES:
 *
 * 1. Effects como middleware:
 *    Action entra → Effect escucha → Effect hace trabajo asíncrono → Dispatch nueva action
 *
 * 2. createEffect():
 *    Crea un effect que NgRx registra y suscribe automáticamente.
 *
 * 3. ofType():
 *    Filtra el stream de actions para escuchar solo las que nos interesan.
 *
 * 4. switchMap vs mergeMap vs exhaustMap vs concatMap:
 *    Son operadores de "aplanamiento" de Observables anidados.
 *    Cada uno tiene comportamiento diferente con múltiples emisiones.
 *
 * 5. IMPORTANTE:
 *    Los effects NUNCA deben fallar.
 *    Los errores se manejan con catchError y se retorna una Failure action.
 */

import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import {
  switchMap,
  mergeMap,
  map,
  catchError,
  tap,
  withLatestFrom,
  exhaustMap,
} from 'rxjs/operators';
import { of } from 'rxjs';

import { PropertyApiService } from '../../../core/services/api/property-api.service';
import * as PropertyActions from './property.actions';
import { selectCurrentPage, selectPageSize, selectFilters } from './property.selectors';

@Injectable()
export class PropertyEffects {
  /**
   * Inyecciones usando inject() - sintaxis moderna Angular 16+
   *
   * actions$ es el stream global de todas las actions que se dispatchen.
   * Los Effects se suscriben a este stream y filtran las que les interesan.
   *
   * Convención: El $ al final indica que es un Observable.
   */
  private readonly actions$ = inject(Actions);
  private readonly propertyApi = inject(PropertyApiService);
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  // ============================================================================
  // LOAD PROPERTIES
  // ============================================================================

  /**
   * Effect: Cargar lista de propiedades
   *
   * Escucha: loadProperties
   * Dispara: loadPropertiesSuccess | loadPropertiesFailure
   *
   * OPERADOR USADO: switchMap
   *
   * switchMap cancela el Observable anterior cuando llega uno nuevo.
   * Ideal para búsquedas y filtros donde solo importa el último resultado.
   *
   * Ejemplo con switchMap:
   * - Usuario escribe "casa" → petición 1 inicia
   * - Usuario escribe "casa grande" → petición 1 SE CANCELA, petición 2 inicia
   * - Solo llega respuesta de petición 2
   *
   * Otros operadores:
   * - mergeMap: Deja correr todas las peticiones en paralelo
   * - exhaustMap: Ignora nuevas acciones hasta que la actual termina
   * - concatMap: Las encola, una por una en orden
   */
  loadProperties$ = createEffect(() =>
    this.actions$.pipe(
      /**
       * ofType() - Filtra acciones por tipo
       *
       * Solo deja pasar las acciones que coincidan con el tipo.
       * TypeScript infiere automáticamente el tipo correcto del payload.
       */
      ofType(PropertyActions.loadProperties),

      /**
       * withLatestFrom() - Combina con el último valor de otro Observable
       *
       * Aquí leemos los valores actuales del store (página, filtros, pageSize)
       * en el momento en que llega la action.
       *
       * Si la action trae page/filters propios, los usamos.
       * Si no, usamos los del store (mantener estado actual).
       */
      withLatestFrom(
        this.store.select(selectCurrentPage),
        this.store.select(selectPageSize),
        this.store.select(selectFilters)
      ),

      switchMap(([action, currentPage, currentPageSize, currentFilters]) => {
        // Usamos los valores de la action o los del store como fallback
        const page = action.page ?? currentPage;
        const pageSize = action.pageSize ?? currentPageSize;
        const filters = action.filters ?? currentFilters;

        console.log('🔄 [PropertyEffects] Cargando propiedades...', {
          page,
          pageSize,
          filters,
        });

        /**
         * La petición HTTP retorna un Observable.
         * switchMap "aplana" el Observable interno.
         *
         * Sin switchMap:
         * Observable<Observable<PaginatedResponse>>  ← Observable de Observables
         *
         * Con switchMap:
         * Observable<PaginatedResponse>  ← Observable plano
         */
        return this.propertyApi.getProperties(filters, page, pageSize).pipe(
          /**
           * map() transforma la respuesta exitosa en una Success action.
           *
           * Esta action será recibida por el Reducer para actualizar el estado.
           */
          map((response) =>
            PropertyActions.loadPropertiesSuccess({
              response,
              page,
              pageSize,
            })
          ),

          /**
           * catchError() - Captura errores y retorna un Observable alternativo
           *
           * CRÍTICO: Debe ir DENTRO del switchMap, no fuera.
           *
           * Si catchError está FUERA del switchMap:
           * → Al ocurrir un error, el effect COMPLETA y deja de escuchar actions.
           * → ¡La app deja de funcionar!
           *
           * Si catchError está DENTRO del switchMap (correcto):
           * → Solo el Observable interno falla
           * → El effect externo sigue corriendo
           * → La app sigue funcionando
           *
           * of() crea un Observable que emite un valor inmediatamente.
           * Usamos of() para convertir el error en una Failure action.
           */
          catchError((error: { message?: string }) => {
            const errorMessage =
              error?.message ?? 'Error al cargar propiedades';
            console.error('❌ [PropertyEffects] Error cargando propiedades:', errorMessage);
            return of(
              PropertyActions.loadPropertiesFailure({ error: errorMessage })
            );
          })
        );
      })
    )
  );

  // ============================================================================
  // LOAD PROPERTY BY ID
  // ============================================================================

  /**
   * Effect: Cargar propiedad por ID
   *
   * También usa switchMap: si se navega rápido entre propiedades,
   * cancela la petición anterior y solo muestra la última.
   */
  loadPropertyById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropertyActions.loadPropertyById),

      switchMap(({ id }) =>
        this.propertyApi.getPropertyById(id).pipe(
          map((property) =>
            PropertyActions.loadPropertyByIdSuccess({ property })
          ),
          catchError((error: { message?: string }) =>
            of(
              PropertyActions.loadPropertyByIdFailure({
                error: error?.message ?? `Error al cargar propiedad #${id}`,
              })
            )
          )
        )
      )
    )
  );

  // ============================================================================
  // CREATE PROPERTY
  // ============================================================================

  /**
   * Effect: Crear propiedad
   *
   * OPERADOR USADO: exhaustMap
   *
   * exhaustMap ignora nuevas acciones mientras hay una en progreso.
   * Ideal para evitar doble-submit de formularios.
   *
   * Ejemplo:
   * - Usuario hace click en "Guardar" → petición 1 inicia
   * - Usuario hace click de nuevo → IGNORADO (petición 1 en progreso)
   * - Solo se crea UNA propiedad, no dos
   *
   * Comparación:
   * - switchMap: Cancela la anterior, usa la nueva
   * - exhaustMap: Ignora la nueva, termina la anterior
   * - mergeMap: Las corre todas en paralelo
   * - concatMap: Las encola, una por una
   *
   * Para formularios: exhaustMap
   * Para búsquedas: switchMap
   * Para operaciones independientes: mergeMap
   * Para secuencias ordenadas: concatMap
   */
  createProperty$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropertyActions.createProperty),

      exhaustMap(({ property }) =>
        this.propertyApi.createProperty(property).pipe(
          map((createdProperty) =>
            PropertyActions.createPropertySuccess({
              property: createdProperty,
            })
          ),
          catchError((error: { message?: string; errors?: Record<string, string[]> }) =>
            of(
              PropertyActions.createPropertyFailure({
                error: error?.message ?? 'Error al crear la propiedad',
                validationErrors: error?.errors,
              })
            )
          )
        )
      )
    )
  );

  /**
   * Effect: Navegar después de crear propiedad exitosamente
   *
   * { dispatch: false } indica que este effect NO dispara ninguna action.
   * Solo tiene un efecto secundario: navegación.
   *
   * Casos de uso para dispatch: false:
   * - Navegación
   * - Notificaciones
   * - Logging
   * - Guardar en localStorage
   */
  createPropertySuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PropertyActions.createPropertySuccess),

        tap(({ property }) => {
          console.log(`✅ [PropertyEffects] Propiedad creada #${property.id}, navegando...`);
          // Navegar a la lista o al detalle de la nueva propiedad
          this.router.navigate(['/properties']);
        })
      ),
    { dispatch: false } // ← No dispara ninguna action
  );

  // ============================================================================
  // UPDATE PROPERTY
  // ============================================================================

  /**
   * Effect: Actualizar propiedad
   *
   * OPERADOR USADO: mergeMap
   *
   * mergeMap permite múltiples actualizaciones en paralelo.
   * Si el usuario actualiza varias propiedades rápidamente,
   * todas las peticiones corren concurrentemente.
   *
   * Para updates donde no hay conflicto entre ellos, mergeMap es OK.
   * Si los updates pueden conflictar, usa concatMap para serializar.
   */
  updateProperty$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropertyActions.updateProperty),

      mergeMap(({ id, changes }) =>
        this.propertyApi.updateProperty(id, changes).pipe(
          map((updatedProperty) =>
            PropertyActions.updatePropertySuccess({
              property: updatedProperty,
            })
          ),
          catchError((error: { message?: string; errors?: Record<string, string[]> }) =>
            of(
              PropertyActions.updatePropertyFailure({
                error: error?.message ?? 'Error al actualizar la propiedad',
                validationErrors: error?.errors,
              })
            )
          )
        )
      )
    )
  );

  // ============================================================================
  // DELETE PROPERTY
  // ============================================================================

  /**
   * Effect: Eliminar propiedad
   *
   * OPERADOR USADO: mergeMap
   *
   * delete retorna void, así que mapeamos el id original en el success.
   * El id viene de la action y lo pasamos al Success action
   * para que el Reducer pueda encontrar y eliminar la propiedad del estado.
   */
  deleteProperty$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropertyActions.deleteProperty),

      mergeMap(({ id }) =>
        this.propertyApi.deleteProperty(id).pipe(
          /**
           * deleteProperty retorna Observable<void>
           * No tenemos datos de respuesta, pero necesitamos el id
           * para que el Reducer sepa qué propiedad eliminar.
           *
           * Usamos el id que viene de la action (closure).
           */
          map(() => PropertyActions.deletePropertySuccess({ id })),

          catchError((error: { message?: string }) =>
            of(
              PropertyActions.deletePropertyFailure({
                error: error?.message ?? 'Error al eliminar la propiedad',
              })
            )
          )
        )
      )
    )
  );

  /**
   * Effect: Side effects después de eliminar
   * - Navegar a lista si se elimina la propiedad que se está viendo
   */
  deletePropertySuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PropertyActions.deletePropertySuccess),

        tap(({ id }) => {
          console.log(`✅ [PropertyEffects] Propiedad #${id} eliminada`);
          // Si navegamos de vuelta a la lista, el store ya no tendrá esta propiedad
          this.router.navigate(['/properties']);
        })
      ),
    { dispatch: false }
  );
}

// ============================================================================
// NOTAS PEDAGÓGICAS
// ============================================================================

/**
 * ¿Por qué los Effects en lugar de llamar HTTP en el Reducer?
 *
 * Reducers DEBEN ser funciones puras (sin efectos secundarios).
 * HTTP es un efecto secundario.
 *
 * ❌ Nunca hagas esto en un Reducer:
 * ```typescript
 * on(loadProperties, (state) => {
 *   this.http.get(url).subscribe(...);  // PROHIBIDO!
 *   return { ...state, loading: true };
 * })
 * ```
 *
 * ✅ Separa concerns:
 * - Reducer: Lógica de estado pura
 * - Effect: Lógica asíncrona e impura
 */

/**
 * Tabla comparativa de operadores de aplanamiento:
 *
 * | Operador    | Qué hace con múltiples emisiones       | Cuándo usar             |
 * |-------------|----------------------------------------|-------------------------|
 * | switchMap   | Cancela la anterior, usa la nueva      | Búsquedas, typeahead    |
 * | mergeMap    | Las corre todas en paralelo            | Updates independientes  |
 * | exhaustMap  | Ignora nuevas hasta terminar actual    | Submit de formularios   |
 * | concatMap   | Las encola, una por una en orden       | Operaciones secuenciales|
 *
 * Regla general:
 * - Solo una operación importa (search): switchMap
 * - Prevenir doble submit: exhaustMap
 * - Operaciones independientes: mergeMap
 * - Orden importa: concatMap
 */

/**
 * Pattern: catchError SIEMPRE dentro del operador de aplanamiento
 *
 * ❌ MAL - catchError fuera de switchMap:
 * ```typescript
 * this.actions$.pipe(
 *   ofType(loadProperties),
 *   switchMap(action => this.api.getProperties()),
 *   catchError(err => of(loadPropertiesFailure({ error: err.message })))
 *   // ↑ Si hay error, el STREAM ENTERO falla y el effect muere
 * )
 * ```
 *
 * ✅ BIEN - catchError dentro de switchMap:
 * ```typescript
 * this.actions$.pipe(
 *   ofType(loadProperties),
 *   switchMap(action =>
 *     this.api.getProperties().pipe(
 *       map(response => loadPropertiesSuccess({ response })),
 *       catchError(err => of(loadPropertiesFailure({ error: err.message })))
 *       // ↑ Solo el Observable INTERNO falla, el effect sigue vivo
 *     )
 *   )
 * )
 * ```
 */

/**
 * ¿Qué es withLatestFrom?
 *
 * Combina el valor emitido por el Observable principal con el ÚLTIMO
 * valor emitido por otros Observables (no espera nuevas emisiones).
 *
 * ```typescript
 * actionStream$.pipe(
 *   withLatestFrom(store.select(selectCurrentPage))
 * )
 * // Emite: [action, currentPage]
 * ```
 *
 * Diferencia con combineLatest:
 * - combineLatest: Emite cuando CUALQUIER Observable emite
 * - withLatestFrom: Emite cuando el PRIMERO emite, usa último de los demás
 *
 * Para Effects, withLatestFrom es más adecuado porque queremos reaccionar
 * a las actions (primer Observable), no al store (segundo Observable).
 */

/**
 * ¿Qué es { dispatch: false }?
 *
 * Por defecto, createEffect() espera que el Observable retorne actions
 * que serán despachadas automáticamente al store.
 *
 * Con { dispatch: false }:
 * - El effect NO dispara ninguna action
 * - Solo ejecuta efectos secundarios (tap, navigation, logging)
 * - El Observable puede retornar cualquier tipo, no necesariamente actions
 *
 * SIN declararlo cuando corresponde puede crear loops infinitos:
 * effect dispara action → reducer actualiza estado → effect dispara otra vez
 */

/**
 * Pattern: Effect de logging/debugging
 *
 * ```typescript
 * logAllActions$ = createEffect(
 *   () => this.actions$.pipe(
 *     tap(action => console.log('[Action]', action))
 *   ),
 *   { dispatch: false }
 * );
 * ```
 *
 * Útil durante desarrollo para ver todas las actions.
 * Remover en producción o usar isDevMode().
 */
