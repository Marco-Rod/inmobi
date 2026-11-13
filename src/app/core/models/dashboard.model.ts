/**
 * Modelos del Dashboard
 *
 * Este archivo define las estructuras de datos para las estadísticas
 * y visualizaciones del dashboard principal de la aplicación.
 *
 * El dashboard muestra:
 * 1. Resumen general (totales y promedios)
 * 2. Distribución por ciudad
 * 3. Distribución por tipo de propiedad
 * 4. Estadísticas mensuales (ventas y rentas)
 * 5. Evolución de precios
 */

import { Currency, PropertyType, PropertyStatus } from './enums';

// ============================================================================
// RESUMEN GENERAL
// ============================================================================

/**
 * Estadísticas resumidas del dashboard
 *
 * Datos agregados que se muestran en las tarjetas principales del dashboard.
 * Este es típicamente el primer endpoint que se llama al cargar el dashboard.
 */
export interface DashboardSummary {
  /**
   * Total de propiedades registradas en el sistema
   */
  totalProperties: number;

  /**
   * Propiedades con estado 'available'
   */
  availableProperties: number;

  /**
   * Propiedades con estado 'sold'
   */
  soldProperties: number;

  /**
   * Propiedades con estado 'rented'
   */
  rentedProperties: number;

  /**
   * Propiedades con estado 'negotiating'
   */
  negotiatingProperties: number;

  /**
   * Precio promedio de todas las propiedades
   *
   * NOTA: Este promedio incluye tanto propiedades en venta como en renta,
   * por lo que puede no ser muy útil. En una versión mejorada, se podría
   * separar en averageSalePrice y averageRentPrice.
   */
  averagePrice: number;

  /**
   * Moneda del precio promedio
   */
  currency: Currency;

  /**
   * Valor total del inventario
   *
   * Suma de los precios de todas las propiedades disponibles.
   */
  totalInventoryValue?: number;
}

// ============================================================================
// DISTRIBUCIÓN POR CIUDAD
// ============================================================================

/**
 * Distribución de propiedades por ciudad
 *
 * Útil para gráficos de:
 * - Pie chart (torta)
 * - Bar chart (barras)
 * - Map visualization
 */
export interface CityDistribution {
  /**
   * Nombre de la ciudad
   */
  city: string;

  /**
   * Número de propiedades en esta ciudad
   */
  count: number;

  /**
   * Porcentaje del total
   *
   * Ejemplo: 37.5 (representa 37.5%)
   * Útil para labels en gráficos de torta.
   */
  percentage: number;

  /**
   * Precio promedio en esta ciudad (opcional)
   */
  averagePrice?: number;
}

/**
 * Respuesta completa de distribución por ciudad
 *
 * Puede incluir metadata adicional.
 */
export interface CityDistributionResponse {
  cities: CityDistribution[];
  totalCities: number;
  mostPopularCity: string;
}

// ============================================================================
// DISTRIBUCIÓN POR TIPO DE PROPIEDAD
// ============================================================================

/**
 * Distribución de propiedades por tipo
 *
 * Similar a CityDistribution pero agrupado por tipo de propiedad.
 */
export interface PropertyTypeDistribution {
  /**
   * Tipo de propiedad
   */
  propertyType: PropertyType;

  /**
   * Número de propiedades de este tipo
   */
  count: number;

  /**
   * Porcentaje del total
   */
  percentage: number;

  /**
   * Precio promedio para este tipo
   */
  averagePrice?: number;

  /**
   * Superficie promedio para este tipo (m²)
   */
  averageArea?: number;
}

// ============================================================================
// ESTADÍSTICAS MENSUALES
// ============================================================================

/**
 * Estadísticas de un mes específico
 *
 * Representa ventas, rentas y revenue de un mes.
 * Útil para gráficos de líneas o barras que muestren evolución temporal.
 */
export interface MonthlyStats {
  /**
   * Mes en formato YYYY-MM
   *
   * Ejemplos: "2026-11", "2026-10"
   *
   * IMPORTANTE: Usar formato ISO para facilitar parsing y ordenamiento.
   */
  month: string;

  /**
   * Año (redundante pero útil para algunos casos)
   */
  year?: number;

  /**
   * Nombre del mes en español (opcional, para UI)
   */
  monthName?: string;

  /**
   * Número de ventas realizadas en el mes
   *
   * Propiedades que cambiaron de estado a 'sold'.
   */
  sales: number;

  /**
   * Número de rentas realizadas en el mes
   *
   * Propiedades que cambiaron de estado a 'rented'.
   */
  rentals: number;

