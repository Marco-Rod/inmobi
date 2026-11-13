/**
 * Enums y Union Types del dominio inmobiliario
 *
 * Este archivo centraliza todos los tipos enumerados utilizados en la aplicación.
 * Se prefiere el uso de union types sobre enums tradicionales de TypeScript
 * por las siguientes razones:
 *
 * 1. Son más simples y ligeros en el JavaScript generado
 * 2. No requieren imports adicionales
 * 3. Mejor integración con APIs REST (valores string directos)
 * 4. Type-safe en tiempo de compilación
 */

// ============================================================================
// TIPOS DE PROPIEDAD
// ============================================================================

/**
 * Tipo de propiedad inmobiliaria
 *
 * Define las categorías principales de inmuebles que el sistema puede gestionar.
 * Estos valores deben coincidir exactamente con los que devuelve el backend.
 */
export type PropertyType = 'house' | 'apartment' | 'land' | 'commercial' | 'office';

/**
 * Etiquetas legibles para los tipos de propiedad
 *
 * Útil para mostrar en la interfaz de usuario sin tener que
 * hacer transformaciones en los componentes.
 */
export const PropertyTypeLabels: Record<PropertyType, string> = {
  house: 'Casa',
  apartment: 'Departamento',
  land: 'Terreno',
  commercial: 'Local comercial',
  office: 'Oficina',
};

/**
 * Array con todos los tipos de propiedad
 *
 * Útil para generar dropdowns, validaciones o iteraciones.
 */
export const PropertyTypes: PropertyType[] = [
  'house',
  'apartment',
  'land',
  'commercial',
  'office',
];

// ============================================================================
// TIPO DE OPERACIÓN
// ============================================================================

/**
 * Tipo de operación inmobiliaria
 *
 * Define si la propiedad está disponible para venta o renta.
 */
export type OperationType = 'sale' | 'rent';

/**
 * Etiquetas legibles para los tipos de operación
 */
export const OperationTypeLabels: Record<OperationType, string> = {
  sale: 'Venta',
  rent: 'Renta',
};

/**
 * Array con todos los tipos de operación
 */
export const OperationTypes: OperationType[] = ['sale', 'rent'];

// ============================================================================
// ESTADO DE PROPIEDAD
// ============================================================================

/**
 * Estado actual de una propiedad
 *
 * Representa el ciclo de vida de una propiedad en el CRM:
 * - available: Disponible para venta o renta
 * - sold: Ya vendida, no disponible
 * - rented: Actualmente rentada
 * - negotiating: En proceso de negociación
 */
export type PropertyStatus = 'available' | 'sold' | 'rented' | 'negotiating';

/**
 * Etiquetas legibles para los estados
 */
export const PropertyStatusLabels: Record<PropertyStatus, string> = {
  available: 'Disponible',
  sold: 'Vendida',
  rented: 'Rentada',
  negotiating: 'En negociación',
};

/**
 * Colores para representar estados en la UI
 *
 * Útil para badges, chips o indicadores visuales.
 * Estos valores son compatibles con PrimeNG severity.
 */
export const PropertyStatusColors: Record<PropertyStatus, string> = {
  available: 'success', // Verde
  sold: 'info', // Azul
  rented: 'warning', // Amarillo
  negotiating: 'secondary', // Gris
};

/**
 * Array con todos los estados
 */
export const PropertyStatuses: PropertyStatus[] = [
  'available',
  'sold',
  'rented',
  'negotiating',
];

// ============================================================================
// MONEDA
// ============================================================================

/**
 * Monedas soportadas
 *
 * El sistema soporta pesos mexicanos (MXN) y dólares estadounidenses (USD).
 */
export type Currency = 'MXN' | 'USD';

/**
 * Símbolos de las monedas
 */
export const CurrencySymbols: Record<Currency, string> = {
  MXN: '$',
  USD: 'US$',
};

/**
 * Nombres completos de las monedas
 */
