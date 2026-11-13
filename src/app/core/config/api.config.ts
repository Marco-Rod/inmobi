/**
 * Configuración de la API REST
 *
 * Este archivo centraliza todas las rutas y configuraciones relacionadas
 * con la API REST. Mantener las URLs en un solo lugar facilita:
 *
 * 1. Refactoring: Cambiar una URL solo requiere editar este archivo
 * 2. Testing: Fácil crear mocks con las mismas rutas
 * 3. Documentación: Las rutas están documentadas en un solo lugar
 * 4. Type Safety: TypeScript verifica que uses las rutas correctas
 */

import { environment } from '../../../environments/environment';

// ============================================================================
// CONFIGURACIÓN BASE
// ============================================================================

/**
 * URL base de la API
 *
 * Se obtiene del archivo de environment correspondiente:
 * - development: /api/v1 (interceptado por mock)
 * - production: https://api.realestate-crm.com/v1
 */
export const API_BASE_URL = environment.apiUrl;

/**
 * Versión de la API
 *
 * Útil para versionado y compatibility checks.
 */
export const API_VERSION = 'v1';

/**
 * Timeout por defecto para peticiones HTTP (en milisegundos)
 *
 * Después de este tiempo, la petición se cancela automáticamente.
 */
export const API_TIMEOUT = 30000; // 30 segundos

/**
 * Número de reintentos automáticos en caso de error de red
 */
export const API_RETRY_COUNT = 2;

/**
 * Delay entre reintentos (en milisegundos)
 */
export const API_RETRY_DELAY = 1000; // 1 segundo

// ============================================================================
// ENDPOINTS DE PROPIEDADES
// ============================================================================

/**
 * Endpoints del módulo de propiedades
 *
 * PATRÓN UTILIZADO:
 * - Funciones para endpoints con parámetros
 * - Constantes para endpoints fijos
 *
 * Esto proporciona:
 * ✅ Type safety: TypeScript verifica que pases el ID correcto
 * ✅ Reusabilidad: Misma lógica para construir URLs
 * ✅ Testabilidad: Fácil verificar las URLs generadas
 */
export const PROPERTY_ENDPOINTS = {
  /**
   * Base path para propiedades
   */
  base: `${API_BASE_URL}/properties`,

  /**
   * GET /api/v1/properties/
   * Listar propiedades (con paginación y filtros)
   */
  list: `${API_BASE_URL}/properties/`,

  /**
   * GET /api/v1/properties/{id}/
   * Obtener una propiedad específica
   *
   * @param id - ID de la propiedad
   * @returns URL completa del endpoint
   *
   * Ejemplo:
   * ```typescript
   * const url = PROPERTY_ENDPOINTS.detail(123);
   * // Resultado: "/api/v1/properties/123/"
   * ```
   */
  detail: (id: number): string => `${API_BASE_URL}/properties/${id}/`,

  /**
   * POST /api/v1/properties/
   * Crear nueva propiedad
   */
  create: `${API_BASE_URL}/properties/`,

  /**
   * PUT /api/v1/properties/{id}/
   * Actualizar propiedad completa
   *
   * @param id - ID de la propiedad
   */
  update: (id: number): string => `${API_BASE_URL}/properties/${id}/`,

  /**
   * PATCH /api/v1/properties/{id}/
   * Actualizar propiedad parcialmente
   *
   * @param id - ID de la propiedad
   */
  patch: (id: number): string => `${API_BASE_URL}/properties/${id}/`,

  /**
   * DELETE /api/v1/properties/{id}/
   * Eliminar propiedad
   *
   * @param id - ID de la propiedad
   */
  delete: (id: number): string => `${API_BASE_URL}/properties/${id}/`,
} as const;

// ============================================================================
// ENDPOINTS DEL DASHBOARD
// ============================================================================

/**
 * Endpoints del dashboard
 */
