/**
 * Dashboard API Service
 *
 * Servicio especializado en obtener estadísticas y datos agregados
 * para el dashboard de la aplicación.
 *
 * CONCEPTOS RXJS DEMOSTRADOS:
 * - forkJoin: Ejecutar múltiples peticiones en paralelo
 * - combineLatest: Combinar múltiples streams reactivos
 * - shareReplay: Cachear resultados para múltiples suscriptores
 * - BehaviorSubject: Estado reactivo interno
 *
 * Este servicio demuestra patrones más avanzados de RxJS comparado
 * con PropertyApiService.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, forkJoin } from 'rxjs';
import { map, catchError, tap, shareReplay } from 'rxjs/operators';

import {
  DashboardSummary,
  CityDistribution,
  MonthlyStats,
  PropertyTypeDistribution,
  ApiErrorResponse,
} from '../../models';
import { DASHBOARD_ENDPOINTS } from '../../config/api.config';

/**
 * Interface para datos completos del dashboard
 *
 * Agrupa todas las secciones del dashboard en una sola estructura.
 */
export interface DashboardData {
  summary: DashboardSummary;
  cityDistribution: CityDistribution[];
  typeDistribution: PropertyTypeDistribution[];
  monthlyStats: MonthlyStats[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardApiService {
  private readonly http = inject(HttpClient);

  /**
   * BehaviorSubject para indicar si hay una carga en progreso
   *
   * BehaviorSubject vs Subject vs ReplaySubject:
   *
   * BehaviorSubject:
   * - Requiere valor inicial
   * - Emite el último valor a nuevos suscriptores
   * - Útil para estado actual
   *
   * Subject:
   * - No tiene valor inicial
   * - Solo emite a suscriptores actuales
   * - Útil para eventos
   *
   * ReplaySubject:
   * - Puede reproducir N valores anteriores
   * - Útil para historial
   *
   * Uso:
   * ```typescript
   * this.loading$.subscribe(isLoading => {
   *   console.log('Loading:', isLoading);
   * });
   * ```
   */
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  /**
   * Observable público del estado de carga
   *
   * Exponemos como Observable (no BehaviorSubject) para evitar
   * que el código externo llame a .next()
   *
   * Pattern: Exponer como Observable, mantener Subject privado
   */
  public readonly loading$ = this.loadingSubject.asObservable();

  // ============================================================================
  // OPERACIONES INDIVIDUALES
  // ============================================================================

  /**
   * GET /api/v1/dashboard/summary/ - Obtiene resumen del dashboard
   *
   * OPERADOR DESTACADO: shareReplay()
   *
   * shareReplay() cachea el resultado y lo comparte entre múltiples suscriptores.
   * Esto evita hacer múltiples peticiones HTTP si varios componentes
   * se suscriben al mismo tiempo.
   */
  getDashboardSummary(): Observable<DashboardSummary> {
    console.log(`📡 [DashboardAPI] GET ${DASHBOARD_ENDPOINTS.summary}`);

    return this.http.get<DashboardSummary>(DASHBOARD_ENDPOINTS.summary).pipe(
      tap((summary) => {
        console.log(`✅ [DashboardAPI] Summary recibido:`, summary);
      }),
      /**
       * shareReplay(1) - Cachea el último valor emitido
       *
       * Sin shareReplay:
       * ```typescript
       * const data$ = this.dashboardApi.getDashboardSummary();
       * data$.subscribe(); // Petición HTTP 1
       * data$.subscribe(); // Petición HTTP 2
       * data$.subscribe(); // Petición HTTP 3
       * ```
       *
       * Con shareReplay(1):
       * ```typescript
       * const data$ = this.dashboardApi.getDashboardSummary();
       * data$.subscribe(); // Petición HTTP 1
       * data$.subscribe(); // Usa caché
       * data$.subscribe(); // Usa caché
       * ```
       *
       * Argumentos:
       * - bufferSize: Cuántos valores cachear (típicamente 1)
       * - windowTime: Tiempo en ms antes de re-ejecutar (opcional)
       * - refCount: Si descontar cuando no hay suscriptores (opcional)
       */
      shareReplay({ bufferSize: 1, refCount: true }),
      catchError(this.handleError)
    );
  }

  /**
   * GET /api/v1/dashboard/city-distribution/ - Distribución por ciudad
   */
  getCityDistribution(): Observable<CityDistribution[]> {
    console.log(`📡 [DashboardAPI] GET ${DASHBOARD_ENDPOINTS.cityDistribution}`);

    return this.http.get<CityDistribution[]>(DASHBOARD_ENDPOINTS.cityDistribution).pipe(
      tap((distribution) => {
        console.log(`✅ [DashboardAPI] City distribution: ${distribution.length} ciudades`);
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
      catchError(this.handleError)
    );
  }

  /**
   * GET /api/v1/dashboard/monthly-stats/ - Estadísticas mensuales
   *
   * @param months - Número de meses a incluir (default: 6)
   */
  getMonthlyStats(months: number = 6): Observable<MonthlyStats[]> {
    console.log(`📡 [DashboardAPI] GET ${DASHBOARD_ENDPOINTS.monthlyStats}?months=${months}`);

    return this.http
      .get<MonthlyStats[]>(DASHBOARD_ENDPOINTS.monthlyStats, {
        params: { months: months.toString() },
      })
      .pipe(
        tap((stats) => {
          console.log(`✅ [DashboardAPI] Monthly stats: ${stats.length} meses`);
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
        catchError(this.handleError)
      );
  }

  /**
   * GET /api/v1/dashboard/type-distribution/ - Distribución por tipo
   */
  getTypeDistribution(): Observable<PropertyTypeDistribution[]> {
    console.log(`📡 [DashboardAPI] GET ${DASHBOARD_ENDPOINTS.typeDistribution}`);

    return this.http.get<PropertyTypeDistribution[]>(DASHBOARD_ENDPOINTS.typeDistribution).pipe(
      tap((distribution) => {
        console.log(`✅ [DashboardAPI] Type distribution: ${distribution.length} tipos`);
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
      catchError(this.handleError)
    );
  }

  // ============================================================================
  // OPERACIONES COMBINADAS
  // ============================================================================

  /**
   * Obtiene TODOS los datos del dashboard en paralelo
   *
   * OPERADOR DESTACADO: forkJoin()
   *
   * forkJoin() es el "Promise.all()" de RxJS.
   * Ejecuta múltiples observables en paralelo y emite cuando TODOS completan.
   *
   * Características:
   * - Ejecuta observables en paralelo (no secuencialmente)
   * - Solo emite una vez cuando todos completan
   * - Si alguno falla, forkJoin falla
   * - Perfecto para cargar datos independientes simultáneamente
   *
   * Diferencias con otros combinadores:
   *
   * forkJoin:
   * - Espera a que TODOS completen
   * - Emite una sola vez
   * - Falla si alguno falla
   *
   * combineLatest:
   * - Emite cada vez que cualquiera emite
   * - Requiere que todos emitan al menos una vez
   * - Sigue emitiendo mientras los observables estén activos
   *
   * merge:
   * - Emite cuando cualquiera emite
   * - No espera a los demás
   * - Útil para eventos
   *
   * concat:
   * - Ejecuta secuencialmente
   * - Espera a que uno complete antes de iniciar el siguiente
   *
   * Ejemplo de uso:
   * ```typescript
   * this.dashboardApi.getAllDashboardData().subscribe({
   *   next: (data) => {
   *     console.log('Summary:', data.summary);
   *     console.log('Cities:', data.cityDistribution);
   *     console.log('Types:', data.typeDistribution);
   *     console.log('Monthly:', data.monthlyStats);
   *   },
   *   error: (error) => console.error('Error cargando dashboard:', error)
   * });
   * ```
   */
  getAllDashboardData(): Observable<DashboardData> {
    console.log('📡 [DashboardAPI] Cargando todos los datos del dashboard en paralelo...');

    // Activar indicador de carga
    this.loadingSubject.next(true);

    /**
     * forkJoin acepta un objeto con propiedades como observables
     *
     * Ventaja: El resultado mantiene las mismas keys
     * ```typescript
     * forkJoin({
     *   summary: observable1,
     *   cities: observable2
     * })
     * // Resultado: { summary: valor1, cities: valor2 }
     * ```
     *
     * Alternativa con array:
     * ```typescript
     * forkJoin([observable1, observable2])
     * // Resultado: [valor1, valor2]
     * ```
     */
    return forkJoin({
      summary: this.getDashboardSummary(),
      cityDistribution: this.getCityDistribution(),
      typeDistribution: this.getTypeDistribution(),
      monthlyStats: this.getMonthlyStats(),
    }).pipe(
      tap((data) => {
        console.log('✅ [DashboardAPI] Todos los datos cargados:', data);
        // Desactivar indicador de carga
        this.loadingSubject.next(false);
      }),
      /**
       * finalize() - Se ejecuta SIEMPRE (success o error)
       *
       * Perfecto para:
       * - Ocultar loading spinners
       * - Liberar recursos
       * - Limpiar estado temporal
       *
       * Similar a finally en promises:
       * ```typescript
       * fetch()
       *   .then(...)
       *   .catch(...)
       *   .finally(() => { });
       * ```
       */
      // finalize(() => {
      //   this.loadingSubject.next(false);
      // }),
      catchError((error) => {
        // Asegurar que el loading se desactive en caso de error
        this.loadingSubject.next(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Refresca un dashboard específico manteniendo los demás
   *
   * Demuestra cómo combinar datos nuevos con datos existentes.
   *
   * @param section - Sección a refrescar
   * @param currentData - Datos actuales del dashboard
   * @returns Observable con datos actualizados
   */
  refreshDashboardSection(
    section: keyof DashboardData,
    currentData: DashboardData
  ): Observable<DashboardData> {
    console.log(`📡 [DashboardAPI] Refrescando sección: ${section}`);

    let refresh$: Observable<any>;

    switch (section) {
      case 'summary':
        refresh$ = this.getDashboardSummary();
        break;
      case 'cityDistribution':
        refresh$ = this.getCityDistribution();
        break;
      case 'typeDistribution':
        refresh$ = this.getTypeDistribution();
        break;
      case 'monthlyStats':
        refresh$ = this.getMonthlyStats();
        break;
      default:
        throw new Error(`Sección desconocida: ${section}`);
    }

    /**
     * map() para combinar datos nuevos con existentes
     *
     * Patrón: Spread operator para inmutabilidad
     */
    return refresh$.pipe(
      map((newData) => ({
        ...currentData,
        [section]: newData,
      })),
      tap(() => {
        console.log(`✅ [DashboardAPI] Sección ${section} refrescada`);
      }),
      catchError(this.handleError)
    );
  }

  // ============================================================================
  // HELPERS PRIVADOS
  // ============================================================================

  /**
   * Manejo centralizado de errores
   */
  private handleError(error: any): Observable<never> {
    console.error('❌ [DashboardAPI] Error:', error);

    const apiError: ApiErrorResponse = {
      detail: error.error?.detail || error.message || 'Error desconocido en dashboard',
    };

    throw apiError;
  }
}

// ============================================================================
// NOTAS PEDAGÓGICAS ADICIONALES
// ============================================================================

/**
 * ¿Cuándo usar forkJoin vs combineLatest?
 *
 * Usa forkJoin cuando:
 * ✅ Necesitas cargar datos independientes en paralelo
 * ✅ Solo te interesa el resultado final cuando TODOS completen
 * ✅ Los observables completan después de emitir
 * ✅ Ejemplo: Cargar datos iniciales del dashboard
 *
 * Usa combineLatest cuando:
 * ✅ Necesitas reaccionar a cambios en múltiples streams
 * ✅ Los observables emiten múltiples veces
 * ✅ Quieres el último valor de cada uno
 * ✅ Ejemplo: Combinar filtros reactivos de búsqueda
 *
 * Ejemplo práctico:
 *
 * forkJoin (carga inicial):
 * ```typescript
 * // Cargar datos al inicializar componente
 * forkJoin({
 *   users: this.userService.getUsers(),
 *   roles: this.roleService.getRoles(),
 *   permissions: this.permService.getPermissions()
 * }).subscribe(data => {
 *   // Todos los datos están listos
 *   this.initializeView(data);
 * });
 * ```
 *
 * combineLatest (filtros reactivos):
 * ```typescript
 * // Reaccionar a cambios en múltiples filtros
 * combineLatest([
 *   this.searchControl.valueChanges,
 *   this.categoryControl.valueChanges,
 *   this.statusControl.valueChanges
 * ]).subscribe(([search, category, status]) => {
 *   // Se ejecuta cada vez que CUALQUIER filtro cambia
 *   this.applyFilters(search, category, status);
 * });
 * ```
 */

/**
 * ¿Qué hace shareReplay y cuándo usarlo?
 *
 * Problema sin shareReplay:
 * ```typescript
 * const data$ = this.http.get('/api/data');
 *
 * // En component A
 * data$.subscribe(x => console.log('A:', x)); // HTTP call 1
 *
 * // En component B
 * data$.subscribe(x => console.log('B:', x)); // HTTP call 2
 *
 * // En component C
 * data$.subscribe(x => console.log('C:', x)); // HTTP call 3
 * ```
 *
 * Resultado: 3 peticiones HTTP innecesarias
 *
 * Solución con shareReplay:
 * ```typescript
 * const data$ = this.http.get('/api/data').pipe(
 *   shareReplay(1)
 * );
 *
 * // En component A
 * data$.subscribe(x => console.log('A:', x)); // HTTP call 1
 *
 * // En component B
 * data$.subscribe(x => console.log('B:', x)); // Usa caché
 *
 * // En component C
 * data$.subscribe(x => console.log('C:', x)); // Usa caché
 * ```
 *
 * Resultado: 1 sola petición HTTP, compartida entre todos
 *
 * IMPORTANTE:
 * - El caché persiste incluso si todos se desuscriben
 * - Para limpiar caché cuando no hay suscriptores: { refCount: true }
 * - Para caché con tiempo límite: { windowTime: 5000 } (5 segundos)
 */

/**
 * Pattern: Exponer Observable, mantener Subject privado
 *
 * ❌ Mal:
 * ```typescript
 * public loading = new BehaviorSubject<boolean>(false);
 *
 * // Problema: Código externo puede hacer:
 * service.loading.next(true); // Rompe encapsulación
 * ```
 *
 * ✅ Bien:
 * ```typescript
 * private loadingSubject = new BehaviorSubject<boolean>(false);
 * public loading$ = this.loadingSubject.asObservable();
 *
 * // Código externo solo puede:
 * service.loading$.subscribe(...); // ✅ Solo lectura
 * service.loading$.next(...);      // ❌ Error de compilación
 * ```
 *
 * Beneficios:
 * - Encapsulación: Solo el servicio controla el estado
 * - Inmutabilidad: El exterior no puede modificar
 * - Intent claro: $ indica que es observable
 */