export const CurrencyNames: Record<Currency, string> = {
  MXN: 'Pesos Mexicanos',
  USD: 'Dólares',
};

/**
 * Array con todas las monedas
 */
export const Currencies: Currency[] = ['MXN', 'USD'];

// ============================================================================
// ORDEN DE CLASIFICACIÓN
// ============================================================================

/**
 * Campos por los que se puede ordenar
 */
export type SortField = 'price' | 'createdAt' | 'areaM2' | 'title';

/**
 * Dirección del ordenamiento
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Etiquetas para los campos de ordenamiento
 */
export const SortFieldLabels: Record<SortField, string> = {
  price: 'Precio',
  createdAt: 'Fecha de registro',
  areaM2: 'Superficie',
  title: 'Título',
};

// ============================================================================
// ESTADOS DE CARGA
// ============================================================================

/**
 * Estados de carga de operaciones asíncronas
 *
 * Útil para manejar el estado de peticiones HTTP en los componentes.
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// ============================================================================
// HELPER FUNCTIONS (Type Guards)
// ============================================================================

/**
 * Type guard para verificar si un valor es un PropertyType válido
 *
 * Ejemplo de uso:
 * ```typescript
 * const value: unknown = 'house';
 * if (isPropertyType(value)) {
 *   // TypeScript sabe que value es PropertyType
 *   console.log(PropertyTypeLabels[value]);
 * }
 * ```
 */
export function isPropertyType(value: unknown): value is PropertyType {
  return typeof value === 'string' && PropertyTypes.includes(value as PropertyType);
}

/**
 * Type guard para verificar si un valor es un OperationType válido
 */
export function isOperationType(value: unknown): value is OperationType {
  return typeof value === 'string' && OperationTypes.includes(value as OperationType);
}

/**
 * Type guard para verificar si un valor es un PropertyStatus válido
 */
export function isPropertyStatus(value: unknown): value is PropertyStatus {
  return typeof value === 'string' && PropertyStatuses.includes(value as PropertyStatus);
}

/**
 * Type guard para verificar si un valor es una Currency válida
 */
export function isCurrency(value: unknown): value is Currency {
  return typeof value === 'string' && Currencies.includes(value as Currency);
}

// ============================================================================
// NOTAS PEDAGÓGICAS
// ============================================================================

/**
 * ¿Por qué union types en lugar de enums?
 *
 * TypeScript ofrece dos formas principales de definir conjuntos de valores:
 *
 * 1. Enums tradicionales:
 *    enum PropertyType { House = 'house', Apartment = 'apartment' }
 *
 * 2. Union types (lo que usamos aquí):
 *    type PropertyType = 'house' | 'apartment'
 *
 * Ventajas de union types:
 * ✅ JavaScript más simple y ligero
 * ✅ No requiere imports
 * ✅ Mejor integración con JSON/API
 * ✅ Autocompletado en el IDE
 * ✅ Type-safe en compilación
 *
 * Desventajas de union types:
 * ⚠️ No se pueden iterar directamente (solución: array auxiliar)
 * ⚠️ No tienen namespace (solución: usar prefijos claros)
 *
 * Para este proyecto, las ventajas superan las desventajas.
 */

/**
 * ¿Qué son los Type Guards?
 *
 * Los type guards son funciones que permiten a TypeScript "afinar"
 * el tipo de una variable en tiempo de compilación.
 *
 * Sin type guard:
 * ```typescript
 * function process(value: unknown) {
 *   console.log(PropertyTypeLabels[value]); // ❌ Error de TypeScript
 * }
 * ```
 *
 * Con type guard:
 * ```typescript
 * function process(value: unknown) {
 *   if (isPropertyType(value)) {
 *     console.log(PropertyTypeLabels[value]); // ✅ TypeScript sabe que es PropertyType
 *   }
 * }
 * ```
 *
 * Esto es especialmente útil cuando:
 * - Recibimos datos del backend
 * - Procesamos datos de formularios
 * - Validamos query parameters de la URL
 */
