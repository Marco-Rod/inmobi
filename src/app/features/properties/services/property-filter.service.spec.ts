/**
 * Tests del PropertyFilterService
 *
 * Este servicio es más interesante de testear porque tiene:
 * 1. Lógica de normalización de valores
 * 2. Inmutabilidad en updateFilter
 * 3. Un Observable con debounce (requiere test asíncrono)
 *
 * TESTEAR OBSERVABLES CON VITEST:
 *
 * Para testear debounceTime, necesitamos control del tiempo.
 * Vitest usa vi.useFakeTimers() para simular el paso del tiempo
 * sin esperar realmente los 300ms.
 *
 * ```typescript
 * vi.useFakeTimers();
 * service.pushSearch('casa');
 * vi.advanceTimersByTime(300); // Simula 300ms instantáneamente
 * // Ahora el observable debe haber emitido
 * ```
 *
 * Alternativa con RxJS TestScheduler (más potente pero más complejo):
 * ```typescript
 * const scheduler = new TestScheduler(...);
 * scheduler.run(({ cold, expectObservable }) => { ... });
 * ```
 */

import { PropertyFilterService } from './property-filter.service';
import { PropertyFilter } from '../../../core/models';

// ============================================================================
// TESTS
// ============================================================================

describe('PropertyFilterService', () => {
  let service: PropertyFilterService;

  /**
   * beforeEach: Se ejecuta antes de cada test.
   * Crea una nueva instancia del servicio para cada test,
   * evitando que el estado de un test afecte a otro.
   *
   * Nota: Instanciamos directamente (new PropertyFilterService())
   * porque el servicio no tiene dependencias de Angular.
   * Para servicios con inject(), necesitaríamos TestBed.
   */
  beforeEach(() => {
    service = new PropertyFilterService();
  });

  // ============================================================================
  // updateFilter
  // ============================================================================

  describe('updateFilter', () => {
    it('debe agregar un filtro nuevo manteniendo los existentes', () => {
      // Arrange
      const filtrosActuales: PropertyFilter = { city: 'Guadalajara' };

      // Act
      const resultado = service.updateFilter(filtrosActuales, 'propertyType', 'house');

      // Assert
      expect(resultado.city).toBe('Guadalajara');
      expect(resultado.propertyType).toBe('house');
    });

    it('debe sobrescribir un filtro existente', () => {
      const filtros: PropertyFilter = { city: 'Guadalajara' };

      const resultado = service.updateFilter(filtros, 'city', 'CDMX');

      expect(resultado.city).toBe('CDMX');
    });

    it('debe crear un NUEVO objeto (inmutabilidad)', () => {
      const filtrosOriginales: PropertyFilter = { city: 'Guadalajara' };

      const resultado = service.updateFilter(filtrosOriginales, 'propertyType', 'house');

      // La referencia debe ser diferente
      expect(resultado).not.toBe(filtrosOriginales);
      // El original no debe haberse modificado
      expect(filtrosOriginales.propertyType).toBeUndefined();
    });

    it('debe normalizar string vacío a undefined', () => {
      const filtros: PropertyFilter = { city: 'Guadalajara' };

      const resultado = service.updateFilter(filtros, 'city', '');

      // String vacío → undefined (no se envía a la API)
      expect(resultado.city).toBeUndefined();
    });

    it('debe normalizar null a undefined', () => {
      const filtros: PropertyFilter = {};
      const resultado = service.updateFilter(filtros, 'city', undefined);
      expect(resultado.city).toBeUndefined();
    });

    it('debe normalizar NaN a undefined', () => {
      const filtros: PropertyFilter = {};
      const resultado = service.updateFilter(filtros, 'minPrice', NaN);
      expect(resultado.minPrice).toBeUndefined();
    });

    it('debe mantener el valor 0 (precio mínimo válido)', () => {
      const filtros: PropertyFilter = {};
      const resultado = service.updateFilter(filtros, 'minPrice', 0);
      // 0 es un valor válido para minPrice
      expect(resultado.minPrice).toBe(0);
    });
  });

  // ============================================================================
  // resetFilters
  // ============================================================================

  describe('resetFilters', () => {
    it('debe retornar un objeto vacío', () => {
      const resultado = service.resetFilters();
      expect(resultado).toEqual({});
    });

    it('debe retornar un nuevo objeto en cada llamada', () => {
      const r1 = service.resetFilters();
      const r2 = service.resetFilters();
      // Misma forma pero diferentes referencias
      expect(r1).not.toBe(r2);
      expect(r1).toEqual(r2);
    });
  });

  // ============================================================================
  // countActiveFilters
  // ============================================================================

  describe('countActiveFilters', () => {
    it('debe retornar 0 cuando no hay filtros', () => {
      expect(service.countActiveFilters({})).toBe(0);
    });

    it('debe contar filtros con valores definidos', () => {
      const filtros: PropertyFilter = {
        city: 'Guadalajara',
        propertyType: 'house',
        status: 'available',
      };
      expect(service.countActiveFilters(filtros)).toBe(3);
    });

    it('no debe contar sortBy ni sortOrder', () => {
      // sortBy y sortOrder son configuración, no filtros visibles al usuario
      const filtros: PropertyFilter = {
        sortBy: 'price',
        sortOrder: 'asc',
      };
      expect(service.countActiveFilters(filtros)).toBe(0);
    });

    it('no debe contar filtros con valor undefined', () => {
      const filtros: PropertyFilter = {
        city: 'Guadalajara',
        propertyType: undefined,
        status: undefined,
      };
      expect(service.countActiveFilters(filtros)).toBe(1);
    });

    it('no debe contar filtros con string vacío', () => {
      const filtros: PropertyFilter = {
        city: '',
        search: '',
      };
      expect(service.countActiveFilters(filtros)).toBe(0);
    });
  });

  // ============================================================================
  // hasActiveFilters
  // ============================================================================

  describe('hasActiveFilters', () => {
    it('debe retornar false cuando no hay filtros activos', () => {
      expect(service.hasActiveFilters({})).toBe(false);
    });

    it('debe retornar true cuando hay al menos un filtro activo', () => {
      expect(service.hasActiveFilters({ city: 'Guadalajara' })).toBe(true);
    });
  });

  // ============================================================================
  // searchDebounced$ (debounce)
  // ============================================================================

  describe('searchDebounced$ con debounce', () => {
    beforeEach(() => {
      /**
       * Activamos fake timers para controlar el tiempo en los tests.
       * Esto nos permite simular el paso de 300ms sin esperar realmente.
       *
       * Vitest usará timers falsos: setTimeout, setInterval, Date, etc.
       */
      vi.useFakeTimers();
    });

    afterEach(() => {
      /**
       * Restauramos los timers reales después de cada test.
       * Importante para evitar efectos secundarios entre tests.
       */
      vi.useRealTimers();
    });

    it('debe emitir después de 300ms sin nuevas emisiones', () => {
      // Arrange
      const emittedValues: string[] = [];
      service.searchDebounced$.subscribe((val) => emittedValues.push(val));

      // Act: Enviamos un término de búsqueda
      service.pushSearch('casa');

      // Assert: Antes de 300ms, no debe haber emitido
      expect(emittedValues).toHaveLength(0);

      // Avanzamos el tiempo 300ms
      vi.advanceTimersByTime(300);

      // Assert: Ahora sí debe haber emitido
      expect(emittedValues).toHaveLength(1);
      expect(emittedValues[0]).toBe('casa');
    });

    it('debe emitir solo la última emisión cuando se escriben varias rápidas', () => {
      /**
       * Este test demuestra el comportamiento clave del debounce:
       * si el usuario escribe "c", "ca", "cas", "casa" en menos de 300ms,
       * solo debe llegar al servidor "casa" (la última).
       */
      const emittedValues: string[] = [];
      service.searchDebounced$.subscribe((val) => emittedValues.push(val));

      // Simulamos escritura rápida
      service.pushSearch('c');
      vi.advanceTimersByTime(100); // 100ms < 300ms, no emite aún

      service.pushSearch('ca');
      vi.advanceTimersByTime(100); // 200ms desde "ca", no emite

      service.pushSearch('cas');
      vi.advanceTimersByTime(100); // 300ms desde "cas" pero reset el timer

      service.pushSearch('casa');
      vi.advanceTimersByTime(300); // 300ms desde "casa", emite

      // Solo debe haberse emitido UNA vez con el valor final
      expect(emittedValues).toHaveLength(1);
      expect(emittedValues[0]).toBe('casa');
    });

    it('no debe emitir valores duplicados consecutivos (distinctUntilChanged)', () => {
      /**
       * distinctUntilChanged evita emitir si el valor no cambió.
       * Ejemplo: El usuario escribe "casa", borra y escribe "casa" de nuevo.
       * Solo debe emitir "casa" una vez.
       */
      const emittedValues: string[] = [];
      service.searchDebounced$.subscribe((val) => emittedValues.push(val));

      service.pushSearch('casa');
      vi.advanceTimersByTime(300);

      service.pushSearch('casa'); // Mismo valor
      vi.advanceTimersByTime(300);

      // Solo debe haber emitido una vez (distinctUntilChanged filtra el duplicado)
      expect(emittedValues).toHaveLength(1);
    });

    it('sí debe emitir si el valor es diferente', () => {
      const emittedValues: string[] = [];
      service.searchDebounced$.subscribe((val) => emittedValues.push(val));

      service.pushSearch('casa');
      vi.advanceTimersByTime(300);

      service.pushSearch('departamento'); // Valor diferente
      vi.advanceTimersByTime(300);

      expect(emittedValues).toHaveLength(2);
      expect(emittedValues[1]).toBe('departamento');
    });
  });
});
