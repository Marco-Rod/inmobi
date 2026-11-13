/**
 * Dashboard Actions
 *
 * Actions del módulo Dashboard.
 *
 * PATRÓN:
 * El dashboard usa el patrón "cargar todo de una vez" (loadAll)
 * además de acciones granulares por sección.
 *
 * loadAllDashboardData → Effect usa forkJoin para cargar 4 endpoints en paralelo
 *                      → loadAllDashboardDataSuccess (todos llegaron)
 *                      → loadAllDashboardDataFailure (alguno falló)
 */

import { createAction, props } from '@ngrx/store';
import {
  DashboardSummary,
  CityDistribution,
  PropertyTypeDistribution,
  MonthlyStats,
} from '../../../core/models';

// ============================================================================
// CARGA COMPLETA (forkJoin de 4 endpoints)
// ============================================================================

/**
 * Carga todos los datos del dashboard en paralelo.
 *
 * El Effect usa forkJoin para hacer 4 peticiones simultáneamente.
 * El resultado llega cuando TODAS han completado.
 *
 * Ventaja: Una sola acción para inicializar el dashboard completo.
 */
export const loadAllDashboardData = createAction(
  '[Dashboard Page] Load All Dashboard Data',
  props<{ months?: number }>()
);

export const loadAllDashboardDataSuccess = createAction(
  '[Dashboard API] Load All Dashboard Data Success',
  props<{
    summary: DashboardSummary;
    cityDistribution: CityDistribution[];
    typeDistribution: PropertyTypeDistribution[];
    monthlyStats: MonthlyStats[];
    loadedAt: string; // ISO string
  }>()
);

export const loadAllDashboardDataFailure = createAction(
  '[Dashboard API] Load All Dashboard Data Failure',
  props<{ error: string }>()
);

// ============================================================================
// CARGA GRANULAR (sección por sección)
// ============================================================================

/** Refresca solo el resumen (tarjetas de totales) */
export const loadDashboardSummary = createAction(
  '[Dashboard] Load Dashboard Summary'
);

export const loadDashboardSummarySuccess = createAction(
  '[Dashboard API] Load Dashboard Summary Success',
  props<{ summary: DashboardSummary }>()
);

export const loadDashboardSummaryFailure = createAction(
  '[Dashboard API] Load Dashboard Summary Failure',
  props<{ error: string }>()
);

/** Refresca distribución por ciudad */
export const loadCityDistribution = createAction(
  '[Dashboard] Load City Distribution'
);

export const loadCityDistributionSuccess = createAction(
  '[Dashboard API] Load City Distribution Success',
  props<{ cityDistribution: CityDistribution[] }>()
);

export const loadCityDistributionFailure = createAction(
  '[Dashboard API] Load City Distribution Failure',
  props<{ error: string }>()
);

/** Refresca distribución por tipo */
export const loadTypeDistribution = createAction(
  '[Dashboard] Load Type Distribution'
);

export const loadTypeDistributionSuccess = createAction(
  '[Dashboard API] Load Type Distribution Success',
  props<{ typeDistribution: PropertyTypeDistribution[] }>()
);

export const loadTypeDistributionFailure = createAction(
  '[Dashboard API] Load Type Distribution Failure',
  props<{ error: string }>()
);

/** Refresca estadísticas mensuales */
export const loadMonthlyStats = createAction(
  '[Dashboard] Load Monthly Stats',
  props<{ months?: number }>()
);

export const loadMonthlyStatsSuccess = createAction(
  '[Dashboard API] Load Monthly Stats Success',
  props<{ monthlyStats: MonthlyStats[] }>()
);

export const loadMonthlyStatsFailure = createAction(
  '[Dashboard API] Load Monthly Stats Failure',
  props<{ error: string }>()
);

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

/**
 * Cambia el número de meses a mostrar en el gráfico.
 * Recarga las estadísticas mensuales automáticamente (via Effect).
 */
export const setMonthsToShow = createAction(
  '[Dashboard Filter] Set Months To Show',
  props<{ months: number }>()
);

/** Refresca el dashboard completo (pull-to-refresh) */
export const refreshDashboard = createAction(
  '[Dashboard Page] Refresh Dashboard'
);

/** Limpia todos los errores del dashboard */
export const clearDashboardErrors = createAction(
  '[Dashboard] Clear Dashboard Errors'
);
