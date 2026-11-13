/**
 * Tests del App Root Component
 *
 * El App component solo tiene un router-outlet.
 * El test de integración completo requiere TestBed inicializado
 * con BrowserAnimationsModule, RouterModule, etc., lo cual está
 * fuera del scope de los tests unitarios de Vitest puro.
 *
 * Para tests de integración de Angular, usar:
 * - @angular/core/testing con karma (ng test)
 * - @analogjs/vitest-angular para Vitest completo
 *
 * Aquí testeamos solo que la clase existe y tiene el signal correcto.
 */

import { App } from './app';

describe('App Root Component', () => {
  it('debe poder instanciarse', () => {
    // App no tiene dependencias inyectadas, se puede instanciar directamente
    const app = new App();
    expect(app).toBeTruthy();
  });

  it('debe tener el signal title definido', () => {
    const app = new App();
    // El signal title se llama como función
    expect(app['title']()).toBe('RealState CRM');
  });
});
