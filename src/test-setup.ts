/**
 * Test Setup para Vitest
 *
 * Este archivo se ejecuta ANTES de cualquier test.
 * Configura el entorno de pruebas para que Angular funcione con Vitest.
 *
 * PROBLEMA:
 * Las librerías de Angular (NgRx, CommonModule, etc.) están compiladas
 * parcialmente (Ivy linker). Para usarlas en tests sin el tooling de Angular,
 * necesitamos cargar el compilador JIT como fallback.
 *
 * SOLUCIÓN:
 * Importar '@angular/compiler' antes de cualquier import de Angular.
 * Esto habilita la compilación JIT para los tests.
 */

// Habilita JIT compiler para Angular en tests
import '@angular/compiler';
