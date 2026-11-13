/**
 * Property API Service
 *
 * Servicio que encapsula todas las operaciones HTTP relacionadas con propiedades.
 * Este servicio es la capa de comunicación entre la aplicación y la API REST.
 *
 * RESPONSABILIDADES:
 * 1. Realizar peticiones HTTP a la API
 * 2. Transformar respuestas del servidor a modelos del dominio
 * 3. Manejar errores de red de forma consistente
 * 4. Proporcionar una API limpia para los efectos de NgRx
 *
 * CONCEPTOS RXJS DEMOSTRADOS:
 * - Observable: Tipo de retorno de todas las operaciones
 * - map: Transformación de datos
 * - catchError: Manejo centralizado de errores
 * - tap: Side effects para logging
 * - retry: Reintentos automáticos en caso de error
 *
 * IMPORTANTE:
 * Este servicio NO maneja estado. El estado se gestiona en NgRx.
 * Este servicio solo se ocupa de la comunicación HTTP.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap, retry } from 'rxjs/operators';

import {
  Property,
  PropertyCreateDto,
  PropertyUpdateDto,
  PropertyFilter,
  PaginatedResponse,
  ApiErrorResponse,
} from '../../models';
import { PROPERTY_ENDPOINTS } from '../../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class PropertyApiService {
  /**
   * HttpClient - Cliente HTTP de Angular
   *
   * Se inyecta usando la nueva sintaxis de inject() de Angular 16+
   * que es más simple y compatible con functional programming.
   *
   * Alternativa tradicional:
   * constructor(private http: HttpClient) {}
   */
  private readonly http = inject(HttpClient);

  // ============================================================================
  // OPERACIONES CRUD
  // ============================================================================

  /**
   * GET /api/v1/properties/ - Obtiene lista paginada de propiedades
   *
   * @param filters - Filtros opcionales para búsqueda
   * @param page - Número de página (default: 1)
   * @param pageSize - Elementos por página (default: 10)
   * @returns Observable con respuesta paginada
   *
   * OPERADORES RXJS UTILIZADOS:
   * - tap(): Para logging (side effect)
   * - retry(1): Reintentar una vez si falla
   * - catchError(): Manejo centralizado de errores
   *
   * Ejemplo de uso:
   * ```typescript
   * this.propertyApi.getProperties({ city: 'Guadalajara' }, 1, 10)
   *   .subscribe({
   *     next: (response) => console.log(response.results),
   *     error: (error) => console.error(error)
   *   });
   * ```
   */
  getProperties(
    filters?: PropertyFilter,
    page: number = 1,
    pageSize: number = 10
  ): Observable<PaginatedResponse<Property>> {
    // Construir query parameters
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    // Agregar filtros si existen
    if (filters) {
      if (filters.search) {
        params = params.set('search', filters.search);
      }
      if (filters.city) {
        params = params.set('city', filters.city);
      }
      if (filters.propertyType) {
        params = params.set('property_type', filters.propertyType);
      }
      if (filters.operation) {
        params = params.set('operation', filters.operation);
      }
      if (filters.status) {
        params = params.set('status', filters.status);
      }
      if (filters.minPrice !== undefined) {
        params = params.set('min_price', filters.minPrice.toString());
      }
      if (filters.maxPrice !== undefined) {
        params = params.set('max_price', filters.maxPrice.toString());
      }
      if (filters.sortBy) {
        params = params.set('sort_by', filters.sortBy);
      }
      if (filters.sortOrder) {
        params = params.set('sort_order', filters.sortOrder);
      }
    }

    console.log(`📡 [PropertyAPI] GET ${PROPERTY_ENDPOINTS.list}`, { filters, page, pageSize });

    return this.http.get<PaginatedResponse<Property>>(PROPERTY_ENDPOINTS.list, { params }).pipe(
      /**
       * tap() - Ejecuta side effects sin modificar el stream
       *
       * Útil para:
       * - Logging
       * - Analytics
       * - Debugging
       * - Actualizar UI (con cuidado)
       *
       * NO usar para:
       * - Transformar datos (usar map)
       * - Manejar errores (usar catchError)
       */
      tap((response) => {
        console.log(`✅ [PropertyAPI] Recibidas ${response.results.length} propiedades`);
      }),

      /**
       * map() - Transforma los datos del stream
       *
       * En este caso, convertimos las fechas string a objetos Date.
       * El backend devuelve fechas en formato ISO 8601 string.
       */
      map((response) => ({
        ...response,
        results: response.results.map((property) => this.transformProperty(property)),
      })),

      /**
       * retry(1) - Reintenta la petición una vez si falla
       *
       * Útil para errores temporales de red.
       * CUIDADO: No reintentar operaciones POST/PUT/DELETE
       * ya que podrían ejecutarse múltiples veces.
       */
      retry(1),

      /**
       * catchError() - Maneja errores y permite recuperación
       *
       * Debe devolver un Observable (usar throwError o of).
       * Si no se maneja el error, el stream se completa y no se
       * pueden hacer más subscripciones.
       */
      catchError(this.handleError)
    );
  }

  /**
   * GET /api/v1/properties/{id}/ - Obtiene una propiedad específica
   *
   * @param id - ID de la propiedad
   * @returns Observable con la propiedad
   */
  getPropertyById(id: number): Observable<Property> {
    console.log(`📡 [PropertyAPI] GET ${PROPERTY_ENDPOINTS.detail(id)}`);

    return this.http.get<Property>(PROPERTY_ENDPOINTS.detail(id)).pipe(
      tap((property) => {
        console.log(`✅ [PropertyAPI] Propiedad obtenida: ${property.title}`);
      }),
      map((property) => this.transformProperty(property)),
      catchError(this.handleError)
    );
  }

  /**
   * POST /api/v1/properties/ - Crea una nueva propiedad
   *
   * @param propertyData - Datos de la propiedad a crear
   * @returns Observable con la propiedad creada
   *
   * NOTA: NO se usa retry() aquí porque no queremos
   * crear la misma propiedad múltiples veces si falla.
   */
  createProperty(propertyData: PropertyCreateDto): Observable<Property> {
    console.log(`📡 [PropertyAPI] POST ${PROPERTY_ENDPOINTS.create}`, propertyData);

    return this.http.post<Property>(PROPERTY_ENDPOINTS.create, propertyData).pipe(
      tap((property) => {
        console.log(`✅ [PropertyAPI] Propiedad creada #${property.id}: ${property.title}`);
      }),
      map((property) => this.transformProperty(property)),
      catchError(this.handleError)
    );
  }

  /**
   * PUT /api/v1/properties/{id}/ - Actualiza una propiedad completa
   *
   * @param id - ID de la propiedad
   * @param propertyData - Datos completos de la propiedad
   * @returns Observable con la propiedad actualizada
   */
  updateProperty(id: number, propertyData: PropertyUpdateDto): Observable<Property> {
    console.log(`📡 [PropertyAPI] PUT ${PROPERTY_ENDPOINTS.update(id)}`, propertyData);

    return this.http.put<Property>(PROPERTY_ENDPOINTS.update(id), propertyData).pipe(
      tap((property) => {
        console.log(`✅ [PropertyAPI] Propiedad actualizada #${property.id}`);
      }),
      map((property) => this.transformProperty(property)),
      catchError(this.handleError)
    );
  }

  /**
   * PATCH /api/v1/properties/{id}/ - Actualiza parcialmente una propiedad
   *
   * @param id - ID de la propiedad
   * @param updates - Campos a actualizar
   * @returns Observable con la propiedad actualizada
   */
  patchProperty(id: number, updates: Partial<PropertyUpdateDto>): Observable<Property> {
    console.log(`📡 [PropertyAPI] PATCH ${PROPERTY_ENDPOINTS.patch(id)}`, updates);

    return this.http.patch<Property>(PROPERTY_ENDPOINTS.patch(id), updates).pipe(
      tap((property) => {
        console.log(`✅ [PropertyAPI] Propiedad parcheada #${property.id}`);
      }),
      map((property) => this.transformProperty(property)),
      catchError(this.handleError)
    );
  }

  /**
   * DELETE /api/v1/properties/{id}/ - Elimina una propiedad
   *
   * @param id - ID de la propiedad
   * @returns Observable que completa cuando se elimina
   *
   * NOTA: DELETE típicamente devuelve 204 No Content (sin body).
   * El Observable completa exitosamente sin emitir valores.
   */
  deleteProperty(id: number): Observable<void> {
    console.log(`📡 [PropertyAPI] DELETE ${PROPERTY_ENDPOINTS.delete(id)}`);

    return this.http.delete<void>(PROPERTY_ENDPOINTS.delete(id)).pipe(
      tap(() => {
        console.log(`✅ [PropertyAPI] Propiedad eliminada #${id}`);
      }),
      catchError(this.handleError)
    );
  }

  // ============================================================================
  // HELPERS PRIVADOS
  // ============================================================================

  /**
   * Transforma una propiedad del formato de API al modelo de dominio
   *
   * PROBLEMA: El backend devuelve fechas como strings ISO 8601.
   * SOLUCIÓN: Convertirlas a objetos Date para usar en la aplicación.
   *
   * Ejemplo:
   * API: { created_at: "2026-11-12T10:30:00Z" }
   * App: { createdAt: Date object }
   *
   * @param property - Propiedad del API
   * @returns Propiedad con fechas como Date objects
   */
  private transformProperty(property: any): Property {
    return {
      ...property,
      createdAt: new Date(property.createdAt),
      updatedAt: new Date(property.updatedAt),
    };
  }

  /**
   * Maneja errores HTTP de forma centralizada
   *
   * ESTRATEGIA:
   * 1. Loggear el error para debugging
   * 2. Transformar HttpErrorResponse a ApiErrorResponse
   * 3. Re-lanzar el error para que lo maneje el componente/efecto
   *
   * IMPORTANTE:
   * catchError DEBE devolver un Observable. Usamos throwError()
   * para re-lanzar el error en el stream.
   *
   * @param error - Error de HTTP
   * @returns Observable que emite error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('❌ [PropertyAPI] Error HTTP:', error);

    let errorMessage: string;
    let apiError: ApiErrorResponse;

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente (red, etc.)
      errorMessage = `Error de red: ${error.error.message}`;
      apiError = {
        detail: errorMessage,
      };
    } else {
      // Error del lado del servidor
      errorMessage = `Error ${error.status}: ${error.statusText}`;

      // Si el backend devolvió un ApiErrorResponse, usarlo
      if (error.error && typeof error.error === 'object') {
        apiError = error.error as ApiErrorResponse;
      } else {
        apiError = {
          detail: errorMessage,
        };
      }
    }

    /**
     * throwError() - Crea un Observable que inmediatamente emite error
     *
     * IMPORTANTE: En RxJS 7+, se usa una función factory:
     * throwError(() => error)
     *
     * Esto es para lazy evaluation y mejora el performance.
     */
    return throwError(() => apiError);
  }
}

