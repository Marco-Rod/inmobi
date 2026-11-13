/**
 * Tests del Reducer de Propiedades
 *
 * Los reducers son funciones PURAS: dado el mismo input, siempre
 * producen el mismo output. Esto los hace trivialmente testeables:
 * no necesitamos mocks, no necesitamos TestBed, no necesitamos async.
 *
 * ESTRUCTURA DE UN TEST:
 *
 * ```
 * describe('nombre del bloque') {
 *   it('descripción del comportamiento esperado', () => {
 *     // Arrange: Preparar el estado y la action
 *     // Act: Llamar al reducer
 *     // Assert: Verificar el nuevo estado
 *   });
 * }
 * ```
 *
 * CONVENCIÓN AAA (Arrange, Act, Assert):
 * - Arrange: Setup del estado y datos de entrada
 * - Act: Ejecutar la operación bajo test
 * - Assert: Verificar el resultado esperado
 *
 * POR QUÉ TESTEAR REDUCERS:
 * - Contienen lógica de negocio crítica
 * - Son puras → fáciles de testear
 * - Cambios futuros pueden romper comportamiento existente
 * - Los tests actúan como documentación ejecutable
 */

import { propertyReducer } from './property.reducer';
import { initialPropertyState, PropertyState } from './property.state';
import * as PropertyActions from './property.actions';
import { Property, PaginatedResponse } from '../../../core/models';

// ============================================================================
// HELPERS: Factories de datos de prueba
// ============================================================================

/**
 * Factory function para crear una Property de prueba.
 *
 * Usando una factory evitamos repetir los mismos datos en cada test.
 * El parámetro `overrides` permite personalizar campos específicos
 * sin tener que repetir todos los campos por defecto.
 *
 * ```typescript
 * const p = createTestProperty(); // propiedad con defaults
 * const p2 = createTestProperty({ id: 2, title: 'Casa B' }); // personalizada
 * ```
 */
