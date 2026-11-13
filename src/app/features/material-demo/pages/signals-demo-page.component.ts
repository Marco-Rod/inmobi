/**
 * SignalsDemoPage Component
 *
 * Página de demostración que muestra tres niveles de Signals en Angular:
 *
 * 1. Signals puros de Angular (signal, computed, effect)
 *    - Contador reactivo sin NgRx
 *    - Sin RxJS, sin Observables, sin async pipe
 *    - El patrón más simple para estado local de componente
 *
 * 2. NgRx SignalStore (PropertySignalStore)
 *    - Estado compartido entre componentes
 *    - Alternativa al Store tradicional de NgRx
 *    - Menos boilerplate, más directo
 *
 * 3. Comparación visual Store tradicional vs SignalStore
 *    - Tabla lado a lado
 *    - Diferencias clave
 *
 * OBJETIVO PEDAGÓGICO:
 * Al terminar de leer esta página, el desarrollador debe entender:
 * - Qué es un signal y cómo se usa
 * - Cuándo usar signals locales vs SignalStore vs Store tradicional
 * - Por qué Angular está migrando hacia signals
 */

import {
  Component,
  signal,
  computed,
  effect,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { PropertySignalStore } from '../../properties/store/property-signal.store';

@Component({
  selector: 'app-signals-demo-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule],
  changeDetection: ChangeDetectionStrategy.OnPush,

  template: `
    <h1 class="text-3xl font-bold text-900 mb-1">Angular Signals Demo</h1>
    <p class="text-500 mb-4">
      Signals es el nuevo sistema de reactividad de Angular (v17+). Más simple
      que RxJS para estado local y más eficiente que Zone.js para detección de cambios.
    </p>

    <!-- =====================================================================
         SECCIÓN 1: SIGNALS PUROS (sin NgRx)
         ===================================================================== -->
    <div class="surface-card shadow-1 border-round p-4 mb-4">
      <h2 class="text-xl font-semibold text-900 mb-3">
        <i class="pi pi-bolt text-yellow-500 mr-2"></i>
        Signals locales (signal, computed, effect)
      </h2>

      <p class="text-600 text-sm mb-3">
        Estos signals viven solo en este componente. No usan NgRx ni servicios.
        Son ideales para estado que no necesita compartirse.
      </p>

      <!-- CONTADOR REACTIVO -->
      <div class="flex align-items-center gap-3 mb-3">
        <p-button
          label="Decrementar"
          icon="pi pi-minus"
          [outlined]="true"
          (onClick)="decrement()">
        </p-button>

        <div class="text-center" style="min-width: 4rem;">
          <div class="text-4xl font-bold" [class.text-green-500]="count() > 0" [class.text-red-500]="count() < 0">
            {{ count() }}
          </div>
          <div class="text-500 text-sm">Contador</div>
        </div>

        <p-button
          label="Incrementar"
          icon="pi pi-plus"
          (onClick)="increment()">
        </p-button>
      </div>

      <!-- DEMOSTRACIÓN DE computed() -->
      <div class="grid mt-3">
        <div class="col-4 text-center">
          <div class="text-2xl font-bold text-blue-500">{{ doubled() }}</div>
          <div class="text-500 text-sm">Doble (computed)</div>
        </div>
        <div class="col-4 text-center">
          <div class="text-2xl font-bold text-purple-500">{{ squared() }}</div>
          <div class="text-500 text-sm">Cuadrado (computed)</div>
        </div>
        <div class="col-4 text-center">
          <div class="text-2xl font-bold" [class.text-green-500]="isPositive()" [class.text-red-500]="!isPositive()">
            {{ isPositive() ? 'Positivo' : 'Negativo' }}
          </div>
          <div class="text-500 text-sm">Boolean (computed)</div>
        </div>
      </div>

      <!-- LOG DE EFFECTS -->
      <div class="mt-3 p-3 border-round surface-ground">
        <div class="text-500 text-sm mb-1">Effect log (se actualiza automáticamente):</div>
        <div class="font-mono text-sm text-700">{{ effectLog() }}</div>
      </div>
    </div>

    <!-- =====================================================================
         SECCIÓN 2: NGRX SIGNALSTORE
         ===================================================================== -->
    <div class="surface-card shadow-1 border-round p-4 mb-4">
      <h2 class="text-xl font-semibold text-900 mb-3">
        <i class="pi pi-database text-blue-500 mr-2"></i>
        NgRx SignalStore (PropertySignalStore)
      </h2>

      <p class="text-600 text-sm mb-3">
        Este store fue inyectado automáticamente. En onInit cargó las propiedades
        desde la API Mock. Los datos son signals: cambia en cualquier componente
        y todos los que usan el store se actualizan.
      </p>

      <!-- ESTADO DEL SIGNALSTORE -->
      <div class="grid mb-3">
        <div class="col-3 text-center">
          <div class="text-2xl font-bold text-900">{{ store.properties().length }}</div>
          <div class="text-500 text-sm">Propiedades</div>
        </div>
        <div class="col-3 text-center">
          <div class="text-2xl font-bold" [class.text-blue-500]="store.loading()" [class.text-900]="!store.loading()">
            {{ store.loading() ? 'Cargando...' : 'Listo' }}
          </div>
          <div class="text-500 text-sm">Estado</div>
        </div>
        <div class="col-3 text-center">
          <div class="text-2xl font-bold text-900">{{ store.totalCount() }}</div>
          <div class="text-500 text-sm">Total registros</div>
        </div>
        <div class="col-3 text-center">
          <div class="text-2xl font-bold text-900">{{ store.totalPages() }}</div>
          <div class="text-500 text-sm">Páginas</div>
        </div>
      </div>

      <!-- ERROR -->
      @if (store.error()) {
        <div class="p-3 border-round surface-ground mb-3 border-1 border-red-500">
          <span class="text-red-500">{{ store.error() }}</span>
          <p-button label="Limpiar" [text]="true" size="small" (onClick)="store.clearError()"></p-button>
        </div>
      }

      <!-- LISTA DE PROPIEDADES -->
      <div class="font-semibold text-900 mb-2">Propiedades cargadas:</div>
      @if (store.loading()) {
        <div class="text-center py-4">
          <i class="pi pi-spin pi-spinner text-2xl text-400"></i>
        </div>
      } @else {
        <div class="flex flex-wrap gap-2 mb-3">
          @for (prop of store.properties(); track prop.id) {
            <div
              class="border-round p-2 text-sm cursor-pointer transition-colors"
              [class.surface-ground]="store.selectedPropertyId() !== prop.id"
              [style.background]="store.selectedPropertyId() === prop.id ? 'var(--primary-color)' : ''"
              [style.color]="store.selectedPropertyId() === prop.id ? 'var(--primary-contrast-color)' : ''"
              (click)="store.selectProperty(prop.id)">
              {{ prop.title }}
            </div>
          }
        </div>

        <!-- PROPIEDAD SELECCIONADA (computed signal) -->
        @if (store.selectedProperty(); as selected) {
          <div class="p-3 border-round surface-ground">
            <div class="font-semibold text-900 mb-1">Propiedad seleccionada (computed):</div>
            <div class="text-700">{{ selected.title }}</div>
            <div class="text-500 text-sm">
              {{ selected.city }}, {{ selected.state }} · {{ formatPrice(selected.price) }}
            </div>
          </div>
        }
      }

      <!-- ACCIONES DEL SIGNALSTORE -->
      <div class="flex gap-2 mt-3">
        <p-button
          label="Recargar"
          icon="pi pi-refresh"
          [text]="true"
          (onClick)="store.loadProperties()">
        </p-button>
        <p-button
          label="Limpiar selección"
          icon="pi pi-times"
          [text]="true"
          severity="secondary"
          (onClick)="store.selectProperty(null)">
        </p-button>
      </div>
    </div>

    <!-- =====================================================================
         SECCIÓN 3: COMPARACIÓN
         ===================================================================== -->
    <div class="surface-card shadow-1 border-round p-4">
      <h2 class="text-xl font-semibold text-900 mb-3">
        <i class="pi pi-compass text-purple-500 mr-2"></i>
        Store tradicional vs SignalStore
      </h2>

      <div class="grid">
        <div class="col-12 md:col-6">
          <h3 class="font-semibold text-900 mb-2">Store tradicional (Fase 6)</h3>
          <ul class="list-none p-0 m-0 text-600">
            <li class="mb-2 flex gap-2"><i class="pi pi-check text-green-500"></i> 5 archivos por feature (state, actions, reducer, effects, selectors)</li>
            <li class="mb-2 flex gap-2"><i class="pi pi-check text-green-500"></i> Redux DevTools (time-travel debugging)</li>
            <li class="mb-2 flex gap-2"><i class="pi pi-check text-green-500"></i> Separación estricta de concerns</li>
            <li class="mb-2 flex gap-2"><i class="pi pi-check text-green-500"></i> Escala para apps muy grandes</li>
            <li class="mb-2 flex gap-2"><i class="pi pi-times text-red-500"></i> Mucho boilerplate</li>
            <li class="mb-2 flex gap-2"><i class="pi pi-times text-red-500"></i> Curva de aprendizaje</li>
          </ul>
        </div>
        <div class="col-12 md:col-6">
          <h3 class="font-semibold text-900 mb-2">SignalStore (este archivo)</h3>
          <ul class="list-none p-0 m-0 text-600">
            <li class="mb-2 flex gap-2"><i class="pi pi-check text-green-500"></i> 1 archivo por feature</li>
            <li class="mb-2 flex gap-2"><i class="pi pi-check text-green-500"></i> Menos boilerplate, más directo</li>
            <li class="mb-2 flex gap-2"><i class="pi pi-check text-green-500"></i> Integración natural con signals</li>
            <li class="mb-2 flex gap-2"><i class="pi pi-check text-green-500"></i> TypeScript inferido</li>
            <li class="mb-2 flex gap-2"><i class="pi pi-times text-red-500"></i> Sin time-travel debugging</li>
            <li class="mb-2 flex gap-2"><i class="pi pi-times text-red-500"></i> Menos herramientas ecosistema</li>
          </ul>
        </div>
      </div>

      <div class="mt-4 p-3 border-round surface-ground">
        <h4 class="font-semibold text-900 mb-1">Recomendación</h4>
        <p class="text-600 text-sm m-0">
          Usa <strong>Store tradicional</strong> para features críticas con mucho estado y equipos grandes.
          Usa <strong>SignalStore</strong> para features medianas, prototipos rápidos, o cuando quieras simplicidad.
          Ambos pueden coexistir en la misma aplicación.
        </p>
      </div>
    </div>
  `,
})
export class SignalsDemoPageComponent {
  /**
   * Inyectamos el PropertySignalStore.
   *
   * A diferencia del Store tradicional donde inyectamos Store y usamos
   * selectores, aquí inyectamos directamente el store que tiene signals
   * y métodos expuestos.
   *
   * this.store.properties()   → signal que retorna Property[]
   * this.store.loading()      → signal que retorna boolean
   * this.store.loadProperties() → método que carga datos
   */
  readonly store = inject(PropertySignalStore);

  // ==========================================================================
  // SIGNALS LOCALES (sin NgRx)
  // ==========================================================================

  /**
   * signal() crea una señal reactiva.
   *
   * Diferencia con variables normales:
   * - Variable: `let count = 0` → Angular NO detecta cambios
   * - Signal: `count = signal(0)` → Angular SÍ detecta cambios
   *
   * Acceso: count() ← se llama como función para leer el valor
   * Mutación: count.set(5) o count.update(v => v + 1)
   *
   * En el template: {{ count() }} ← se llama como función
   */
  count = signal(0);

  /**
   * computed() crea una señal derivada.
   *
   * Se recalcula SOLO cuando count() cambia.
   * Si count() no cambia, retorna el valor cacheado (memoización).
   *
   * Similar a createSelector de NgRx, pero más simple:
   * - NgRx: createSelector(selectCount, (c) => c * 2)
   * - Signal: computed(() => this.count() * 2)
   */
  doubled = computed(() => this.count() * 2);
  squared = computed(() => this.count() * this.count());
  isPositive = computed(() => this.count() >= 0);

  /**
   * Signal para el log de effects.
   * Se actualiza cada vez que count cambia, vía effect().
   */
  effectLog = signal('El contador inicia en 0');

  // ==========================================================================
  // EFFECT: Reacción automática a cambios en signals
  // ==========================================================================

  /**
   * effect() ejecuta una función cuando cualquier signal leído dentro
   * de la función cambia.
   *
   * Es como suscribirse a un Observable, pero para signals:
   * - Observable: count$.subscribe(val => console.log(val))
   * - Effect: effect(() => console.log(this.count()))
   *
   * DIFERENCIAS con subscribe:
   * - effect se ejecuta inmediatamente la primera vez
   * - Se ejecuta de forma automática cuando el signal cambia
   * - No necesita desuscripción (Angular lo gestiona)
   *
   * CASOS DE USO:
   * - Logging
   * - Sincronizar con localStorage
   * - Actualizar el DOM directamente (raro en Angular)
   *
   * NO USAR para:
   * - Transformar datos (usa computed)
   * - Llamar HTTP (usa métodos)
   */
  constructor() {
    effect(() => {
      const value = this.count();
      this.effectLog.set(`El contador cambió a ${value} a las ${new Date().toLocaleTimeString('es-MX')}`);
    });
  }

  // ==========================================================================
  // MÉTODOS QUE MODIFICAN SIGNALS
  // ==========================================================================

  increment(): void {
    // update recibe el valor actual y retorna el nuevo
    this.count.update((v) => v + 1);
  }

  decrement(): void {
    this.count.update((v) => v - 1);
  }

  formatPrice(price: number): string {
    return '$' + price.toLocaleString('es-MX');
  }
}
