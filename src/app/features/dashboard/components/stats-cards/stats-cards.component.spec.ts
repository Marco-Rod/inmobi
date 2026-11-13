/**
 * Tests del StatsCardsComponent
 *
 * ESTRATEGIA DE TEST: Lógica de clase sin TestBed
 *
 * Para testear componentes Angular con Vitest puro (sin @analogjs/vitest-angular)
 * hay dos enfoques:
 *
 * 1. TestBed (completo):
 *    Renderiza el componente con Angular runtime.
 *    Permite testear el template, eventos, bindings.
 *    Requiere @analogjs/vitest-angular o configuración especial.
 *
 * 2. Lógica de clase (lo que hacemos):
 *    Testea solo los métodos y getters de la clase TypeScript.
 *    No renderiza el template.
 *    Funciona con Vitest puro sin dependencias extra.
 *
 * CUÁNDO USAR CADA ENFOQUE:
 *
 * Lógica de clase:
 * ✅ Lógica de transformación de datos (el getter cards())
 * ✅ Helpers privados (formatPrice, getPercentage)
 * ✅ Componentes dumb simples (solo @Input/@Output)
 * ✅ Rápido de escribir y ejecutar
 *
 * TestBed completo:
 * ✅ Verificar que el template se renderiza correctamente
 * ✅ Testear interacciones de usuario (click, input)
 * ✅ Verificar que @Input() actualiza la vista
 * ✅ Testear OnPush change detection
 *
 * Para este proyecto didáctico, usamos el enfoque de lógica de clase
 * que corre sin dependencias extra.
 */

import { StatsCardsComponent } from './stats-cards.component';
import { DashboardSummary } from '../../../../core/models';

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Factory de DashboardSummary para tests.
 * Permite crear resúmenes con valores específicos sin repetir todos los campos.
 */
function createTestSummary(
  overrides: Partial<DashboardSummary> = {}
): DashboardSummary {
  return {
    totalProperties: 100,
    availableProperties: 60,
    soldProperties: 25,
    rentedProperties: 10,
    negotiatingProperties: 5,
    averagePrice: 2_500_000,
    currency: 'MXN',
    totalInventoryValue: 250_000_000,
    ...overrides,
  };
}

// ============================================================================
// TESTS
// ============================================================================