  /**
   * Ingreso total del mes
   *
   * Suma de los precios de las propiedades vendidas.
   * Para rentas, podría ser el ingreso mensual proyectado.
   */
  totalRevenue: number;

  /**
   * Moneda del revenue
   */
  currency?: Currency;

  /**
   * Número de propiedades nuevas registradas
   */
  newListings?: number;
}

/**
 * Respuesta de estadísticas mensuales
 *
 * Array ordenado de los últimos N meses.
 */
export interface MonthlyStatsResponse {
  /**
   * Array de estadísticas mensuales
   *
   * Ordenado de más antiguo a más reciente para facilitar
   * su uso en gráficos de líneas.
   */
  months: MonthlyStats[];

  /**
   * Número de meses incluidos
   */
  totalMonths: number;

  /**
   * Mes con más ventas
   */
  bestSalesMonth?: string;

  /**
   * Mes con más rentas
   */
  bestRentalsMonth?: string;
}

// ============================================================================
// DISTRIBUCIÓN POR ESTADO
// ============================================================================

/**
 * Distribución de propiedades por estado
 *
 * Útil para mostrar pipeline o funnel de ventas.
 */
export interface StatusDistribution {
  /**
   * Estado de la propiedad
   */
  status: PropertyStatus;

  /**
   * Número de propiedades en este estado
   */
  count: number;

  /**
   * Porcentaje del total
   */
  percentage: number;

  /**
   * Valor total de propiedades en este estado
   */
  totalValue?: number;

  /**
   * Días promedio en este estado
   *
   * Útil para métricas de eficiencia:
   * - ¿Cuánto tiempo tarda en venderse una propiedad?
   * - ¿Cuánto tiempo pasa en negociación?
   */
  averageDaysInStatus?: number;
}

// ============================================================================
// TENDENCIAS Y COMPARACIONES
// ============================================================================

/**
 * Tendencia (incremento o decremento respecto a período anterior)
 *
 * Útil para mostrar flechas arriba/abajo en el dashboard.
 */
export interface Trend {
  /**
   * Valor actual
   */
  current: number;

  /**
   * Valor del período anterior
   */
  previous: number;

  /**
   * Cambio absoluto (current - previous)
   */
  change: number;

  /**
   * Cambio porcentual
   *
   * Ejemplo: 15.5 (representa 15.5% de incremento)
   * Puede ser negativo para decrementos.
   */
  changePercentage: number;

  /**
   * Dirección de la tendencia
   */
  direction: 'up' | 'down' | 'stable';
}

/**
 * Comparación de períodos
 *
 * Útil para dashboards con filtros de tiempo.
 */
export interface PeriodComparison {
  /**
   * Label del período actual
   * Ejemplo: "Noviembre 2026", "Q4 2026", "Este mes"
   */
  currentPeriod: string;

  /**
   * Label del período anterior
   * Ejemplo: "Octubre 2026", "Q3 2026", "Mes anterior"
   */
  previousPeriod: string;

  /**
   * Ventas en período actual
   */
  currentSales: number;

  /**
   * Ventas en período anterior
   */
  previousSales: number;

  /**
   * Tendencia de ventas
   */
  salesTrend: Trend;

  /**
   * Revenue en período actual
   */
  currentRevenue: number;

  /**
   * Revenue en período anterior
   */
  previousRevenue: number;

  /**
   * Tendencia de revenue
   */
  revenueTrend: Trend;
}

// ============================================================================
// CONFIGURACIÓN DE DASHBOARD
// ============================================================================

/**
 * Filtros para datos del dashboard
 *
 * Permite personalizar las estadísticas mostradas.
 */
export interface DashboardFilters {
  /**
   * Rango de fechas
   */
  dateFrom?: string; // ISO 8601 format
  dateTo?: string;

  /**
   * Filtrar por ciudad
   */
  city?: string;

  /**
   * Filtrar por tipo de propiedad
   */
  propertyType?: PropertyType;

  /**
   * Período de comparación para tendencias
   * Ejemplos: "month", "quarter", "year"
   */
  comparisonPeriod?: 'week' | 'month' | 'quarter' | 'year';
}

/**
 * Configuración del dashboard por usuario
 *
 * Permite que cada usuario personalice su vista del dashboard.
 */
export interface DashboardConfig {
  /**
   * Widgets visibles
   */
  visibleWidgets: string[];

  /**
   * Orden de los widgets
   */
  widgetOrder: string[];

  /**
   * Período por defecto para gráficos
   */
  defaultPeriod: 'week' | 'month' | 'quarter' | 'year';

  /**
   * Auto-refresh interval en segundos (0 = desactivado)
   */
  autoRefreshInterval: number;
}

// ============================================================================
// TIPOS HELPER
// ============================================================================

