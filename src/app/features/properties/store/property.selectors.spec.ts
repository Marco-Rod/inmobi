/**
 * Tests de los Selectores de Propiedades
 *
 * Los selectores son funciones puras que extraen y transforman datos del estado.
 * Son igualmente fáciles de testear: dado un estado, deben retornar valores predecibles.
 *
 * CONCEPTOS IMPORTANTES:
 *
 * 1. Memoización:
 *    createSelector memoiza el resultado. Si los inputs no cambian,
 *    retorna el mismo objeto (misma referencia). Esto permite:
 *    - Performance: No recalcula innecesariamente
 *    - OnPush: Angular solo redibuja cuando la referencia cambia
 *
 * 2. Selectores derivados:
 *    Los selectores compuestos dependen de otros selectores.
 *    Si un selector base cambia, todos los que dependen de él se recalculan.
 *
 * 3. Testear selectores:
 *    - Crear un estado fake con la forma de PropertyState
 *    - Llamar al selector con ese estado
 *    - Verificar el resultado
 */

import {
  selectAllProperties,
  selectLoading,
  selectError,
  selectTotalPages,
  selectPaginationInfo,
  selectHasActiveFilters,
  selectActiveFilterCount,
  selectPropertyListViewModel,
  selectPropertyById,
  selectAnyLoading,
} from './property.selectors';
import { PropertyState, initialPropertyState } from './property.state';
import { Property } from '../../../core/models';

// ============================================================================
// HELPERS
// ============================================================================

