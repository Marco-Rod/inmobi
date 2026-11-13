/**
 * Dashboard State
 *
 * Estado del módulo Dashboard.
 * A diferencia del estado de propiedades, el dashboard es principalmente
 * de solo lectura: carga datos y los muestra, sin operaciones CRUD.
 *
 * PARTICULARIDADES:
 * - Múltiples sources de datos (summary, ciudades, tipos, mensual)
 * - Cada sección puede cargarse de forma independiente
 * - Tiene un "período" seleccionable (meses a mostrar)
 * - Loading granular por sección (no un solo boolean)
 */

import {
  DashboardSummary,
  CityDistribution,
  PropertyTypeDistribution,
  MonthlyStats,
} from '../../../core/models';

/**
 * Loading state granular por sección del dashboard.
 *
 * Cada sección carga de forma independiente con forkJoin.
 * Esto permite mostrar spinners específicos mientras los datos llegan.
 */
export interface DashboardLoadingState {
  summary: boolean;
  cityDistribution: boolean;
  typeDistribution: boolean;
  monthlyStats: boolean;
}

/**
 * Error state granular por sección.
 *
 * null indica que no hay error en esa sección.
 */
export interface DashboardErrorState {
  summary: string | null;
  cityDistribution: string | null;
  typeDistribution: string | null;
  monthlyStats: string | null;
}

/**
 * Interface del estado del Dashboard
 */
export interface DashboardState {
  // ============================================================================
  // DATOS
  // ============================================================================

  /** Resumen con totales y promedios */
  summary: DashboardSummary | null;

  /** Distribución de propiedades por ciudad */
  cityDistribution: CityDistribution[];

  /** Distribución de propiedades por tipo (casa, depa, local...) */
  typeDistribution: PropertyTypeDistribution[];

  /** Estadísticas mensuales (ventas/rentas por mes) */
  monthlyStats: MonthlyStats[];

  // ============================================================================
  // CONFIGURACIÓN
  // ============================================================================

  /**
   * Número de meses a mostrar en las estadísticas temporales.
   * Defecto: 6 meses.
   */
  monthsToShow: number;

  /**
   * Fecha de la última carga completa.
   * Útil para mostrar "Actualizado hace X minutos" en la UI.
   * Se guarda como ISO string para serialización en el store.
   */
  lastUpdated: string | null;

  // ============================================================================
  // ESTADOS DE CARGA Y ERROR
  // ============================================================================

  /**
   * Loading granular: cada sección tiene su propio estado de carga.
   * Permite mostrar skeleton loaders específicos por widget.
   */
  loading: DashboardLoadingState;

  /**
   * Errores granulares por sección.
   */
  errors: DashboardErrorState;
}

/**
 * Estado inicial del Dashboard
 *
 * Todos los datos en null/[] y todos los loading en false.
 */
export const initialDashboardState: DashboardState = {
  summary: null,
  cityDistribution: [],
  typeDistribution: [],
  monthlyStats: [],

  monthsToShow: 6,
  lastUpdated: null,

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
};

// ============================================================================
// NOTA PEDAGÓGICA
// ============================================================================

/**
 * ¿Por qué loading/errors son objetos anidados aquí y no en Properties?
 *
 * Properties tiene operaciones discretas (crear, actualizar, eliminar).
 * Dashboard tiene secciones independientes que se cargan en paralelo.
 *
 * El dashboard carga 4 cosas simultáneamente con forkJoin:
 * - summary
 * - cityDistribution
 * - typeDistribution
 * - monthlyStats
 *
 * Necesitamos saber cuál está cargando para mostrar el skeleton
 * correcto en cada widget. Por eso loading es un objeto, no un boolean.
 *
 * Para properties, las operaciones son independientes y tienen
 * nombres semánticos (creating, updating, deleting) que no se agrupan.
 *
 * Lección: El shape del estado debe reflejar las necesidades de la UI.
 * No hay una solución universal: depende del caso de uso.
 */