// ============================================================================
// NOTAS PEDAGÓGICAS
// ============================================================================

/**
 * ¿Por qué usar servicios en lugar de llamar HttpClient directamente?
 *
 * Mal (desde un componente):
 * ```typescript
 * this.http.get<Property[]>('/api/v1/properties/')
 *   .pipe(...)
 *   .subscribe(...);
 * ```
 *
 * Problemas:
 * ❌ URLs hardcodeadas en múltiples lugares
 * ❌ Lógica de transformación repetida
 * ❌ Manejo de errores inconsistente
 * ❌ Difícil de testear
 * ❌ Difícil de mockear
 *
 * Bien (usando servicio):
 * ```typescript
 * this.propertyApi.getProperties()
 *   .subscribe(...);
 * ```
 *
 * Ventajas:
 * ✅ Single source of truth para URLs
 * ✅ Lógica centralizada
 * ✅ Fácil de testear (mock del servicio)
 * ✅ Tipado fuerte
 * ✅ Reutilizable
 */

/**
 * ¿Cuándo usar cada operador RxJS?
 *
 * map() - Transformar datos
 * ├─ Convertir formatos
 * ├─ Extraer campos
 * └─ Calcular valores derivados
 *
 * tap() - Side effects sin modificar stream
 * ├─ Logging
 * ├─ Analytics
 * └─ Debugging
 *
 * catchError() - Manejar errores
 * ├─ Transformar errores
 * ├─ Logging de errores
 * └─ Valores por defecto (usando of())
 *
 * retry() - Reintentar en caso de error
 * ├─ Errores de red temporales
 * ├─ Timeouts
 * └─ CUIDADO con POST/PUT/DELETE
 *
 * finalize() - Ejecutar al finalizar (success o error)
 * ├─ Limpiar recursos
 * ├─ Ocultar loading spinners
 * └─ Liberar conexiones
 */

