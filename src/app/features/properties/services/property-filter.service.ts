/**
 * PropertyFilterService
 *
 * Servicio helper que centraliza la lógica de filtros:
 * - Aplicar debounce a la búsqueda de texto
 * - Construir el objeto PropertyFilter desde cambios individuales
 * - Resetear filtros
 * - Normalizar valores (strings vacías → undefined)
 *
 * PATRÓN: Service encapsulando lógica reutilizable
 *
 * Sin este servicio, el contenedor tendría toda esta lógica mezclada.
 * Al extraerla, el contenedor queda más limpio y la lógica es testeable.
 *
 * CONCEPTO RXJS: debounceTime
 *
 * debounceTime(ms) espera `ms` milisegundos sin nuevas emisiones
 * antes de dejar pasar el último valor.
 *
 *   Usuario escribe: "c" "a" "s" "a"
 *   Sin debounce:    →→→→  (4 emisiones inmediatas)
 *   debounce(300):   ──────→  (1 emisión 300ms después de la última tecla)
 *
 * Esto reduce drásticamente las peticiones HTTP al escribir.
 */

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PropertyFilter } from '../../../core/models';

/**
 * Configuración de debounce.
 * 300ms es un buen balance entre respuesta y rendimiento.
 * - Muy poco (100ms): Siente inmediato pero hace demasiadas peticiones
 * - Mucho (500ms): Se siente lento
 * - 300ms: Óptimo para la mayoría de casos
 */
const SEARCH_DEBOUNCE_MS = 300;

@Injectable({ providedIn: 'root' })
export class PropertyFilterService {
  /**
   * Subject interno para la búsqueda de texto.
   *
   * El componente emite strings aquí a medida que el usuario escribe.
   * El Observable público (searchDebounced$) aplica debounce y solo
   * emite cuando el usuario deja de escribir por 300ms.
   */
  private readonly searchSubject = new Subject<string>();

  /**
   * Observable PÚBLICO con debounce aplicado.
   *
   * Pipeline:
   * 1. debounceTime(300): Espera 300ms sin nuevas emisiones
   * 2. distinctUntilChanged(): Solo emite si el valor cambió
   *    (evita emitir "casa" dos veces si el usuario no borró y reescribió igual)
   *
   * El contenedor se suscribe a este observable y actualiza el store
   * cada vez que emite un nuevo valor de búsqueda.
   */
  readonly searchDebounced$ = this.searchSubject.pipe(
    debounceTime(SEARCH_DEBOUNCE_MS),
    distinctUntilChanged()
  );

  /**
   * Emite un nuevo término de búsqueda al stream.
   *
   * El contenedor llama este método cuando el usuario escribe en el input.
   * El valor no sale inmediatamente: queda en el Subject hasta que
   * pasen 300ms sin nuevas emisiones.
   */
  pushSearch(value: string): void {
    this.searchSubject.next(value);
  }

  /**
   * Actualiza un filtro existente con un nuevo valor.
   *
   * Esta función crea un NUEVO objeto de filtros (inmutable)
   * en lugar de modificar el existente. Esto es crítico para NgRx:
   * si mutamos el objeto, el selector no detecta el cambio.
   *
   * Normalización:
   * - Strings vacías → undefined (no se envían a la API)
   * - null → undefined (consistencia)
   * - Números NaN → undefined
   *
   * Ejemplo:
   * ```typescript
   * updateFilter({ search: 'casa' }, 'propertyType', 'house')
   * // Retorna: { search: 'casa', propertyType: 'house' }
   *
   * updateFilter({ search: 'casa' }, 'city', '')
   * // Retorna: { search: 'casa', city: undefined }  ← string vacío normalizado
   * ```
   */
  updateFilter(
    currentFilters: PropertyFilter,
    key: keyof PropertyFilter,
    value: string | number | undefined
  ): PropertyFilter {
    // Normalizar el valor
    const normalizedValue = this.normalizeValue(value);

    // Crear nuevo objeto inmutable
    return {
      ...currentFilters,
      [key]: normalizedValue,
    };
  }

  /**
   * Actualiza múltiples filtros a la vez.
   *
   * Útil cuando se aplican varios cambios simultáneamente,
   * como al cargar filtros desde la URL.
   */
  updateFilters(
    currentFilters: PropertyFilter,
    updates: Partial<PropertyFilter>
  ): PropertyFilter {
    const normalized = { ...updates };

    // Normalizar cada valor
    for (const key of Object.keys(normalized) as (keyof PropertyFilter)[]) {
      normalized[key] = this.normalizeValue(normalized[key]) as any;
    }

    return { ...currentFilters, ...normalized };
  }

  /**
   * Resetea todos los filtros al estado vacío.
   *
   * Retorna un objeto con todas las propiedades en undefined.
   * Esto hace que la API devuelva todas las propiedades sin filtros.
   */
  resetFilters(): PropertyFilter {
    return {};
  }

  /**
   * Normaliza un valor de filtro.
   *
   * Reglas:
   * - '' (string vacío) → undefined (no enviar a la API)
   * - null → undefined (consistencia de tipos)
   * - NaN → undefined (Inputs numéricos pueden emitir NaN)
   * - 0 → 0 (el cero es válido para minPrice)
   * - Otros valores se mantienen
   */
  private normalizeValue(value: string | number | undefined): string | number | undefined {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'string' && value.trim() === '') return undefined;
    if (typeof value === 'number' && isNaN(value)) return undefined;
    return value;
  }

  /**
   * Cuenta cuántos filtros están activos (tienen un valor no vacío).
   *
   * Excluye sortBy y sortOrder del conteo porque son configuración,
   * no filtros de búsqueda que el usuario activa explícitamente.
   */
  countActiveFilters(filters: PropertyFilter): number {
    const excludedKeys: (keyof PropertyFilter)[] = ['sortBy', 'sortOrder'];
    return Object.keys(filters)
      .filter((key) => !excludedKeys.includes(key as keyof PropertyFilter))
      .filter((key) => {
        const value = filters[key as keyof PropertyFilter];
        return value !== undefined && value !== null && value !== '';
      }).length;
  }

  /**
   * Verifica si hay algún filtro activo.
   */
  hasActiveFilters(filters: PropertyFilter): boolean {
    return this.countActiveFilters(filters) > 0;
  }
}