function createTestProperty(overrides: Partial<Property> = {}): Property {
  return {
    id: 1,
    title: 'Casa test',
    description: 'Descripción',
    propertyType: 'house',
    operation: 'sale',
    price: 1_000_000,
    currency: 'MXN',
    city: 'Guadalajara',
    state: 'Jalisco',
    status: 'available',
    bedrooms: 3,
    bathrooms: 2,
    areaM2: 120,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Crea el AppState mínimo necesario para los selectores.
 * Los selectores usan createFeatureSelector('properties') que espera
 * un objeto con la clave 'properties'.
 */
function createAppState(propertyState: Partial<PropertyState> = {}): any {
  return {
    properties: {
      ...initialPropertyState,
      ...propertyState,
    },
  };
}

// ============================================================================
// TESTS DE SELECTORES BÁSICOS
// ============================================================================

describe('Property Selectors', () => {

  describe('selectAllProperties', () => {
    it('debe retornar el array de propiedades del estado', () => {
      const propiedades = [
        createTestProperty({ id: 1 }),
        createTestProperty({ id: 2 }),
      ];
      const state = createAppState({ properties: propiedades });

      const resultado = selectAllProperties(state);

      expect(resultado).toEqual(propiedades);
      expect(resultado).toHaveLength(2);
    });

    it('debe retornar array vacío cuando no hay propiedades', () => {
      const state = createAppState({ properties: [] });
      expect(selectAllProperties(state)).toEqual([]);
    });
  });

  describe('selectLoading', () => {
    it('debe retornar true cuando loading es true', () => {
      const state = createAppState({ loading: true });
      expect(selectLoading(state)).toBe(true);
    });

    it('debe retornar false cuando loading es false', () => {
      const state = createAppState({ loading: false });
      expect(selectLoading(state)).toBe(false);
    });
  });

  describe('selectError', () => {
    it('debe retornar el mensaje de error', () => {
      const state = createAppState({ error: 'Error de prueba' });
      expect(selectError(state)).toBe('Error de prueba');
    });

    it('debe retornar null cuando no hay error', () => {
      const state = createAppState({ error: null });
      expect(selectError(state)).toBeNull();
    });
  });

  // ============================================================================
  // TESTS DE SELECTORES DERIVADOS
  // ============================================================================

  describe('selectTotalPages', () => {
    it('debe calcular correctamente el número de páginas', () => {
      const state = createAppState({ totalCount: 95, pageSize: 10 });
      // 95 / 10 = 9.5 → ceil = 10 páginas
      expect(selectTotalPages(state)).toBe(10);
    });

    it('debe retornar 0 cuando no hay elementos', () => {
      const state = createAppState({ totalCount: 0, pageSize: 10 });
      expect(selectTotalPages(state)).toBe(0);
    });

    it('debe manejar 100 elementos con pageSize 10', () => {
      const state = createAppState({ totalCount: 100, pageSize: 10 });
      expect(selectTotalPages(state)).toBe(10);
    });

    it('debe manejar 1 elemento con pageSize 10', () => {
      const state = createAppState({ totalCount: 1, pageSize: 10 });
      expect(selectTotalPages(state)).toBe(1);
    });

    it('debe retornar 0 cuando pageSize es 0 (evitar división por cero)', () => {
      const state = createAppState({ totalCount: 50, pageSize: 0 });
      expect(selectTotalPages(state)).toBe(0);
    });
  });

  describe('selectAnyLoading', () => {
    it('debe retornar true si loading es true', () => {
      const state = createAppState({ loading: true });
      expect(selectAnyLoading(state)).toBe(true);
    });

    it('debe retornar true si creating es true', () => {
      const state = createAppState({ creating: true });
      expect(selectAnyLoading(state)).toBe(true);
    });

    it('debe retornar true si updating es true', () => {
      const state = createAppState({ updating: true });
      expect(selectAnyLoading(state)).toBe(true);
    });

    it('debe retornar true si deleting es true', () => {
      const state = createAppState({ deleting: true });
      expect(selectAnyLoading(state)).toBe(true);
    });

    it('debe retornar false si ninguno está activo', () => {
      const state = createAppState({
        loading: false,
        creating: false,
        updating: false,
        deleting: false,
      });
      expect(selectAnyLoading(state)).toBe(false);
    });
  });

  // ============================================================================
  // FILTROS
  // ============================================================================

  describe('selectHasActiveFilters', () => {
    it('debe retornar false cuando filters está vacío', () => {
      const state = createAppState({ filters: {} });
      expect(selectHasActiveFilters(state)).toBe(false);
    });

    it('debe retornar true cuando hay al menos un filtro', () => {
      const state = createAppState({ filters: { city: 'Guadalajara' } });
      expect(selectHasActiveFilters(state)).toBe(true);
    });

    it('debe retornar true con múltiples filtros', () => {
      const state = createAppState({
        filters: {
          city: 'Guadalajara',
          propertyType: 'house' as const,
          status: 'available' as const,
        },
      });
      expect(selectHasActiveFilters(state)).toBe(true);
    });
  });

  describe('selectActiveFilterCount', () => {
    it('debe retornar 0 cuando no hay filtros', () => {
      const state = createAppState({ filters: {} });
      expect(selectActiveFilterCount(state)).toBe(0);
    });

    it('debe contar correctamente los filtros activos', () => {
      const state = createAppState({
        filters: {
          city: 'Guadalajara',
          propertyType: 'house' as const,
        },
      });
      expect(selectActiveFilterCount(state)).toBe(2);
    });

    it('no debe contar filtros con valor undefined', () => {
      const state = createAppState({
        filters: {
          city: 'Guadalajara',
          propertyType: undefined,
        },
      });
      expect(selectActiveFilterCount(state)).toBe(1);
    });
  });

  // ============================================================================
  // SELECTOR POR ID
  // ============================================================================

  describe('selectPropertyById', () => {
    it('debe encontrar una propiedad por ID', () => {
      const p1 = createTestProperty({ id: 1, title: 'Casa A' });
      const p2 = createTestProperty({ id: 2, title: 'Casa B' });
      const state = createAppState({ properties: [p1, p2] });

      const resultado = selectPropertyById(2)(state);

      expect(resultado).toEqual(p2);
    });

    it('debe retornar undefined si el ID no existe', () => {
      const state = createAppState({ properties: [createTestProperty({ id: 1 })] });
      const resultado = selectPropertyById(999)(state);
      expect(resultado).toBeUndefined();
    });

    it('debe retornar undefined cuando el array está vacío', () => {
      const state = createAppState({ properties: [] });
      expect(selectPropertyById(1)(state)).toBeUndefined();
    });
  });

  // ============================================================================
  // PAGINACIÓN INFO
  // ============================================================================

  describe('selectPaginationInfo', () => {
    it('debe calcular correctamente el rango de elementos mostrados', () => {
      const state = createAppState({
        currentPage: 2,
        pageSize: 10,
        totalCount: 95,
      });

      const pagination = selectPaginationInfo(state);

      // Página 2, pageSize 10: elementos 11-20
      expect(pagination.rangeStart).toBe(11);
      expect(pagination.rangeEnd).toBe(20);
      expect(pagination.totalPages).toBe(10);
      expect(pagination.hasNext).toBe(true);
      expect(pagination.hasPrevious).toBe(true);
    });

    it('debe indicar que no hay página anterior en la primera página', () => {
      const state = createAppState({ currentPage: 1, pageSize: 10, totalCount: 50 });
      const pagination = selectPaginationInfo(state);
      expect(pagination.hasPrevious).toBe(false);
      expect(pagination.rangeStart).toBe(1);
    });

    it('debe indicar que no hay página siguiente en la última página', () => {
      const state = createAppState({ currentPage: 5, pageSize: 10, totalCount: 50 });
      const pagination = selectPaginationInfo(state);
      expect(pagination.hasNext).toBe(false);
      expect(pagination.rangeEnd).toBe(50);
    });

    it('debe manejar correctamente cuando no hay resultados', () => {
      const state = createAppState({ totalCount: 0, currentPage: 1, pageSize: 10 });
      const pagination = selectPaginationInfo(state);
      expect(pagination.rangeStart).toBe(0);
      expect(pagination.rangeEnd).toBe(0);
    });
  });

  // ============================================================================
  // VIEWMODEL
  // ============================================================================

  describe('selectPropertyListViewModel', () => {
    it('debe indicar isEmpty cuando no hay propiedades y no está cargando', () => {
      const state = createAppState({ properties: [], loading: false });
      const vm = selectPropertyListViewModel(state);
      expect(vm.isEmpty).toBe(true);
    });

    it('no debe indicar isEmpty cuando está cargando (aunque no haya propiedades)', () => {
      const state = createAppState({ properties: [], loading: true });
      const vm = selectPropertyListViewModel(state);
      expect(vm.isEmpty).toBe(false);
    });

    it('no debe indicar isEmpty cuando hay propiedades', () => {
      const state = createAppState({ properties: [createTestProperty()] });
      const vm = selectPropertyListViewModel(state);
      expect(vm.isEmpty).toBe(false);
    });

    it('debe incluir todas las propiedades necesarias para la UI', () => {
      const state = createAppState({
        properties: [createTestProperty()],
        loading: false,
        error: null,
        filters: { city: 'GDL' },
      });
      const vm = selectPropertyListViewModel(state);

      expect(vm).toHaveProperty('properties');
      expect(vm).toHaveProperty('loading');
      expect(vm).toHaveProperty('error');
      expect(vm).toHaveProperty('pagination');
      expect(vm).toHaveProperty('hasActiveFilters');
      expect(vm).toHaveProperty('activeFilterCount');
      expect(vm).toHaveProperty('filters');
      expect(vm).toHaveProperty('isEmpty');
    });
  });

  // ============================================================================
  // MEMOIZACIÓN
  // ============================================================================

  describe('memoización', () => {
    it('selectAllProperties debe retornar la misma referencia si el estado no cambió', () => {
      const state = createAppState({ properties: [createTestProperty()] });

      const resultado1 = selectAllProperties(state);
      const resultado2 = selectAllProperties(state);

      // Misma referencia → el selector no recalculó
      expect(resultado1).toBe(resultado2);
    });

    it('selectTotalPages debe retornar valor diferente si totalCount cambia', () => {
      const state1 = createAppState({ totalCount: 10, pageSize: 10 });
      const state2 = createAppState({ totalCount: 25, pageSize: 10 });

      const paginas1 = selectTotalPages(state1); // 1 página
      const paginas2 = selectTotalPages(state2); // 3 páginas

      expect(paginas1).toBe(1);
      expect(paginas2).toBe(3);
      expect(paginas1).not.toBe(paginas2);
    });
  });
});
