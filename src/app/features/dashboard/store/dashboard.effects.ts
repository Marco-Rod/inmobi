/**
 * Dashboard Effects
 *
 * Efectos del módulo Dashboard.
 *
 * PATRÓN DESTACADO: forkJoin para carga paralela
 *
 * El dashboard carga 4 endpoints simultáneamente.
 * forkJoin espera a que TODOS completen y emite una sola vez con todos los resultados.
 *
 * forkJoin vs combineLatest:
 * - forkJoin: Espera a que todos completen. Para peticiones HTTP (completan solas).
 * - combineLatest: Emite cada vez que cualquiera emite. Para streams continuos.
 */

import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { switchMap, map, catchError, tap, withLatestFrom } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

import { DashboardApiService } from '../../../core/services/api/dashboard-api.service';
import * as DashboardActions from './dashboard.actions';
import { selectMonthsToShow } from './dashboard.selectors';

@Injectable()
export class DashboardEffects {
  private readonly actions$ = inject(Actions);
  private readonly dashboardApi = inject(DashboardApiService);
  private readonly store = inject(Store);

  // ============================================================================
  // CARGA COMPLETA CON forkJoin
  // ============================================================================

  /**
   * Effect: Cargar todos los datos del dashboard en paralelo.
   *
   * forkJoin([obs1, obs2, obs3]) hace las 3 peticiones HTTP simultáneamente
   * y emite un array con todos los resultados cuando todas completan.
   *
   * Si CUALQUIERA falla, forkJoin falla y va al catchError.
   *
   * Tiempo de carga = MAX(t1, t2, t3, t4)  ← Paralelo
   * vs secuencial: t1 + t2 + t3 + t4       ← Mucho más lento
   */
  loadAllDashboardData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.loadAllDashboardData, DashboardActions.refreshDashboard),

      withLatestFrom(this.store.select(selectMonthsToShow)),

      switchMap(([action, monthsFromStore]) => {
        // Para loadAllDashboardData usamos el months de la action si existe,
        // si no, el del store. refreshDashboard usa siempre el del store.
        const months =
          'months' in action && action.months !== undefined
            ? action.months
            : monthsFromStore;

        console.log(`🔄 [DashboardEffects] Cargando dashboard (${months} meses)...`);

        /**
         * forkJoin con objeto (más legible que array):
         *
         * forkJoin({
         *   key1: observable1,
         *   key2: observable2,
         * })
         *
         * Emite: { key1: resultado1, key2: resultado2 }
         *
         * Mucho más claro que forkJoin([obs1, obs2]) que emite [res1, res2].
         */
        return forkJoin({
          summary: this.dashboardApi.getDashboardSummary(),
          cityDistribution: this.dashboardApi.getCityDistribution(),
          typeDistribution: this.dashboardApi.getTypeDistribution(),
          monthlyStats: this.dashboardApi.getMonthlyStats(months),
        }).pipe(
          map(({ summary, cityDistribution, typeDistribution, monthlyStats }) =>
            DashboardActions.loadAllDashboardDataSuccess({
              summary,
              cityDistribution,
              typeDistribution,
              monthlyStats,
              loadedAt: new Date().toISOString(),
            })
          ),
          catchError((error: { message?: string }) => {
            const errorMessage = error?.message ?? 'Error al cargar el dashboard';
            console.error('❌ [DashboardEffects] Error en carga completa:', errorMessage);
            return of(DashboardActions.loadAllDashboardDataFailure({ error: errorMessage }));
          })
        );
      })
    )
  );

  // ============================================================================
  // REACCIÓN A CAMBIO DE PERÍODO
  // ============================================================================

  /**
   * Effect: Cuando cambia el período, recarga las estadísticas mensuales.
   *
   * Este es un "encadenamiento de efectos":
   * setMonthsToShow → loadMonthlyStats → loadMonthlyStatsSuccess/Failure
   *
   * El Reducer ya actualizó monthsToShow cuando llega a este effect.
   * Despachamos loadMonthlyStats con los nuevos meses.
   */
  setMonthsToShow$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.setMonthsToShow),
      map(({ months }) => DashboardActions.loadMonthlyStats({ months }))
    )
  );

  // ============================================================================
  // CARGA GRANULAR: MONTHLY STATS
  // ============================================================================

  loadMonthlyStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.loadMonthlyStats),

      withLatestFrom(this.store.select(selectMonthsToShow)),

      switchMap(([action, monthsFromStore]) => {
        const months = action.months ?? monthsFromStore;
        return this.dashboardApi.getMonthlyStats(months).pipe(
          map((monthlyStats) =>
            DashboardActions.loadMonthlyStatsSuccess({ monthlyStats })
          ),
          catchError((error: { message?: string }) =>
            of(
              DashboardActions.loadMonthlyStatsFailure({
                error: error?.message ?? 'Error al cargar estadísticas mensuales',
              })
            )
          )
        );
      })
    )
  );

  // ============================================================================
  // LOGGING (solo desarrollo)
  // ============================================================================

  /**
   * Effect de logging: registra cuándo se carga el dashboard.
   * { dispatch: false } porque solo hace logging, no dispara acciones.
   */
  logDashboardLoad$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(DashboardActions.loadAllDashboardDataSuccess),
        tap(({ loadedAt }) => {
          console.log(`✅ [DashboardEffects] Dashboard cargado a las ${loadedAt}`);
        })
      ),
    { dispatch: false }
  );
}
