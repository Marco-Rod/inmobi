/**
 * Modelos para respuestas de la API REST
 *
 * Este archivo define las estructuras de datos que la API devuelve.
 * Siguiendo el principio de separación de responsabilidades, estos modelos
 * representan el "formato de transporte" (capa HTTP), no necesariamente
 * el modelo de dominio de la aplicación.
 *
 * CONCEPTOS IMPORTANTES:
 *
 * 1. Generics (<T>):
 *    - Permiten crear tipos reutilizables
 *    - PaginatedResponse<Property> es diferente de PaginatedResponse<User>
 *    - TypeScript mantiene la seguridad de tipos
 *
 * 2. Consistencia:
 *    - Todas las APIs deben devolver formatos consistentes
 *    - Facilita el manejo de errores centralizado
 *    - Simplifica la lógica de los servicios
 */

// ============================================================================
// RESPUESTAS PAGINADAS
// ============================================================================

/**
 * Respuesta paginada estándar
 *
 * Este formato es compatible con Django Rest Framework y muchos otros
 * frameworks backend. La paginación basada en números de página es más
 * simple que cursor-based pagination para aplicaciones de tamaño medio.
 *
 * Uso del Generic <T>:
 * ```typescript
 * type PropertyPage = PaginatedResponse<Property>;
 * type UserPage = PaginatedResponse<User>;
 * ```
 *
 * @template T - Tipo de los elementos en el array results
 */
export interface PaginatedResponse<T> {
  /**
   * Número total de registros que coinciden con los filtros
   *
   * Útil para:
   * - Calcular el número total de páginas
   * - Mostrar "Mostrando 1-10 de 150 resultados"
   * - Decidir si mostrar paginación
   */
  count: number;

  /**
   * Número de la página siguiente
   *
   * null indica que esta es la última página.
   * Algunos backends devuelven la URL completa, otros solo el número.
   */
  next: number | null;

  /**
   * Número de la página anterior
   *
   * null indica que esta es la primera página.
   */
  previous: number | null;

  /**
   * Array de resultados de la página actual
   *
   * El tamaño de este array depende del parámetro page_size.
   * Típicamente: 10, 20, 50 o 100 elementos.
   */
  results: T[];
}

/**
 * Metadatos de paginación
 *
 * Estructura alternativa o complementaria que algunos backends incluyen
 * para proporcionar información adicional sobre la paginación.
 */
export interface PaginationMeta {
  /**
   * Número de página actual (1-indexed)
   */
  currentPage: number;

  /**
   * Elementos por página
   */
  pageSize: number;

  /**
   * Número total de páginas
   */
  totalPages: number;

  /**
   * Total de elementos
   */
  totalCount: number;

  /**
   * ¿Hay página siguiente?
   */
  hasNext: boolean;

  /**
   * ¿Hay página anterior?
   */
  hasPrevious: boolean;
}

// ============================================================================
// RESPUESTAS DE ÉXITO
// ============================================================================

/**
 * Respuesta exitosa genérica
 *
 * Algunos endpoints devuelven un objeto wrapper con metadata adicional.
 * Esto es útil para operaciones que no son simples lecturas.
 *
 * @template T - Tipo de los datos devueltos
 */
export interface ApiSuccessResponse<T> {
  /**
   * Datos devueltos por la operación
   */
  data: T;

  /**
   * Mensaje descriptivo opcional
   * Ejemplo: "Propiedad creada exitosamente"
   */
  message?: string;

  /**
   * Timestamp del servidor (opcional)
   */
  timestamp?: string;
}

// ============================================================================
// RESPUESTAS DE ERROR
// ============================================================================

/**
 * Respuesta de error estándar
 *
 * Formato consistente para todos los errores HTTP (4xx, 5xx).
 * Basado en el estándar Problem Details (RFC 7807) adaptado a REST.
 */
export interface ApiErrorResponse {
  /**
   * Mensaje principal del error
   *
   * Debe ser legible para humanos y útil para debugging.
   * Ejemplos:
   * - "Property not found"
   * - "Validation error"
   * - "Internal server error"
   */
  detail: string;

  /**
   * Errores de validación por campo (opcional)
   *
   * Estructura: { campo: [array de mensajes de error] }
   *
   * Ejemplo:
   * ```json
   * {
   *   "detail": "Validation error",
   *   "errors": {
   *     "price": ["El precio debe ser mayor que cero."],
   *     "title": ["Este campo es requerido.", "Debe tener al menos 3 caracteres."]
   *   }
   * }
   * ```
   */
  errors?: Record<string, string[]>;

  /**
   * Código de error interno (opcional)
   *
   * Útil para debugging y logging.
   * Ejemplo: "PROPERTY_NOT_FOUND", "INVALID_PRICE"
   */
  code?: string;

  /**
   * ID de la request para tracking (opcional)
   *
   * Permite correlacionar errores en el frontend con logs del backend.
   */
  requestId?: string;

  /**
   * Stack trace (solo en desarrollo)
   *
   * NUNCA debe incluirse en producción por seguridad.
   */
  stackTrace?: string;
}

/**
 * Error de validación específico
 *
 * Estructura más detallada para errores de validación de formularios.
 */
export interface ValidationError {
  /**
   * Campo que falló la validación
   */
  field: string;

  /**
   * Valor que se intentó asignar
   */
  value: unknown;

  /**
   * Mensajes de error
   */
  messages: string[];

  /**
   * Regla de validación que falló
   * Ejemplo: "required", "min", "max", "pattern"
   */
  rule?: string;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Tipo para representar el estado de una petición HTTP
 *
 * Útil en componentes que manejan múltiples estados de carga.
 *
 * Ejemplo de uso:
 * ```typescript
 * interface ComponentState<T> {
 *   data: T | null;
 *   status: ApiRequestState;
 *   error: string | null;
 * }
 * ```
 */
export type ApiRequestState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Metadata de respuesta HTTP
 *
 * Información adicional que algunos servicios pueden querer capturar.
 */
export interface ResponseMetadata {
  /**
   * Código de estado HTTP
   */
  statusCode: number;

