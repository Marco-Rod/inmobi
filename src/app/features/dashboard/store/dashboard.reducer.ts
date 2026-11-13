/**
 * Dashboard Reducer
 *
 * Maneja las transiciones de estado para el módulo Dashboard.
 *
 * PATRÓN DESTACADO:
 * Uso de spread anidado para actualizar estados dentro de objetos anidados
 * (loading y errors), manteniendo inmutabilidad en todos los niveles.
 */

import { createReducer, on } from '@ngrx/store';
import { initialDashboardState } from './dashboard.state';
import * as DashboardActions from './dashboard.actions';

export const dashboardReducer = createReducer(
  initialDashboardState,

  // ============================================================================
  // CARGA COMPLETA
  // ============================================================================

  /**
   * Al iniciar la carga completa, todos los loading pasan a true.
   *
   * Spread anidado:
   * { ...state }                    → nueva copia del estado raíz
   * { ...state, loading: {...} }    → nueva copia de loading también
   *
   * Necesitamos spread en CADA NIVEL del objeto que cambie.
   * Si solo hacemos { ...state, loading.summary: true } → error de sintaxis.
   * Si hacemos state.loading.summary = true → mutación, prohibida.
   */
  on(DashboardActions.loadAllDashboardData, (state) => ({
    ...state,
    loading: {
      ...state.loading,     // Mantiene typeDistribution, cityDistribution, monthlyStats
      summary: true,
      cityDistribution: true,
      typeDistribution: true,
      monthlyStats: true,
    },
    errors: {
      ...state.errors,
      summary: null,
      cityDistribution: null,
      typeDistribution: null,
      monthlyStats: null,
    },
  })),

  /**
   * Carga completa exitosa: actualiza todos los datos y limpia todos los loading.
   */
  on(DashboardActions.loadAllDashboardDataSuccess, (state, action) => ({
    ...state,
    summary: action.summary,
    cityDistribution: action.cityDistribution,
    typeDistribution: action.typeDistribution,
    monthlyStats: action.monthlyStats,
    lastUpdated: action.loadedAt,
    loading: {
      summary: false,
      cityDistribution: false,
      typeDistribution: false,
      monthlyStats: false,
    },
    errors: {
      summary: null,
      cityDistribution: null,
      typeDistribution: null,
      monthlyStats: null,
    },
  })),

  on(DashboardActions.loadAllDashboardDataFailure, (state, { error }) => ({
    ...state,
    loading: {
      summary: false,
      cityDistribution: false,
      typeDistribution: false,
      monthlyStats: false,
    },
    errors: {
      summary: error,
      cityDistribution: error,
      typeDistribution: error,
      monthlyStats: error,
    },
  })),

  // ============================================================================
  // CARGA GRANULAR: SUMMARY
  // ============================================================================

  on(DashboardActions.loadDashboardSummary, (state) => ({
    ...state,
    loading: { ...state.loading, summary: true },
    errors: { ...state.errors, summary: null },
  })),

  on(DashboardActions.loadDashboardSummarySuccess, (state, { summary }) => ({
    ...state,
    summary,
    loading: { ...state.loading, summary: false },
    errors: { ...state.errors, summary: null },
  })),

  on(DashboardActions.loadDashboardSummaryFailure, (state, { error }) => ({
    ...state,
    loading: { ...state.loading, summary: false },
    errors: { ...state.errors, summary: error },
  })),

  // ============================================================================
  // CARGA GRANULAR: CITY DISTRIBUTION
  // ============================================================================

  on(DashboardActions.loadCityDistribution, (state) => ({
    ...state,
    loading: { ...state.loading, cityDistribution: true },
    errors: { ...state.errors, cityDistribution: null },
  })),

  on(DashboardActions.loadCityDistributionSuccess, (state, { cityDistribution }) => ({
    ...state,
    cityDistribution,
    loading: { ...state.loading, cityDistribution: false },
    errors: { ...state.errors, cityDistribution: null },
  })),

  on(DashboardActions.loadCityDistributionFailure, (state, { error }) => ({
    ...state,
    loading: { ...state.loading, cityDistribution: false },
    errors: { ...state.errors, cityDistribution: error },
  })),

  // ============================================================================
  // CARGA GRANULAR: TYPE DISTRIBUTION
  // ============================================================================

  on(DashboardActions.loadTypeDistribution, (state) => ({
    ...state,
    loading: { ...state.loading, typeDistribution: true },
    errors: { ...state.errors, typeDistribution: null },
  })),

  on(DashboardActions.loadTypeDistributionSuccess, (state, { typeDistribution }) => ({
    ...state,
    typeDistribution,
    loading: { ...state.loading, typeDistribution: false },
    errors: { ...state.errors, typeDistribution: null },
  })),

  on(DashboardActions.loadTypeDistributionFailure, (state, { error }) => ({
    ...state,
    loading: { ...state.loading, typeDistribution: false },
    errors: { ...state.errors, typeDistribution: error },
  })),

  // ============================================================================
  // CARGA GRANULAR: MONTHLY STATS
  // ============================================================================

  on(DashboardActions.loadMonthlyStats, (state) => ({
    ...state,
    loading: { ...state.loading, monthlyStats: true },
    errors: { ...state.errors, monthlyStats: null },
  })),

  on(DashboardActions.loadMonthlyStatsSuccess, (state, { monthlyStats }) => ({
    ...state,
    monthlyStats,
    loading: { ...state.loading, monthlyStats: false },
    errors: { ...state.errors, monthlyStats: null },
  })),

  on(DashboardActions.loadMonthlyStatsFailure, (state, { error }) => ({
    ...state,
    loading: { ...state.loading, monthlyStats: false },
    errors: { ...state.errors, monthlyStats: error },
  })),

  // ============================================================================
  // CONFIGURACIÓN
  // ============================================================================

  /**
   * Cuando se cambia el período, solo actualizamos monthsToShow.
   * El Effect escucha esta action y dispara loadMonthlyStats.
   */
  on(DashboardActions.setMonthsToShow, (state, { months }) => ({
    ...state,
    monthsToShow: months,
  })),

  on(DashboardActions.clearDashboardErrors, (state) => ({
    ...state,
    errors: {
      summary: null,
      cityDistribution: null,
      typeDistribution: null,
      monthlyStats: null,
    },
  }))
);
