/**
 * Vitest Configuration
 *
 * Vitest es el test runner moderno del ecosistema Vite.
 * Para Angular 22, usamos @analogjs/vitest-angular que adapta
 * Vitest para trabajar con el compilador de Angular.
 *
 * Alternativas de test runners para Angular:
 * - Karma + Jasmine: El runner tradicional (ng test). Más lento, configuración compleja.
 * - Jest: Popular en React, funciona con Angular con extra config.
 * - Vitest: Moderno, rápido, compatible con la API de Jest.
 *
 * Para UNIT TESTS de lógica pura (reducers, selectors, services sin Angular),
 * podemos usar Vitest directamente sin @analogjs, que es más simple.
 *
 * Para COMPONENT TESTS que necesitan TestBed de Angular, se requiere
 * @analogjs/vitest-angular o la configuración de karma.
 *
 * ESTRATEGIA en este proyecto:
 * - Reducers y Selectors: Vitest puro (son funciones JavaScript puras)
 * - Services con inject(): Vitest con TestBed mínimo
 * - Components: Vitest con TestBed (más complejo)
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    /**
     * globals: true permite usar describe, it, expect, etc. sin importar
     * Equivalente a Jest globals.
     * Configurado en tsconfig.spec.json con "types": ["vitest/globals"]
     */
    globals: true,

    /**
     * environment: 'jsdom' simula el DOM del navegador.
     * Necesario para tests que acceden a document, window, etc.
     * Las funciones puras (reducers, selectors) no necesitan esto,
     * pero lo habilitamos globalmente para consistencia.
     */
    environment: 'jsdom',

    /**
     * include: Patrón de archivos de test a ejecutar.
     */
    include: ['src/**/*.spec.ts'],

    /**
     * setupFiles: Se ejecuta ANTES de cada archivo de test.
     * Importa @angular/compiler para habilitar compilación JIT,
     * necesaria para NgRx y librerías de Angular en entorno Vitest.
     */
    setupFiles: ['src/test-setup.ts'],

    /**
     * coverage: Configuración del reporte de cobertura.
     * Ejecutar con: npm run test:coverage
     */
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/app/features/properties/store/**',
        'src/app/features/properties/services/**',
        'src/app/features/dashboard/store/**',
      ],
      exclude: ['**/*.spec.ts', '**/index.ts'],
    },
  },
});
