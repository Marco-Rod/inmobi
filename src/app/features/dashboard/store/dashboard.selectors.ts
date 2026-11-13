/**
 * Dashboard Selectors
 *
 * Selectores para el módulo Dashboard.
 *
 * PATRÓN DESTACADO: Transformación de datos para gráficos
 *
 * Los datos crudos de la API no siempre tienen el formato que necesitan
 * los componentes de UI (Chart.js, PrimeNG Charts).
 *
 * Los selectores son el lugar correcto para estas transformaciones:
 * - Los componentes reciben datos listos para renderizar
 * - La transformación está memoizada (no recalcula si el input no cambió)
 * - La lógica está centralizada y es testeable
 */

import { createSelector, createFeatureSelector } from '@ngrx/store';
import type { DashboardState } from './dashboard.state';

// ============================================================================
// FEATURE SELECTOR
// ============================================================================

export const selectDashboardFeature =
  createFeatureSelector<DashboardState>('dashboard');

// ============================================================================
// SELECTORES BÁSICOS
// ============================================================================

export const selectSummary = createSelector(
  selectDashboardFeature,
  (state) => state.summary
);

export const selectCityDistribution = createSelector(
  selectDashboardFeature,
  (state) => state.cityDistribution
);

export const selectTypeDistribution = createSelector(
  selectDashboardFeature,
  (state) => state.typeDistribution
);

export const selectMonthlyStats = createSelector(
  selectDashboardFeature,
  (state) => state.monthlyStats
);

export const selectMonthsToShow = createSelector(
  selectDashboardFeature,
  (state) => state.monthsToShow
);

export const selectLastUpdated = createSelector(
  selectDashboardFeature,
  (state) => state.lastUpdated
);

export const selectDashboardLoading = createSelector(
  selectDashboardFeature,
  (state) => state.loading
);

export const selectDashboardErrors = createSelector(
  selectDashboardFeature,
  (state) => state.errors
);

// ============================================================================
// SELECTORES DERIVADOS: LOADING
// ============================================================================

/** ¿Está cargando alguna sección? */
export const selectAnyDashboardLoading = createSelector(
  selectDashboardLoading,
  (loading) =>
    loading.summary ||
    loading.cityDistribution ||
    loading.typeDistribution ||
    loading.monthlyStats
);

/** ¿Está cargando la carga inicial (todos en true)? */
export const selectIsInitialLoad = createSelector(
  selectDashboardLoading,
  selectSummary,
  (loading, summary) => loading.summary && summary === null
);

// ============================================================================
// SELECTORES DERIVADOS: DATOS PARA CHARTS
// ============================================================================

/**
 * Selector: Datos para gráfico de torta/barras de ciudades
 *
 * PrimeNG Chart y Chart.js esperan datos en formato:
 * {
 *   labels: string[],
 *   datasets: [{ data: number[], backgroundColor: string[] }]
 * }
 *
 * Transformamos CityDistribution[] a este formato.
 * La memoización asegura que esta transformación solo ocurre
 * cuando cityDistribution cambia, no en cada render.
 */
export const selectCityChartData = createSelector(
  selectCityDistribution,
  (cities) => {
    if (!cities.length) return null;

    // Paleta de colores para el gráfico
    const colors = [
      '#3B82F6', // blue-500
      '#10B981', // emerald-500
      '#F59E0B', // amber-500
      '#EF4444', // red-500
      '#8B5CF6', // violet-500
      '#EC4899', // pink-500
      '#06B6D4', // cyan-500
      '#F97316', // orange-500
    ];

    return {
      labels: cities.map((c) => c.city),
      datasets: [
        {
          data: cities.map((c) => c.count),
          backgroundColor: cities.map((_, i) => colors[i % colors.length]),
          hoverBackgroundColor: cities.map((_, i) => colors[i % colors.length]),
        },
      ],
    };
  }
);

/**
 * Selector: Datos para gráfico de tipos de propiedad
 *
 * Similar al de ciudades, pero para tipos.
 * Usamos etiquetas más amigables para los tipos.
 */