function createTestProperty(overrides: Partial<Property> = {}): Property {
  return {
    id: 1,
    title: 'Casa de prueba',
    description: 'Descripción de prueba',
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
 * Factory para PaginatedResponse de prueba.
 */
function createTestPaginatedResponse(
  properties: Property[] = [],
  overrides: Partial<PaginatedResponse<Property>> = {}
): PaginatedResponse<Property> {
  return {
    count: properties.length,
    next: null,
    previous: null,
    results: properties,
    ...overrides,
  };
}

// ============================================================================
// TESTS DEL REDUCER
// ============================================================================

describe('propertyReducer', () => {
  /**
   * El estado inicial es el punto de partida para todos los tests.
   * Verificamos que el reducer retorne el estado inicial cuando
   * se llama con undefined y una action desconocida.
   */
  describe('estado inicial', () => {
    it('debe retornar el estado inicial cuando el estado es undefined', () => {
      // Arrange: Creamos una action que el reducer no maneja
      const unknownAction = { type: '[Test] Unknown Action' } as any;

      // Act: Llamamos al reducer con undefined como estado
      const state = propertyReducer(undefined, unknownAction);

      // Assert: El estado debe ser el inicial
      expect(state).toEqual(initialPropertyState);
    });

    it('el estado inicial debe tener properties vacío', () => {
      expect(initialPropertyState.properties).toEqual([]);
    });

    it('el estado inicial debe tener loading en false', () => {
      expect(initialPropertyState.loading).toBe(false);
    });

    it('el estado inicial debe tener error en null', () => {
      expect(initialPropertyState.error).toBeNull();
    });
  });

  // ============================================================================
  // LOAD PROPERTIES
  // ============================================================================

  describe('loadProperties', () => {
    it('debe activar loading y limpiar error', () => {
      // Arrange
      const estadoPrevio: PropertyState = {
        ...initialPropertyState,
        error: 'Error anterior',
        loading: false,
      };
      const action = PropertyActions.loadProperties({});

      // Act
      const nuevoEstado = propertyReducer(estadoPrevio, action);

      // Assert
      expect(nuevoEstado.loading).toBe(true);
      expect(nuevoEstado.error).toBeNull();
    });

    it('no debe modificar las propiedades existentes al iniciar carga', () => {
      // Arrange: Estado con propiedades existentes
      const propiedadExistente = createTestProperty();
      const estadoPrevio: PropertyState = {
        ...initialPropertyState,
        properties: [propiedadExistente],
      };

      // Act
      const nuevoEstado = propertyReducer(
        estadoPrevio,
        PropertyActions.loadProperties({})
      );

      // Assert: Las propiedades deben mantenerse durante la carga
      expect(nuevoEstado.properties).toEqual([propiedadExistente]);
    });
  });

  describe('loadPropertiesSuccess', () => {
    it('debe actualizar properties, totalCount, currentPage y pageSize', () => {
      // Arrange
      const propiedades = [
        createTestProperty({ id: 1 }),
        createTestProperty({ id: 2, title: 'Departamento' }),
      ];
      const response = createTestPaginatedResponse(propiedades, { count: 50 });
      const estadoPrevio = { ...initialPropertyState, loading: true };

      // Act
      const nuevoEstado = propertyReducer(
        estadoPrevio,
        PropertyActions.loadPropertiesSuccess({ response, page: 2, pageSize: 10 })
      );

      // Assert
      expect(nuevoEstado.loading).toBe(false);
      expect(nuevoEstado.properties).toEqual(propiedades);
      expect(nuevoEstado.totalCount).toBe(50);
      expect(nuevoEstado.currentPage).toBe(2);
      expect(nuevoEstado.pageSize).toBe(10);
      expect(nuevoEstado.error).toBeNull();
    });

    it('debe crear un NUEVO array (inmutabilidad)', () => {
      // Este test verifica la inmutabilidad: el reducer no debe
      // modificar el array original, debe crear uno nuevo.
      const estadoPrevio = { ...initialPropertyState, loading: true };
      const propiedades = [createTestProperty()];
      const response = createTestPaginatedResponse(propiedades);

      const nuevoEstado = propertyReducer(
        estadoPrevio,
        PropertyActions.loadPropertiesSuccess({ response, page: 1, pageSize: 10 })
      );

      // El array de properties debe ser una referencia DIFERENTE
      // (nuevo array creado por el reducer, no el mismo)
      expect(nuevoEstado.properties).not.toBe(estadoPrevio.properties);
      expect(nuevoEstado.properties).toEqual(propiedades);
    });
  });

  describe('loadPropertiesFailure', () => {
    it('debe desactivar loading y guardar el error', () => {
      // Arrange
      const estadoPrevio = { ...initialPropertyState, loading: true };

      // Act
      const nuevoEstado = propertyReducer(
        estadoPrevio,
        PropertyActions.loadPropertiesFailure({ error: 'Error de red' })
      );

      // Assert
      expect(nuevoEstado.loading).toBe(false);
      expect(nuevoEstado.error).toBe('Error de red');
    });
  });

  // ============================================================================
  // CREATE PROPERTY
  // ============================================================================

  describe('createPropertySuccess', () => {
    it('debe agregar la nueva propiedad al INICIO del array', () => {
      // Arrange: Estado con una propiedad existente
      const propiedadExistente = createTestProperty({ id: 1, title: 'Existente' });
      const nuevaPropiedad = createTestProperty({ id: 2, title: 'Nueva' });
      const estadoPrevio: PropertyState = {
        ...initialPropertyState,
        creating: true,
        properties: [propiedadExistente],
        totalCount: 1,
      };

      // Act
      const nuevoEstado = propertyReducer(
        estadoPrevio,
        PropertyActions.createPropertySuccess({ property: nuevaPropiedad })
      );

      // Assert
      expect(nuevoEstado.creating).toBe(false);
      // La nueva propiedad debe estar PRIMERO
      expect(nuevoEstado.properties[0]).toEqual(nuevaPropiedad);
      expect(nuevoEstado.properties[1]).toEqual(propiedadExistente);
      expect(nuevoEstado.properties).toHaveLength(2);
      expect(nuevoEstado.totalCount).toBe(2);
    });

    it('no debe mutar el array original (inmutabilidad)', () => {
      const propiedadOriginal = createTestProperty({ id: 1 });
      const estadoPrevio = {
        ...initialPropertyState,
        properties: [propiedadOriginal],
      };
      const arrRef = estadoPrevio.properties;

      propertyReducer(
        estadoPrevio,
        PropertyActions.createPropertySuccess({ property: createTestProperty({ id: 2 }) })
      );

      // El array original no debe haber sido modificado
      expect(estadoPrevio.properties).toBe(arrRef);
      expect(estadoPrevio.properties).toHaveLength(1);
    });
  });

  // ============================================================================
  // UPDATE PROPERTY
  // ============================================================================

  describe('updatePropertySuccess', () => {
    it('debe reemplazar la propiedad actualizada manteniendo el orden', () => {
      // Arrange
      const p1 = createTestProperty({ id: 1, title: 'Casa A' });
      const p2 = createTestProperty({ id: 2, title: 'Casa B' });
      const p2Actualizada = { ...p2, title: 'Casa B Modificada' };
      const estadoPrevio = {
        ...initialPropertyState,
        updating: true,
        properties: [p1, p2],
      };

      // Act
      const nuevoEstado = propertyReducer(
        estadoPrevio,
        PropertyActions.updatePropertySuccess({ property: p2Actualizada })
      );

      // Assert
      expect(nuevoEstado.updating).toBe(false);
      expect(nuevoEstado.properties[0]).toEqual(p1);       // p1 sin cambios
      expect(nuevoEstado.properties[1]).toEqual(p2Actualizada); // p2 actualizada
      expect(nuevoEstado.properties).toHaveLength(2);
    });

    it('también debe actualizar selectedProperty si es la que cambió', () => {
      const propiedad = createTestProperty({ id: 5, title: 'Original' });
      const propiedadActualizada = { ...propiedad, title: 'Actualizada' };
      const estadoPrevio = {
        ...initialPropertyState,
        properties: [propiedad],
        selectedProperty: propiedad,
      };

      const nuevoEstado = propertyReducer(
        estadoPrevio,
        PropertyActions.updatePropertySuccess({ property: propiedadActualizada })
      );

      expect(nuevoEstado.selectedProperty?.title).toBe('Actualizada');
    });
  });

  // ============================================================================
  // DELETE PROPERTY
  // ============================================================================

  describe('deletePropertySuccess', () => {
    it('debe remover la propiedad del array y decrementar totalCount', () => {
      // Arrange
      const p1 = createTestProperty({ id: 1 });
      const p2 = createTestProperty({ id: 2 });
      const estadoPrevio = {
        ...initialPropertyState,
        deleting: true,
        properties: [p1, p2],
        totalCount: 2,
      };

      // Act
      const nuevoEstado = propertyReducer(
        estadoPrevio,
        PropertyActions.deletePropertySuccess({ id: 1 })
      );

      // Assert
      expect(nuevoEstado.deleting).toBe(false);
      expect(nuevoEstado.properties).toHaveLength(1);
      expect(nuevoEstado.properties[0]).toEqual(p2);
      expect(nuevoEstado.totalCount).toBe(1);
      // p1 no debe estar en el array
      expect(nuevoEstado.properties.find((p) => p.id === 1)).toBeUndefined();
    });

    it('debe deseleccionar si la propiedad eliminada era la seleccionada', () => {
      const propiedad = createTestProperty({ id: 10 });
      const estadoPrevio = {
        ...initialPropertyState,
        properties: [propiedad],
        selectedProperty: propiedad,
      };

      const nuevoEstado = propertyReducer(
        estadoPrevio,
        PropertyActions.deletePropertySuccess({ id: 10 })
      );

      expect(nuevoEstado.selectedProperty).toBeNull();
    });
  });

  // ============================================================================
  // FILTROS
  // ============================================================================

  describe('setFilters', () => {
    it('debe actualizar los filtros y resetear a página 1', () => {
      const estadoPrevio = { ...initialPropertyState, currentPage: 3 };
      const nuevosFiltros = { city: 'Guadalajara', propertyType: 'house' as const };

      const nuevoEstado = propertyReducer(
        estadoPrevio,
        PropertyActions.setFilters({ filters: nuevosFiltros })
      );

      expect(nuevoEstado.filters).toEqual(nuevosFiltros);
      expect(nuevoEstado.currentPage).toBe(1); // Reset a página 1
    });
  });

  describe('clearFilters', () => {
    it('debe limpiar los filtros y resetear a página 1', () => {
      const estadoPrevio = {
        ...initialPropertyState,
        filters: { city: 'GDL', propertyType: 'house' as const },
        currentPage: 5,
      };

      const nuevoEstado = propertyReducer(estadoPrevio, PropertyActions.clearFilters());

      expect(nuevoEstado.filters).toEqual({});
      expect(nuevoEstado.currentPage).toBe(1);
    });
  });

  // ============================================================================
  // INMUTABILIDAD: TEST GENERAL
  // ============================================================================

  describe('inmutabilidad', () => {
    it('nunca debe modificar el estado anterior (funciones puras)', () => {
      // Arrange: Congelamos el estado para detectar mutaciones
      const estadoFijo = Object.freeze({
        ...initialPropertyState,
        properties: Object.freeze([createTestProperty()]),
      }) as PropertyState;

      // Si el reducer intenta mutar el estado, lanzará un error
      // porque el objeto está congelado con Object.freeze.
      expect(() => {
        propertyReducer(
          estadoFijo,
          PropertyActions.loadPropertiesSuccess({
            response: createTestPaginatedResponse([createTestProperty({ id: 2 })]),
            page: 1,
            pageSize: 10,
          })
        );
      }).not.toThrow();
    });
  });
});