  /**
   * Headers de la respuesta
   */
  headers?: Record<string, string>;

  /**
   * Duración de la petición en ms
   */
  duration?: number;

  /**
   * Timestamp de la respuesta
   */
  timestamp: Date;
}

// ============================================================================
// TIPOS ESPECIALIZADOS
// ============================================================================

/**
 * Respuesta de operación de creación
 *
 * Para endpoints POST que crean recursos.
 * Típicamente devuelve el recurso creado con su ID generado.
 */
export interface CreateResponse<T> {
  data: T;
  message: string;
  createdAt: string;
}

/**
 * Respuesta de operación de actualización
 *
 * Para endpoints PUT/PATCH que actualizan recursos.
 */
export interface UpdateResponse<T> {
  data: T;
  message: string;
  updatedAt: string;
}

/**
 * Respuesta de operación de eliminación
 *
 * Para endpoints DELETE. Típicamente no devuelve contenido (204 No Content),
 * pero algunos backends prefieren devolver una confirmación.
 */
export interface DeleteResponse {
  message: string;
  deletedId: number;
  deletedAt: string;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Verifica si una respuesta es un error
 *
 * Type guard que permite a TypeScript inferir el tipo correcto.
 *
 * Ejemplo:
 * ```typescript
 * function handleResponse(response: unknown) {
 *   if (isApiErrorResponse(response)) {
 *     // TypeScript sabe que response es ApiErrorResponse
 *     console.error(response.detail);
 *   }
 * }
 * ```
 */
export function isApiErrorResponse(response: unknown): response is ApiErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'detail' in response &&
    typeof (response as ApiErrorResponse).detail === 'string'
  );
}

/**
 * Verifica si una respuesta es paginada
 *
 * Type guard para respuestas paginadas.
 */
export function isPaginatedResponse<T>(response: unknown): response is PaginatedResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'count' in response &&
    'results' in response &&
    Array.isArray((response as PaginatedResponse<T>).results)
  );
}

/**
 * Verifica si un error tiene validaciones de campos
 */
export function hasValidationErrors(error: ApiErrorResponse): error is ApiErrorResponse & { errors: Record<string, string[]> } {
  return error.errors !== undefined && typeof error.errors === 'object';
}

// ============================================================================
// CONSTANTES
// ============================================================================

/**
 * Mensajes de error por defecto
 *
 * Útiles cuando el backend no devuelve un mensaje específico.
 */
export const DEFAULT_ERROR_MESSAGES = {
  400: 'Solicitud inválida. Verifica los datos enviados.',
  401: 'No autenticado. Por favor inicia sesión.',
  403: 'No tienes permisos para realizar esta acción.',
  404: 'Recurso no encontrado.',
  409: 'Conflicto. El recurso ya existe.',
  422: 'Error de validación. Verifica los datos.',
  500: 'Error del servidor. Inténtalo más tarde.',
  503: 'Servicio no disponible. Inténtalo más tarde.',
} as const;

/**
 * Configuración de paginación por defecto
 */
export const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 10,
  maxPageSize: 100,
} as const;

// ============================================================================
// NOTAS PEDAGÓGICAS
// ============================================================================

/**
 * ¿Qué son los Generics?
 *
 * Los generics permiten crear componentes reutilizables que funcionan
 * con múltiples tipos mientras mantienen type safety.
 *
 * Sin generics (código duplicado):
 * ```typescript
 * interface PropertyPaginatedResponse {
 *   count: number;
 *   results: Property[];
 * }
 *
 * interface UserPaginatedResponse {
 *   count: number;
 *   results: User[];
 * }
 * ```
 *
 * Con generics (código reutilizable):
 * ```typescript
 * interface PaginatedResponse<T> {
 *   count: number;
 *   results: T[];
 * }
 *
 * type PropertyPage = PaginatedResponse<Property>;
 * type UserPage = PaginatedResponse<User>;
 * ```
 *
 * TypeScript reemplaza T con el tipo real al usar el generic.
 */

/**
 * ¿Por qué estandarizar las respuestas de error?
 *
 * Beneficios de un formato de error consistente:
 *
 * 1. Manejo centralizado de errores:
 *    - Un interceptor puede procesar todos los errores
 *    - No necesitamos lógica diferente en cada servicio
 *
 * 2. Mejor experiencia de usuario:
 *    - Mensajes de error consistentes
 *    - Fácil mostrar validaciones en formularios
 *
 * 3. Debugging más fácil:
 *    - requestId permite correlacionar con logs del backend
 *    - Estructura predecible facilita el debugging
 *
 * 4. Testing más simple:
 *    - Fácil crear mocks de errores
 *    - Tests más mantenibles
 */

/**
 * ¿Cuándo usar wrappers vs respuestas directas?
 *
 * Respuesta directa (preferida para GET simples):
 * ```json
 * { "id": 1, "title": "Casa" }
 * ```
 *
 * Respuesta con wrapper:
 * ```json
 * {
 *   "data": { "id": 1, "title": "Casa" },
 *   "message": "Propiedad obtenida exitosamente"
 * }
 * ```
 *
 * Usa wrappers cuando:
 * ✅ Necesitas incluir metadata
 * ✅ Quieres consistencia total en todas las respuestas
 * ✅ El backend sigue ese estándar
 *
 * Usa respuestas directas cuando:
 * ✅ Son operaciones de lectura simples
 * ✅ Reduces payload size
 * ✅ Sigues REST puro
 */
