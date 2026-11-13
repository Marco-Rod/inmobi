/**
 * Modelo de dominio: Property (Propiedad Inmobiliaria)
 *
 * Este archivo define la entidad principal del sistema: las propiedades inmobiliarias.
 * Incluye tanto el modelo de dominio como los DTOs (Data Transfer Objects)
 * utilizados para comunicación con la API.
 *
 * CONCEPTOS IMPORTANTES:
 *
 * 1. Modelo de Dominio vs DTO:
 *    - Modelo de Dominio: Representa la entidad en nuestra aplicación
 *    - DTO: Representa el formato de datos que viaja por HTTP
 *    - Pueden ser diferentes si el backend usa otra convención
 *
 * 2. Inmutabilidad:
 *    - Las interfaces son readonly donde sea apropiado
 *    - Esto ayuda a garantizar que NgRx funcione correctamente
 *
 * 3. Tipos Estrictos:
 *    - No se usa 'any' en ninguna parte
 *    - Todos los campos tienen tipos explícitos
 *    - Las propiedades opcionales usan '?'
 */

import {
  PropertyType,
  OperationType,
  PropertyStatus,
  Currency,
  SortField,
  SortOrder,
} from './enums';

// ============================================================================
// MODELO DE DOMINIO PRINCIPAL
// ============================================================================

/**
 * Propiedad Inmobiliaria
 *
 * Representa una propiedad completa con todos sus atributos.
 * Esta es la interfaz principal que se utiliza en toda la aplicación.
 *
 * NOTA: Los campos con camelCase (ej: propertyType) se usan internamente
 * en la aplicación Angular. El backend puede usar snake_case (property_type),
 * y la transformación se maneja en los servicios o interceptores.
 */
export interface Property {
  /**
   * ID único de la propiedad
   * Generado por el backend al crear la propiedad
   */
  readonly id: number;

  /**
   * Título descriptivo de la propiedad
   * Ejemplo: "Casa residencial en zona exclusiva"
   */
  title: string;

  /**
   * Descripción detallada
   * Ejemplo: "Hermosa casa con acabados de lujo..."
   */
  description: string;

  /**
   * Tipo de propiedad
   * Ver enums.ts para los valores posibles
   */
  propertyType: PropertyType;

  /**
   * Tipo de operación (venta o renta)
   */
  operation: OperationType;

  /**
   * Precio de venta o renta mensual
   * Siempre es un número positivo
   */
  price: number;

  /**
   * Moneda del precio
   */
  currency: Currency;

  /**
   * Ciudad donde se ubica
   */
  city: string;

  /**
   * Estado de la república
   */
  state: string;

  /**
   * Estado actual de la propiedad
   */
  status: PropertyStatus;

  /**
   * Número de habitaciones/recámaras
   * Puede ser 0 para terrenos o locales comerciales
   */
  bedrooms: number;

  /**
   * Número de baños
   * Puede ser 0 para terrenos
   */
  bathrooms: number;

  /**
   * Superficie en metros cuadrados
   */
  areaM2: number;

  /**
   * URL de la imagen principal (opcional)
   * Si no hay imagen, se muestra un placeholder
   */
  imageUrl?: string;

  /**
   * Fecha de creación del registro
   * El backend devuelve string ISO 8601, los servicios lo convierten a Date
   */
  readonly createdAt: Date;

  /**
   * Fecha de última actualización
   */
  readonly updatedAt: Date;
}

// ============================================================================
// DATA TRANSFER OBJECTS (DTOs)
// ============================================================================

/**
 * DTO para crear una nueva propiedad
 *
 * No incluye:
 * - id (lo genera el backend)
 * - status (se asigna como 'available' por defecto)
 * - createdAt, updatedAt (los genera el backend)
 *
 * Todos los campos son requeridos excepto imageUrl.
 */
export interface PropertyCreateDto {
  title: string;
  description: string;
  propertyType: PropertyType;
  operation: OperationType;
  price: number;
  currency: Currency;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  areaM2: number;
  imageUrl?: string;
}

/**
 * DTO para actualizar una propiedad existente
 *
 * Todos los campos son opcionales (actualización parcial permitida).
 * Se utiliza para operaciones PUT y PATCH.
 *
 * Partial<T> es un utility type de TypeScript que hace todos
 * los campos de T opcionales.
 */
export interface PropertyUpdateDto {
  title?: string;
  description?: string;
  propertyType?: PropertyType;
  operation?: OperationType;
  price?: number;
  currency?: Currency;
  city?: string;
  state?: string;
  status?: PropertyStatus;
  bedrooms?: number;
  bathrooms?: number;
  areaM2?: number;
  imageUrl?: string;
}

/**
 * Alternativa usando Partial (produce el mismo resultado):
 *
 * export type PropertyUpdateDto = Partial<Omit<Property, 'id' | 'createdAt' | 'updatedAt'>>;
 *
 * Esta sintaxis:
 * 1. Omit<Property, ...> - Remueve los campos readonly del modelo
 * 2. Partial<...> - Hace todos los campos opcionales
 */

// ============================================================================
// FILTROS Y BÚSQUEDA
// ============================================================================

/**
 * Filtros para búsqueda de propiedades
 *
 * Todos los campos son opcionales. Se pueden combinar múltiples filtros.
 * Los servicios construirán los query parameters HTTP basándose en estos filtros.
 *
 * Ejemplo de uso:
 * ```typescript
 * const filters: PropertyFilter = {
 *   city: 'Guadalajara',
 *   propertyType: 'house',
 *   minPrice: 1000000,
 *   maxPrice: 3000000,
 *   status: 'available'
 * };
 * ```
 */