export const DASHBOARD_ENDPOINTS = {
  /**
   * Base path para dashboard
   */
  base: `${API_BASE_URL}/dashboard`,

  /**
   * GET /api/v1/dashboard/summary/
   * Obtener resumen general del dashboard
   */
  summary: `${API_BASE_URL}/dashboard/summary/`,

  /**
   * GET /api/v1/dashboard/city-distribution/
   * Obtener distribución de propiedades por ciudad
   */
  cityDistribution: `${API_BASE_URL}/dashboard/city-distribution/`,

  /**
   * GET /api/v1/dashboard/monthly-stats/
   * Obtener estadísticas mensuales
   *
   * Query params opcionales:
   * - months: número de meses a incluir (default: 6)
   */
  monthlyStats: `${API_BASE_URL}/dashboard/monthly-stats/`,

  /**
   * GET /api/v1/dashboard/type-distribution/
   * Obtener distribución de propiedades por tipo
   */
  typeDistribution: `${API_BASE_URL}/dashboard/type-distribution/`,

  /**
   * GET /api/v1/dashboard/status-distribution/
   * Obtener distribución de propiedades por estado
   */
  statusDistribution: `${API_BASE_URL}/dashboard/status-distribution/`,
} as const;

// ============================================================================
// ENDPOINTS DE REPORTES
// ============================================================================

/**
 * Endpoints del módulo de reportes
 */
export const REPORT_ENDPOINTS = {
  /**
   * Base path para reportes
   */
  base: `${API_BASE_URL}/reports`,

  /**
   * GET /api/v1/reports/by-city/
   * Reporte detallado por ciudad
   */
  byCity: `${API_BASE_URL}/reports/by-city/`,

  /**
   * GET /api/v1/reports/by-type/
   * Reporte detallado por tipo de propiedad
   */
  byType: `${API_BASE_URL}/reports/by-type/`,

  /**
   * GET /api/v1/reports/by-status/
   * Reporte detallado por estado
   */
  byStatus: `${API_BASE_URL}/reports/by-status/`,
} as const;

// ============================================================================
// HEADERS HTTP ESTÁNDAR
// ============================================================================

/**
 * Headers HTTP comunes
 *
 * Estos headers se envían en todas las peticiones.
 */
export const DEFAULT_HTTP_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
} as const;

/**
 * Headers adicionales para peticiones con autenticación (futuro)
 *
 * Ejemplo de uso:
 * ```typescript
 * const headers = {
 *   ...DEFAULT_HTTP_HEADERS,
 *   Authorization: `Bearer ${token}`
 * };
 * ```
 */
export const AUTH_HEADER_KEY = 'Authorization';

// ============================================================================
// QUERY PARAMETERS
// ============================================================================

/**
 * Nombres de query parameters estándar
 *
 * Mantener nombres consistentes facilita el trabajo con la API.
 */
export const QUERY_PARAMS = {
  // Paginación
  page: 'page',
  pageSize: 'page_size',

  // Búsqueda y filtros
  search: 'search',
  city: 'city',
  propertyType: 'property_type',
  operation: 'operation',
  status: 'status',
  minPrice: 'min_price',
  maxPrice: 'max_price',

  // Ordenamiento
  sortBy: 'sort_by',
  sortOrder: 'sort_order',

  // Otros
  months: 'months', // Para estadísticas mensuales
} as const;

// ============================================================================
// CÓDIGOS DE ESTADO HTTP
// ============================================================================

/**
 * Códigos HTTP que la aplicación maneja específicamente
 *
 * Útil para lógica condicional en interceptores y servicios.
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ============================================================================
// CONFIGURACIÓN DE CACHE
// ============================================================================

/**
 * Configuración de cache para diferentes endpoints
 *
 * Algunos datos cambian raramente y pueden cachearse para mejorar rendimiento.
 */