describe('StatsCardsComponent', () => {
  let component: StatsCardsComponent;

  beforeEach(() => {
    /**
     * Instanciamos el componente directamente.
     * Como es un componente dumb sin dependencias inyectadas,
     * podemos hacer new StatsCardsComponent() sin TestBed.
     *
     * Para componentes con inject() necesitaríamos TestBed:
     * ```typescript
     * TestBed.configureTestingModule({ imports: [Component] });
     * component = TestBed.createComponent(Component).componentInstance;
     * ```
     */
    component = new StatsCardsComponent();
  });

  // ============================================================================
  // ESTADO INICIAL
  // ============================================================================

  describe('estado inicial', () => {
    it('debe tener summary null por defecto', () => {
      expect(component.summary).toBeNull();
    });

    it('debe tener loading false por defecto', () => {
      expect(component.loading).toBe(false);
    });

    it('debe retornar cards vacío cuando summary es null', () => {
      component.summary = null;
      expect(component.cards).toHaveLength(0);
    });
  });

  // ============================================================================
  // GETTER cards()
  // ============================================================================

  describe('getter cards()', () => {
    it('debe generar 4 tarjetas cuando hay summary', () => {
      component.summary = createTestSummary();
      expect(component.cards).toHaveLength(4);
    });

    it('la primera tarjeta debe mostrar el total de propiedades', () => {
      component.summary = createTestSummary({ totalProperties: 150 });
      const primeraCard = component.cards[0];
      expect(primeraCard.value).toBe(150);
      expect(primeraCard.title).toBe('Total Propiedades');
    });

    it('la segunda tarjeta debe mostrar propiedades disponibles', () => {
      component.summary = createTestSummary({ availableProperties: 75 });
      const card = component.cards[1];
      expect(card.value).toBe(75);
      expect(card.title).toBe('Disponibles');
    });

    it('la tercera tarjeta debe mostrar propiedades vendidas', () => {
      component.summary = createTestSummary({ soldProperties: 30 });
      const card = component.cards[2];
      expect(card.value).toBe(30);
      expect(card.title).toBe('Vendidas');
    });

    it('la cuarta tarjeta debe mostrar el precio promedio formateado', () => {
      component.summary = createTestSummary({ averagePrice: 2_500_000, currency: 'MXN' });
      const card = component.cards[3];
      // 2.5M → "$2.5M"
      expect(card.value).toContain('2.5M');
      expect(card.title).toBe('Precio Promedio');
    });

    it('todas las tarjetas deben tener icon, color y bgColor definidos', () => {
      component.summary = createTestSummary();
      for (const card of component.cards) {
        expect(card.icon).toBeTruthy();
        expect(card.color).toBeTruthy();
        expect(card.bgColor).toBeTruthy();
      }
    });
  });

  // ============================================================================
  // CÁLCULO DE PORCENTAJES (método privado testeado indirectamente)
  // ============================================================================

  describe('porcentajes en subtítulos', () => {
    it('debe calcular el porcentaje correcto de disponibles', () => {
      // 60 de 100 = 60%
      component.summary = createTestSummary({
        totalProperties: 100,
        availableProperties: 60,
      });
      const cardDisponibles = component.cards[1];
      expect(cardDisponibles.subtitle).toContain('60%');
    });

    it('debe manejar 0 total sin división por cero', () => {
      component.summary = createTestSummary({
        totalProperties: 0,
        availableProperties: 0,
      });
      // No debe lanzar error
      expect(() => component.cards).not.toThrow();
      const cardDisponibles = component.cards[1];
      expect(cardDisponibles.subtitle).toContain('0%');
    });
  });

  // ============================================================================
  // FORMATEO DE PRECIO
  // ============================================================================

  describe('formateo de precio', () => {
    it('debe formatear millones con sufijo M', () => {
      component.summary = createTestSummary({ averagePrice: 1_500_000, currency: 'MXN' });
      const precioCard = component.cards[3];
      expect(precioCard.value).toBe('$1.5M');
    });

    it('debe formatear miles con sufijo K', () => {
      component.summary = createTestSummary({ averagePrice: 500_000, currency: 'MXN' });
      const precioCard = component.cards[3];
      expect(precioCard.value).toBe('$500K');
    });

    it('debe usar símbolo USD para dólares', () => {
      component.summary = createTestSummary({ averagePrice: 1_000_000, currency: 'USD' });
      const precioCard = component.cards[3];
      expect(precioCard.value).toContain('US$');
    });

    it('debe usar símbolo $ para pesos mexicanos', () => {
      component.summary = createTestSummary({ averagePrice: 1_000_000, currency: 'MXN' });
      const precioCard = component.cards[3];
      expect(precioCard.value).toContain('$');
      expect(precioCard.value).not.toContain('US$');
    });
  });

  // ============================================================================
  // REACTIVIDAD: getter recalcula con nuevos inputs
  // ============================================================================

  describe('reactividad del getter', () => {
    it('debe reflejar cambios cuando summary cambia', () => {
      component.summary = createTestSummary({ totalProperties: 50 });
      expect(component.cards[0].value).toBe(50);

      // Cambiamos el summary
      component.summary = createTestSummary({ totalProperties: 200 });
      expect(component.cards[0].value).toBe(200);
    });

    it('debe retornar [] cuando summary pasa de tener valor a null', () => {
      component.summary = createTestSummary();
      expect(component.cards).toHaveLength(4);

      component.summary = null;
      expect(component.cards).toHaveLength(0);
    });
  });
});