export const selectTypeChartData = createSelector(
  selectTypeDistribution,
  (types) => {
    if (!types.length) return null;

    // Mapeo de tipos técnicos a etiquetas legibles
    const typeLabels: Record<string, string> = {
      house: 'Casa',
      apartment: 'Departamento',
      commercial: 'Local Comercial',
      land: 'Terreno',
      office: 'Oficina',
      warehouse: 'Bodega',
    };

    const colors = [
      '#6366F1', // indigo-500
      '#14B8A6', // teal-500
      '#F59E0B', // amber-500
      '#EF4444', // red-500
      '#3B82F6', // blue-500
      '#8B5CF6', // violet-500
    ];

    return {
      labels: types.map((t) => typeLabels[t.propertyType] ?? t.propertyType),
      datasets: [
        {
          data: types.map((t) => t.count),
          backgroundColor: types.map((_, i) => colors[i % colors.length]),
        },
      ],
    };
  }
);

/**
 * Selector: Datos para gráfico de barras mensual
 *
 * Muestra ventas y rentas por mes en barras agrupadas.
 */
export const selectMonthlyChartData = createSelector(
  selectMonthlyStats,
  (stats) => {
    if (!stats.length) return null;

    return {
      labels: stats.map((s) => {
        // Formateamos "2026-11" → "Nov 26"
        if (s.monthName) return s.monthName;
        const [year, month] = s.month.split('-');
        const date = new Date(Number(year), Number(month) - 1);
        return date.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' });
      }),
      datasets: [
        {
          label: 'Ventas',
          data: stats.map((s) => s.sales),
          backgroundColor: '#3B82F6',
          borderColor: '#2563EB',
          borderWidth: 1,
        },
        {
          label: 'Rentas',
          data: stats.map((s) => s.rentals),
          backgroundColor: '#10B981',
          borderColor: '#059669',
          borderWidth: 1,
        },
      ],
    };
  }
);

// ============================================================================
// SELECTORES DERIVADOS: ESTADÍSTICAS CALCULADAS
// ============================================================================

/**
 * Selector: Ciudad más popular
 */
export const selectMostPopularCity = createSelector(
  selectCityDistribution,
  (cities) => {
    if (!cities.length) return null;
    return cities.reduce((max, city) => (city.count > max.count ? city : max));
  }
);

/**
 * Selector: Tipo de propiedad más común
 */
export const selectMostCommonType = createSelector(
  selectTypeDistribution,
  (types) => {
    if (!types.length) return null;
    return types.reduce((max, type) => (type.count > max.count ? type : max));
  }
);

/**
 * Selector: Tendencia de ventas (¿el último mes fue mejor que el anterior?)
 */
export const selectSalesTrend = createSelector(
  selectMonthlyStats,
  (stats) => {
    if (stats.length < 2) return null;
    const lastMonth = stats[stats.length - 1];
    const previousMonth = stats[stats.length - 2];
    const diff = lastMonth.sales - previousMonth.sales;
    return {
      current: lastMonth.sales,
      previous: previousMonth.sales,
      diff,
      percentage: previousMonth.sales > 0
        ? Math.round((diff / previousMonth.sales) * 100)
        : 0,
      isPositive: diff >= 0,
    };
  }
);

// ============================================================================
// VIEWMODEL COMPLETO
// ============================================================================

/**
 * ViewModel completo para el componente DashboardPage.
 *
 * El componente hace UNA sola suscripción a este selector y tiene todo lo
 * que necesita para renderizar el dashboard completo.
 */
export const selectDashboardViewModel = createSelector(
  selectSummary,
  selectCityChartData,
  selectTypeChartData,
  selectMonthlyChartData,
  selectAnyDashboardLoading,
  selectIsInitialLoad,
  selectDashboardErrors,
  selectLastUpdated,
  selectSalesTrend,
  selectMonthsToShow,
  (
    summary,
    cityChartData,
    typeChartData,
    monthlyChartData,
    anyLoading,
    isInitialLoad,
    errors,
    lastUpdated,
    salesTrend,
    monthsToShow
  ) => ({
    summary,
    cityChartData,
    typeChartData,
    monthlyChartData,
    anyLoading,
    isInitialLoad,
    errors,
    lastUpdated,
    salesTrend,
    monthsToShow,
    hasData: summary !== null,
    // Formatea el lastUpdated para mostrar en la UI
    lastUpdatedLabel: lastUpdated
      ? new Date(lastUpdated).toLocaleTimeString('es-MX', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : null,
  })
);
