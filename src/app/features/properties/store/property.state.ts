/**
 * Property State
 *
 * Define la estructura del estado para el feature de propiedades.
 * Este es el "shape" de los datos que NgRx Store mantendrá en memoria.
 *
 * CONCEPTOS IMPORTANTES:
 *
 * 1. State Shape:
 *    El estado debe ser una estructura plana y serializable.
 *    No debe contener funciones, clases, o referencias circulares.
 *
 * 2. Inmutabilidad:
 *    El estado NUNCA se modifica directamente.
 *    Los reducers crean NUEVAS versiones del estado.
 *
 * 3. Normalización:
 *    Para listas grandes, considera normalizar (entities pattern).
 *    Aquí usamos un array simple por simplicidad didáctica.
 *
 * 4. Loading States:
 *    Manejamos múltiples estados de carga para diferentes operaciones.
 *    Esto permite mostrar spinners específicos en la UI.
 */

import { Property, PropertyFilter } from '../../../core/models';

/**
 * Interface del estado de propiedades
 *
 * Contiene todo lo necesario para representar el estado actual
 * del módulo de propiedades en la aplicación.
 */
export interface PropertyState {
  // ============================================================================
  // DATOS
  // ============================================================================

  /**
   * Lista de propiedades cargadas
   *
   * Este array contiene las propiedades de la página actual.
   * No almacenamos TODAS las propiedades, solo las visibles.
   */
  properties: Property[];

  /**
   * Propiedad seleccionada actualmente
   *
   * Útil para vistas de detalle o edición.
   * null indica que no hay propiedad seleccionada.
   */
  selectedProperty: Property | null;

  // ============================================================================
  // PAGINACIÓN
  // ============================================================================

  /**
   * Página actual (1-indexed)
   */
  currentPage: number;

  /**
   * Elementos por página
   */
  pageSize: number;

  /**
   * Total de elementos en el servidor
   *
   * Necesario para calcular el número total de páginas.
   */
  totalCount: number;

  // ============================================================================
  // FILTROS
  // ============================================================================

  /**
   * Filtros activos
   *
   * Se aplican cuando se cargan las propiedades.
   * Un objeto vacío {} significa sin filtros.
   */
  filters: PropertyFilter;

  // ============================================================================
  // ESTADOS DE CARGA
  // ============================================================================

  /**
   * Indica si se está cargando la lista de propiedades
   *
   * true: Mostrar spinner en la lista
   * false: Ocultar spinner
   */
  loading: boolean;

  /**
   * Indica si se está creando una propiedad
   *
   * Útil para deshabilitar el botón "Guardar" durante la creación.
   */
  creating: boolean;

  /**
   * Indica si se está actualizando una propiedad
   */
  updating: boolean;

  /**
   * Indica si se está eliminando una propiedad
   */
  deleting: boolean;

  // ============================================================================
  // ERRORES
  // ============================================================================

  /**
   * Mensaje de error general
   *
   * null: No hay error
   * string: Mensaje de error a mostrar al usuario
   */
  error: string | null;

  /**
   * Errores de validación por campo
   *
   * null: No hay errores de validación
   * Record: Objeto con errores por campo
   *
   * Ejemplo:
   * {
   *   "title": ["El título es requerido"],
   *   "price": ["El precio debe ser mayor a 0"]
   * }
   */
  validationErrors: Record<string, string[]> | null;
}

/**
 * Estado inicial del feature de propiedades
 *
 * Este es el estado cuando la aplicación arranca o cuando
 * se resetea el estado del módulo.
 *
 * IMPORTANTE:
 * - Todos los arrays vacíos: []
 * - Todos los nullable: null
 * - Todos los boolean: false
 * - Valores numéricos con defaults sensatos
 */
export const initialPropertyState: PropertyState = {
  // Datos
  properties: [],
  selectedProperty: null,

  // Paginación
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,

  // Filtros
  filters: {},

  // Loading states
  loading: false,
  creating: false,
  updating: false,
  deleting: false,

  // Errores
  error: null,
  validationErrors: null,
};

