/**
 * Barrel Export para modelos del core
 *
 * Este archivo centraliza todas las exportaciones de modelos, permitiendo
 * importar múltiples tipos desde un solo lugar.
 *
 * PATRÓN BARREL:
 *
 * Sin barrel:
 * ```typescript
 * import { Property } from './property.model';
 * import { PropertyType } from './enums';
 * import { DashboardSummary } from './dashboard.model';
 * ```
 *
 * Con barrel:
 * ```typescript
 * import { Property, PropertyType, DashboardSummary } from '@app/core/models';
 * ```
 *
 * VENTAJAS:
 * ✅ Imports más limpios
 * ✅ Menos líneas de código
 * ✅ Fácil refactorizar ubicación de archivos
 * ✅ API pública clara del módulo
 *
 * DESVENTAJAS:
 * ⚠️ Puede aumentar bundle size si no se usa tree-shaking
 * ⚠️ Puede crear dependencias circulares si no se tiene cuidado
 *
 * BEST PRACTICE:
 * - Solo exportar lo que otros módulos necesiten
 * - No exportar helpers internos
 * - Documentar qué archivo contiene qué tipos
 */

// ============================================================================
// ENUMS Y UNION TYPES
// ============================================================================

export {
  // Property Types
  type PropertyType,
  PropertyTypeLabels,
  PropertyTypes,
  // Operation Types
  type OperationType,
  OperationTypeLabels,
  OperationTypes,
  // Property Status
  type PropertyStatus,
  PropertyStatusLabels,
  PropertyStatusColors,
  PropertyStatuses,
  // Currency
  type Currency,
  CurrencySymbols,
  CurrencyNames,
  Currencies,
  // Sorting
  type SortField,
  type SortOrder,
  SortFieldLabels,
  // Loading State
  type LoadingState,
  // Type Guards
  isPropertyType,
  isOperationType,
  isPropertyStatus,
  isCurrency,
} from './enums';

// ============================================================================
// PROPERTY MODELS
// ============================================================================

export {
  // Main Model
  type Property,
  // DTOs
  type PropertyCreateDto,
  type PropertyUpdateDto,
  // Filters
  type PropertyFilter,
  EMPTY_PROPERTY_FILTER,
  // Stats
  type PropertyStats,
  // Helper Types
  type PropertyFromDto,
  type PropertyRequiredFields,
  // Constants
  DEFAULT_PROPERTY_VALUES,
  PROPERTY_VALIDATION_RULES,
} from './property.model';

// ============================================================================
// API RESPONSE MODELS
// ============================================================================

export {
  // Pagination
  type PaginatedResponse,
  type PaginationMeta,
  // Success Responses
  type ApiSuccessResponse,
  type CreateResponse,
  type UpdateResponse,
  type DeleteResponse,
  // Error Responses
  type ApiErrorResponse,
  type ValidationError,
  // Helper Types
  type ApiRequestState,
  type ResponseMetadata,
  // Type Guards
  isApiErrorResponse,
  isPaginatedResponse,
  hasValidationErrors,
  // Constants
  DEFAULT_ERROR_MESSAGES,
  DEFAULT_PAGINATION,
} from './api-response.model';

// ============================================================================
// DASHBOARD MODELS
// ============================================================================

export {
  // Summary
  type DashboardSummary,
  // Distributions
  type CityDistribution,
  type CityDistributionResponse,
  type PropertyTypeDistribution,
  type StatusDistribution,
  // Monthly Stats
  type MonthlyStats,
  type MonthlyStatsResponse,
  // Trends
  type Trend,
  type PeriodComparison,
  // Configuration
  type DashboardFilters,
  type DashboardConfig,
  DEFAULT_DASHBOARD_CONFIG,
  // Helper Types
  type DashboardLoadingState,
  type DashboardData,
  // Constants
  DEFAULT_MONTHS_TO_SHOW,
  DASHBOARD_CHART_COLORS,
} from './dashboard.model';

// ============================================================================
// RE-EXPORTS ÚTILES
// ============================================================================

// Importamos los tipos necesarios para crear los union types
import type { Property, PropertyCreateDto, PropertyUpdateDto } from './property.model';
import type { DashboardSummary, CityDistribution, MonthlyStats } from './dashboard.model';

/**
 * Union type de todos los modelos principales
 *
 * Útil para funciones genéricas que pueden trabajar con cualquier modelo.
 * Ejemplo: logging, serialización, etc.
 */
export type CoreModel = Property | DashboardSummary | CityDistribution | MonthlyStats;

/**
 * Union type de todos los DTOs
 *
 * Útil para validadores y transformadores genéricos.
 */
export type CoreDto = PropertyCreateDto | PropertyUpdateDto;

// ============================================================================
// NOTAS PEDAGÓGICAS
// ============================================================================

/**
 * ¿Qué es un Barrel Export?
 *
 * Un barrel export es un archivo index.ts que re-exporta todo
 * el contenido de un directorio. Actúa como un "punto de entrada"
 * público al módulo.
 *
 * Estructura típica:
 * ```
 * models/
 *   ├── property.model.ts    (implementación)
 *   ├── dashboard.model.ts   (implementación)
 *   ├── enums.ts             (implementación)
 *   └── index.ts             (barrel)
 * ```
 *
 * Los consumidores solo importan desde index.ts:
 * ```typescript
 * import { Property, PropertyType } from './models';
 * ```
 *
 * No necesitan saber la estructura interna del directorio.
 */

/**
 * ¿Cuándo NO usar barrel exports?
 *
 * Evita barrels cuando:
 *
 * ❌ Tienes dependencias circulares
 *    - Archivo A importa de barrel
 *    - Barrel exporta archivo B
 *    - Archivo B importa archivo A
 *    → Circular dependency
 *
 * ❌ El módulo es muy grande
 *    - Cientos de exports
 *    - Puede afectar tree-shaking
 *    - Mejor dividir en múltiples barrels
 *
 * ❌ Quieres imports específicos por rendimiento
 *    - En algunos casos, imports directos son más eficientes
 *    - Depende del bundler y configuración
 */

/**
 * Best Practices para Barrel Exports:
 *
 * ✅ Agrupa exports relacionados con comentarios
 * ✅ Mantén el orden consistente (alfabético o por importancia)
 * ✅ Re-exporta solo la API pública
 * ✅ Documenta qué archivo contiene cada export
 * ✅ Usa type keyword para tipos cuando sea posible (tree-shaking)
 *
 * ❌ No exportes helpers internos
 * ❌ No crees barrels de barrels (excepto en app root)
 * ❌ No mezcles types con implementaciones
 */

/**
 * Tree-Shaking y el keyword 'type':
 *
 * En TypeScript 3.8+, puedes usar 'type' en imports/exports:
 *
 * ```typescript
 * export { type Property } from './property.model';
 * ```
 *
 * Esto indica explícitamente que Property es solo un tipo,
 * no un valor runtime. Ayuda al bundler a:
 * - Eliminar código no usado más eficientemente
 * - Evitar inclusión accidental de código runtime
 * - Optimizar el bundle final
 *
 * Úsalo para:
 * ✅ Interfaces
 * ✅ Types
 * ✅ Type aliases
 *
 * NO lo uses para:
 * ❌ Enums (son valores runtime)
 * ❌ Clases (son valores runtime)
 * ❌ Constantes (son valores runtime)
 */