/**
 * Estado de carga del dashboard
 *
 * Útil para manejar múltiples peticiones asíncronas.
 */
export interface DashboardLoadingState {
  summary: boolean;
  cityDistribution: boolean;
  typeDistribution: boolean;
  monthlyStats: boolean;
  statusDistribution: boolean;
}

/**
 * Datos completos del dashboard
 *
 * Agrupa todas las secciones del dashboard en una sola interfaz.
 * Útil para state management con NgRx.
 */
export interface DashboardData {
  summary: DashboardSummary | null;
  cityDistribution: CityDistribution[];
  typeDistribution: PropertyTypeDistribution[];
  monthlyStats: MonthlyStats[];
  statusDistribution: StatusDistribution[];
  lastUpdated: Date | null;
}

// ============================================================================
// CONSTANTES
// ============================================================================

/**
 * Configuración por defecto del dashboard
 */
export const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  visibleWidgets: ['summary', 'cityChart', 'typeChart', 'monthlyChart', 'statusChart'],
  widgetOrder: ['summary', 'cityChart', 'typeChart', 'monthlyChart', 'statusChart'],
  defaultPeriod: 'month',
  autoRefreshInterval: 0, // Desactivado
};

/**
 * Número de meses a mostrar por defecto en gráficos temporales
 */
export const DEFAULT_MONTHS_TO_SHOW = 6;

/**
 * Colores para gráficos (Chart.js compatible)
 */
export const DASHBOARD_CHART_COLORS = {
  primary: '#3B82F6', // Azul
  success: '#10B981', // Verde
  warning: '#F59E0B', // Amarillo
  danger: '#EF4444', // Rojo
  info: '#06B6D4', // Cyan
  secondary: '#6B7280', // Gris
} as const;

// ============================================================================
// NOTAS PEDAGÓGICAS
// ============================================================================

/**
 * ¿Por qué separar los modelos por feature?
 *
 * Aunque todos estos modelos están en core/models/, reflejan
 * diferentes features del sistema:
 *
 * - property.model.ts: Feature de propiedades
 * - dashboard.model.ts: Feature de dashboard
 * - api-response.model.ts: Infraestructura compartida
 *
 * Esta separación:
 * ✅ Facilita encontrar modelos relacionados
 * ✅ Reduce el tamaño de archivos individuales
 * ✅ Mejora la mantenibilidad
 * ✅ Permite imports específicos
 *
 * Alternativa (NO recomendada para proyectos grandes):
 * ```typescript
 * // ❌ Un solo archivo models.ts con todo
 * // - Difícil de navegar
 * // - Imports más pesados
 * // - Merge conflicts frecuentes
 * ```
 */

/**
 * ¿Cómo diseñar modelos para gráficos?
 *
 * Al diseñar modelos para visualizaciones, considera:
 *
 * 1. Formato amigable para librerías de gráficos:
 *    ```typescript
 *    // ✅ Bien: Fácil de mapear a Chart.js
 *    { month: "2026-11", sales: 10 }
 *
 *    // ❌ Mal: Requiere transformación compleja
 *    { date: { year: 2026, month: 11 }, data: { sales: { count: 10 } } }
 *    ```
 *
 * 2. Incluir datos calculados cuando sea eficiente:
 *    ```typescript
 *    // ✅ Bien: Backend calcula el porcentaje
 *    { city: "Guadalajara", count: 45, percentage: 37.5 }
 *
 *    // ⚠️ Alternativa: Frontend calcula
 *    { city: "Guadalajara", count: 45 }
 *    // percentage = (count / total) * 100
 *    ```
 *
 * 3. Ordenamiento apropiado:
 *    - Datos temporales: Orden cronológico (más antiguo primero)
 *    - Rankings: Orden descendente por valor
 *    - Categorías: Orden alfabético o por relevancia
 */

/**
 * ¿Cuándo agregar campos opcionales?
 *
 * Los campos opcionales (?) son útiles cuando:
 *
 * ✅ El backend puede o no incluir el campo
 * ✅ El campo solo es relevante en ciertos contextos
 * ✅ Quieres mantener compatibilidad hacia atrás
 *
 * Pero ten cuidado:
 * ⚠️ Demasiados opcionales = incertidumbre
 * ⚠️ Requieren null checks en el código
 *
 * Alternativa: Interfaces separadas
 * ```typescript
 * // Versión básica
 * interface BasicCityDistribution {
 *   city: string;
 *   count: number;
 * }
 *
 * // Versión detallada
 * interface DetailedCityDistribution extends BasicCityDistribution {
 *   percentage: number;
 *   averagePrice: number;
 * }
 * ```
 */