export interface PropertyFilter {
  /**
   * Búsqueda de texto libre
   * Se busca en title y description
   */
  search?: string;

  /**
   * Filtrar por ciudad
   */
  city?: string;

  /**
   * Filtrar por tipo de propiedad
   */
  propertyType?: PropertyType;

  /**
   * Filtrar por tipo de operación
   */
  operation?: OperationType;

  /**
   * Filtrar por estado
   */
  status?: PropertyStatus;

  /**
   * Precio mínimo (inclusive)
   */
  minPrice?: number;

  /**
   * Precio máximo (inclusive)
   */
  maxPrice?: number;

  /**
   * Campo por el que ordenar
   */
  sortBy?: SortField;

  /**
   * Dirección del ordenamiento
   */
  sortOrder?: SortOrder;
}

/**
 * Filtros vacíos (valores por defecto)
 *
 * Útil para resetear filtros o inicializar el estado.
 */
export const EMPTY_PROPERTY_FILTER: PropertyFilter = {
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

// ============================================================================
// ESTADÍSTICAS Y AGREGACIONES
// ============================================================================

/**
 * Estadística simple de propiedades
 *
 * Utilizado para mostrar contadores y métricas en el dashboard.
 */
export interface PropertyStats {
  /**
   * Total de propiedades en el sistema
   */
  total: number;

  /**
   * Propiedades disponibles
   */
  available: number;

  /**
   * Propiedades vendidas
   */
  sold: number;

  /**
   * Propiedades rentadas
   */
  rented: number;

  /**
   * Propiedades en negociación
   */
  negotiating: number;

  /**
   * Precio promedio
   */
  averagePrice: number;

  /**
   * Moneda para el precio promedio
   */
  currency: Currency;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Type helper para crear una nueva propiedad desde un DTO
 *
 * Este tipo es útil para funciones que transforman DTOs en modelos completos.
 *
 * Ejemplo:
 * ```typescript
 * function createPropertyFromDto(
 *   dto: PropertyCreateDto,
 *   id: number
 * ): Property {
 *   return {
 *     ...dto,
 *     id,
 *     status: 'available',
 *     createdAt: new Date(),
 *     updatedAt: new Date()
 *   };
 * }
 * ```
 */
export type PropertyFromDto = PropertyCreateDto & {
  id: number;
  status: PropertyStatus;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Campos requeridos de Property (sin los readonly)
 *
 * Útil para validaciones de formularios.
 */
export type PropertyRequiredFields = Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'imageUrl'>;

// ============================================================================
// CONSTANTES
// ============================================================================

/**
 * Valores por defecto para nuevas propiedades
 */
export const DEFAULT_PROPERTY_VALUES: Partial<PropertyCreateDto> = {
  currency: 'MXN',
  bedrooms: 0,
  bathrooms: 0,
};

/**
 * Límites de validación
 */
export const PROPERTY_VALIDATION_RULES = {
  title: {
    minLength: 3,
    maxLength: 200,
  },
  description: {
    minLength: 10,
    maxLength: 2000,
  },
  price: {
    min: 0,
    max: 999999999,
  },
  bedrooms: {
    min: 0,
    max: 50,
  },
  bathrooms: {
    min: 0,
    max: 20,
  },
  areaM2: {
    min: 1,
    max: 100000,
  },
} as const;

// ============================================================================
// NOTAS PEDAGÓGICAS
// ============================================================================

/**
 * ¿Cuándo usar 'interface' vs 'type'?
 *
 * En TypeScript, tanto 'interface' como 'type' pueden definir shapes de objetos.
 *
 * Usamos 'interface' para:
 * - Modelos de dominio
 * - DTOs
 * - Objetos que pueden ser extendidos
 *
 * Usamos 'type' para:
 * - Union types
 * - Intersection types
 * - Utility types complejos
 * - Aliases simples
 *
 * Ventajas de interface:
 * ✅ Mejor para objetos
 * ✅ Puede ser extendida
 * ✅ Mensajes de error más claros
 *
 * Ventajas de type:
 * ✅ Más flexible
 * ✅ Puede representar cualquier tipo
 * ✅ Mejor para unions y intersections
 */

/**
 * ¿Qué es 'readonly'?
 *
 * El modificador 'readonly' indica que una propiedad no puede ser
 * reasignada después de la inicialización.
 *
 * Ejemplo:
 * ```typescript
 * interface Property {
 *   readonly id: number;  // ✅ No se puede cambiar
 *   title: string;        // ✅ Se puede cambiar
 * }
 *
 * const prop: Property = { id: 1, title: 'Casa' };
 * prop.title = 'Departamento';  // ✅ OK
 * prop.id = 2;                  // ❌ Error de TypeScript
 * ```
 *
 * En NgRx, esto ayuda a garantizar inmutabilidad.
 */

/**
 * ¿Qué son los Utility Types?
 *
 * TypeScript incluye varios utility types built-in:
 *
 * - Partial<T>: Hace todos los campos opcionales
 * - Required<T>: Hace todos los campos requeridos
 * - Readonly<T>: Hace todos los campos readonly
 * - Pick<T, K>: Selecciona solo ciertos campos
 * - Omit<T, K>: Excluye ciertos campos
 * - Record<K, T>: Crea un objeto con keys K y valores T
 *
 * Estos son extremadamente útiles para evitar duplicación de código.
 */