// ============================================================================
// NOTAS PEDAGÓGICAS
// ============================================================================

/**
 * ¿Por qué separar loading, creating, updating, deleting?
 *
 * Alternativa simple (NO recomendada):
 * ```typescript
 * interface State {
 *   loading: boolean;
 * }
 * ```
 *
 * Problema:
 * - No puedes saber QUÉ operación está en progreso
 * - No puedes mostrar spinners específicos
 * - No puedes deshabilitar botones específicos
 *
 * Solución (lo que hacemos):
 * ```typescript
 * interface State {
 *   loading: boolean;    // Lista
 *   creating: boolean;   // Botón "Crear"
 *   updating: boolean;   // Botón "Actualizar"
 *   deleting: boolean;   // Botón "Eliminar"
 * }
 * ```
 *
 * Ventajas:
 * ✅ UI más granular
 * ✅ Mejor UX (spinners específicos)
 * ✅ Prevenir doble-click en botones específicos
 */

/**
 * ¿Por qué separar error y validationErrors?
 *
 * error:
 * - Errores generales del sistema
 * - Errores de red
 * - Errores 500 del servidor
 * - Se muestra como mensaje global
 *
 * validationErrors:
 * - Errores de validación de formularios
 * - Errores 400 del servidor
 * - Se muestran junto a cada campo
 * - Estructura: { campo: [mensajes] }
 *
 * Esto permite manejar ambos tipos de error apropiadamente en la UI.
 */

/**
 * ¿Por qué almacenar filtros en el estado?
 *
 * Beneficios:
 * 1. Persistencia: Los filtros sobreviven a navegación
 * 2. Compartir: Múltiples componentes ven los mismos filtros
 * 3. History: Podemos implementar "volver a búsqueda anterior"
 * 4. Deep linking: Podemos sincronizar con URL query params
 *
 * Ejemplo de flujo:
 * 1. Usuario aplica filtros → se guardan en store
 * 2. Usuario navega a detalle de propiedad
 * 3. Usuario vuelve atrás
 * 4. Los filtros siguen aplicados (no se perdieron)
 */

/**
 * ¿Qué es la normalización de estado?
 *
 * Para listas muy grandes (miles de elementos), es mejor normalizar:
 *
 * Sin normalizar (lo que usamos):
 * ```typescript
 * properties: Property[]  // [{ id: 1, ... }, { id: 2, ... }]
 * ```
 *
 * Normalizado (para apps grandes):
 * ```typescript
 * entities: { [id: number]: Property }  // { 1: {...}, 2: {...} }
 * ids: number[]                          // [1, 2, 3, ...]
 * ```
 *
 * Ventajas de normalización:
 * ✅ Búsqueda O(1) por ID
 * ✅ No hay duplicados
 * ✅ Fácil actualizar una entidad
 *
 * Desventajas:
 * ⚠️ Más complejo
 * ⚠️ Requiere @ngrx/entity
 *
 * Para este proyecto didáctico, usamos array simple por claridad.
 */

/**
 * Pattern: Estado plano vs anidado
 *
 * ❌ Mal (estado profundamente anidado):
 * ```typescript
 * interface State {
 *   data: {
 *     list: {
 *       items: Property[],
 *       meta: {
 *         pagination: {
 *           current: number,
 *           size: number
 *         }
 *       }
 *     }
 *   }
 * }
 * ```
 *
 * Problemas:
 * - Difícil de actualizar inmutablemente
 * - Selectores complejos
 * - Muchos niveles de spread operator
 *
 * ✅ Bien (estado plano):
 * ```typescript
 * interface State {
 *   properties: Property[],
 *   currentPage: number,
 *   pageSize: number
 * }
 * ```
 *
 * Ventajas:
 * - Fácil de actualizar
 * - Selectores simples
 * - Menos errores
 */