export const CACHE_CONFIG = {
  /**
   * Dashboard summary: cachear por 5 minutos
   */
  dashboardSummary: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutos en milisegundos
  },

  /**
   * Listado de propiedades: cachear por 1 minuto
   */
  propertyList: {
    enabled: true,
    ttl: 1 * 60 * 1000, // 1 minuto
  },

  /**
   * Detalle de propiedad: cachear por 2 minutos
   */
  propertyDetail: {
    enabled: true,
    ttl: 2 * 60 * 1000, // 2 minutos
  },

  /**
   * Estadísticas: cachear por 10 minutos
   */
  statistics: {
    enabled: true,
    ttl: 10 * 60 * 1000, // 10 minutos
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Construye query parameters desde un objeto
 *
 * Convierte un objeto JavaScript en query string para URLs.
 *
 * @param params - Objeto con los parámetros
 * @returns Query string (sin el '?' inicial)
 *
 * Ejemplo:
 * ```typescript
 * const params = { page: 1, city: 'Guadalajara', minPrice: 1000000 };
 * const query = buildQueryParams(params);
 * // Resultado: "page=1&city=Guadalajara&min_price=1000000"
 * ```
 *
 * NOTA: HttpParams de Angular es la forma recomendada en producción,
 * pero esta función es útil para entender el concepto.
 */
export function buildQueryParams(params: Record<string, unknown>): string {
  return Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
}

/**
 * Construye URL completa con query parameters
 *
 * @param baseUrl - URL base
 * @param params - Parámetros opcionales
 * @returns URL completa
 *
 * Ejemplo:
 * ```typescript
 * const url = buildUrl('/api/v1/properties/', { page: 1, city: 'Guadalajara' });
 * // Resultado: "/api/v1/properties/?page=1&city=Guadalajara"
 * ```
 */
export function buildUrl(baseUrl: string, params?: Record<string, unknown>): string {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }

  const query = buildQueryParams(params);
  return `${baseUrl}?${query}`;
}

/**
 * Verifica si un código de estado HTTP indica éxito
 *
 * @param status - Código HTTP
 * @returns true si el código está en el rango 2xx
 */
export function isSuccessStatus(status: number): boolean {
  return status >= 200 && status < 300;
}

/**
 * Verifica si un código de estado HTTP indica error del cliente
 *
 * @param status - Código HTTP
 * @returns true si el código está en el rango 4xx
 */
export function isClientError(status: number): boolean {
  return status >= 400 && status < 500;
}

/**
 * Verifica si un código de estado HTTP indica error del servidor
 *
 * @param status - Código HTTP
 * @returns true si el código está en el rango 5xx
 */
export function isServerError(status: number): boolean {
  return status >= 500 && status < 600;
}

// ============================================================================
// TIPOS AUXILIARES
// ============================================================================

/**
 * Tipo para los endpoints de propiedades
 *
 * Útil para funciones que necesitan trabajar genéricamente con endpoints.
 */
export type PropertyEndpoint = keyof typeof PROPERTY_ENDPOINTS;

/**
 * Tipo para los endpoints del dashboard
 */
export type DashboardEndpoint = keyof typeof DASHBOARD_ENDPOINTS;

/**
 * Tipo para los endpoints de reportes
 */
export type ReportEndpoint = keyof typeof REPORT_ENDPOINTS;

// ============================================================================
// NOTAS PEDAGÓGICAS
// ============================================================================

/**
 * ¿Por qué centralizar las URLs?
 *
 * Alternativa (NO recomendada):
 * ```typescript
 * // En property.service.ts
 * getProperty(id: number) {
 *   return this.http.get(`/api/v1/properties/${id}/`);
 * }
 *
 * // En property-detail.component.ts
 * loadProperty() {
 *   this.http.get(`/api/v1/properties/${this.id}/`).subscribe(...);
 * }
 * ```
 *
 * Problemas:
 * ❌ URLs duplicadas en múltiples archivos
 * ❌ Fácil cometer errores de typo
 * ❌ Difícil cambiar una URL
 * ❌ No hay single source of truth
 *
 * Solución (lo que hacemos):
 * ```typescript
 * // En api.config.ts
 * export const PROPERTY_ENDPOINTS = {
 *   detail: (id: number) => `/api/v1/properties/${id}/`
 * };
 *
 * // En property.service.ts
 * getProperty(id: number) {
 *   return this.http.get(PROPERTY_ENDPOINTS.detail(id));
 * }
 * ```
 *
 * Ventajas:
 * ✅ Single source of truth
 * ✅ Type-safe (TypeScript verifica los parámetros)
 * ✅ Fácil de mantener
 * ✅ Autodocumentado
 */

/**
 * ¿Usar constantes o funciones para endpoints?
 *
 * Constantes (sin parámetros):
 * ```typescript
 * list: '/api/v1/properties/'
 * ```
 * ✅ Más simple
 * ✅ Ligero
 *
 * Funciones (con parámetros):
 * ```typescript
 * detail: (id: number) => `/api/v1/properties/${id}/`
 * ```
 * ✅ Type-safe
 * ✅ Menos propenso a errores
 * ✅ Autodocumentado
 *
 * Regla general:
 * - Constante: Si no hay parámetros
 * - Función: Si hay parámetros (IDs, slugs, etc.)
 */