/**
 * ¿Por qué transformar fechas?
 *
 * JSON no tiene tipo Date nativo. Las fechas se serializan como strings.
 *
 * Backend devuelve:
 * ```json
 * { "created_at": "2026-11-12T10:30:00Z" }
 * ```
 *
 * HttpClient parsea como:
 * ```typescript
 * { created_at: "2026-11-12T10:30:00Z" } // string
 * ```
 *
 * Necesitamos:
 * ```typescript
 * { createdAt: Date } // Date object
 * ```
 *
 * Beneficios:
 * ✅ Usar métodos de Date (getTime(), toLocaleDateString(), etc.)
 * ✅ Comparar fechas fácilmente
 * ✅ Formatear con pipes de Angular
 * ✅ Type safety
 */

/**
 * ¿Qué hace HttpParams?
 *
 * HttpParams es una API inmutable para construir query strings.
 *
 * Ejemplo:
 * ```typescript
 * let params = new HttpParams()
 *   .set('page', '1')
 *   .set('page_size', '10')
 *   .set('city', 'Guadalajara');
 * ```
 *
 * Genera: ?page=1&page_size=10&city=Guadalajara
 *
 * Inmutabilidad:
 * Cada .set() devuelve una NUEVA instancia:
 * ```typescript
 * // ❌ Mal (no funciona):
 * const params = new HttpParams();
 * params.set('page', '1');  // Se pierde
 * params.set('city', 'GDL'); // Se pierde
 *
 * // ✅ Bien (encadenar o reasignar):
 * let params = new HttpParams();
 * params = params.set('page', '1');
 * params = params.set('city', 'GDL');
 *
 * // ✅ Mejor (encadenar):
 * const params = new HttpParams()
 *   .set('page', '1')
 *   .set('city', 'GDL');
 * ```
 */
