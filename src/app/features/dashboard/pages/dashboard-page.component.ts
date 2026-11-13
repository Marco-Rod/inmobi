/**
 * DashboardPage Component (Smart Component)
 *
 * Este es el componente CONTENEDOR del dashboard.
 *
 * PATRÓN: Smart/Dumb Component Pattern
 *
 * ┌─────────────────────────────────────────────────┐
 * │  DashboardPage (SMART)                          │
 * │  - Conoce NgRx Store                            │
 * │  - Dispacha actions (loadAllDashboardData)      │
 * │  - Lee datos con selectores (vm$)               │
 * │  - NO tiene lógica de presentación               │
 * │                                                 │
 * │  ┌────────────────┐  ┌────────────────────┐    │
 * │  │ StatsCards     │  │ PropertyDistribut. │    │
 * │  │ (DUMB)         │  │ (DUMB)             │    │
 * │  │ - @Input data   │  │ - @Input charts    │    │
 * │  │ - @Output click │  │ - @Output filter   │    │
 * │  │ - No sabe NgRx  │  │ - No sabe NgRx     │    │
 * │  └────────────────┘  └────────────────────┘    │
 * └─────────────────────────────────────────────────┘
 *
 * El contenedor:
 * 1. Se suscribe al store con selectores
 * 2. Pasa los datos a los componentes dumb via @Input
 * 3. Escucha eventos @Output de los dumb y dispara actions
 *
 * Ventajas:
 * ✅ Los dumb son reutilizables y testeables
 * ✅ La lógica de estado está en un solo lugar
 * ✅ Cambios de estado son predecibles
 * ✅ OnPush funciona perfecto en los dumb
 */

import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { BaseChartDirective } from 'ng2-charts';

import { StatsCardsComponent } from '../components/stats-cards/stats-cards.component';
import { PropertyDistributionComponent } from '../components/property-distribution/property-distribution.component';
import * as DashboardActions from '../store/dashboard.actions';
import { selectDashboardViewModel } from '../store/dashboard.selectors';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    ButtonModule,
    BaseChartDirective,
    StatsCardsComponent,
    PropertyDistributionComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,

  template: `
    <!-- =====================================================================
         HEADER DEL DASHBOARD
         ===================================================================== -->
    <div class="flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="text-3xl font-bold text-900 mb-1">Dashboard</h1>
        <p class="text-500 m-0">
          Resumen general del mercado inmobiliario
          @if ((vm$ | async)?.lastUpdatedLabel) {
            · Actualizado a las {{ (vm$ | async)?.lastUpdatedLabel }}
          }
        </p>
      </div>

      <!-- Botón de refrescar -->
      <button
        type="button"
        pButton
        class="p-button-outlined p-button-sm"
        (click)="onRefresh()"
        [disabled]="(vm$ | async)?.anyLoading">
        <i
          class="pi mr-2"
          [class.pi-spin]="(vm$ | async)?.anyLoading"
          [class.pi-refresh]="!(vm$ | async)?.isInitialLoad"
          [class.pi-spinner]="(vm$ | async)?.isInitialLoad">
        </i>
        Actualizar
      </button>
    </div>

    <!-- =====================================================================
         CONTENIDO PRINCIPAL
         ===================================================================== -->

    <!--
      Usamos @if con async pipe para desempaquetar el Observable.

      vm$ es un Observable del ViewModel. El async pipe:
      1. Se suscribe automáticamente
      2. Desempaqueta el valor emitido
      3. Desuscribe automáticamente al destruir el componente
      4. Funciona perfecto con OnPush

      Patron: *ngIf con async + as variable local
      Evita múltiples subscripciones en el template.
    -->
    <ng-container *ngIf="vm$ | async as vm">
      <!-- ERROR GLOBAL: si toda la carga inicial falló -->
      @if (vm.errors.summary && !vm.summary) {
        <div class="surface-card shadow-1 border-round p-4 mb-4 text-center">
          <i class="pi pi-exclamation-triangle text-3xl text-red-500 mb-3"></i>
          <h3 class="text-900 mb-1">No se pudo cargar el dashboard</h3>
          <p class="text-500 mb-3">{{ vm.errors.summary }}</p>
          <button
            type="button"
            pButton
            label="Reintentar"
            class="p-button"
            (click)="onRefresh()">
          </button>
        </div>
      } @else {
        <!-- ============================================================
             SECCIÓN 1: TARJETAS DE ESTADÍSTICAS
             ============================================================ -->
        <div class="mb-4">
          <app-stats-cards
            [summary]="vm.summary"
            [loading]="vm.isInitialLoad">
          </app-stats-cards>
        </div>

        <!-- ============================================================
             SECCIÓN 2: GRÁFICOS DE DISTRIBUCIÓN
             ============================================================ -->
        <div class="mb-4">
          <app-property-distribution
            [cityChartData]="vm.cityChartData"
            [typeChartData]="vm.typeChartData"
            [loadingCity]="vm.anyLoading && !vm.cityChartData"
            [loadingType]="vm.anyLoading && !vm.typeChartData">
          </app-property-distribution>
        </div>

        <!-- ============================================================
             SECCIÓN 3: ESTADÍSTICAS MENSUALES (placeholder para Fase 10)
             ============================================================ -->
        <div class="surface-card shadow-1 border-round p-4">
          <div class="flex justify-content-between align-items-center mb-3">
            <h3 class="text-lg font-semibold text-900 m-0">
              Tendencias Mensuales
            </h3>

            <!-- Selector de meses -->
            <div class="flex align-items-center gap-2">
              <span class="text-500 text-sm">Últimos</span>
              <select
                class="p-inputtext-sm"
                [value]="vm.monthsToShow"
                (change)="onMonthsChange($event)">
                <option [value]="3">3 meses</option>
                <option [value]="6">6 meses</option>
                <option [value]="12">12 meses</option>
              </select>
            </div>
          </div>

          @if (vm.salesTrend) {
            <div class="flex gap-4 mb-3">
              <div class="flex align-items-center gap-2">
                <i
                  class="pi"
                  [class.pi-arrow-up]="vm.salesTrend.isPositive"
                  [class.pi-arrow-down]="!vm.salesTrend.isPositive"
                  [style.color]="vm.salesTrend.isPositive ? '#10B981' : '#EF4444'">
                </i>
                <span
                  [style.color]="vm.salesTrend.isPositive ? '#10B981' : '#EF4444'"
                  class="font-bold">
                  {{ vm.salesTrend.percentage }}%
                </span>
                <span class="text-500 text-sm">vs. mes anterior</span>
              </div>
            </div>
          }

          @if (vm.monthlyChartData) {
            <div style="height: 300px;">
              <canvas
                baseChart
                [data]="vm.monthlyChartData"
                type="bar"
                [options]="monthlyChartOptions">
              </canvas>
            </div>
          } @else if (vm.anyLoading) {
            <div
              class="border-round flex justify-content-center align-items-center"
              style="height: 300px; background: var(--surface-200);">
              <i class="pi pi-spin pi-spinner text-3xl text-400"></i>
            </div>
          }
        </div>
      }
    </ng-container>
  `,
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  /**
   * Inyectamos el Store.
   *
   * Sin genérico: Angular inyecta el store global configurado en app.config.ts.
   * Con genérico: Store<AppState> da type-safety adicional pero no es requerido.
   */
  private readonly store = inject(Store);

  /**
   * ViewModel Observable
   *
   * El componente se suscribe a este Observable para obtener todos los datos
   * que necesita para renderizar el dashboard.
   *
   * Usamos selectDashboardViewModel que combina múltiples selectores en un
   * solo objeto. Esto significa:
   * - Una sola suscripción (via async pipe en el template)
   * - El componente solo recibe un objeto nuevo cuando algo relevante cambia
   * - Mejor performance que múltiples suscripciones separadas
   */
  vm$: Observable<ReturnType<typeof selectDashboardViewModel>> =
    this.store.select(selectDashboardViewModel);

  /**
   * Subject para gestionar la desuscripción.
   *
   * Usado con takeUntil para cancelar automáticamente todas las
   * suscripciones cuando el componente se destruye.
   *
   * Patrón takeUntil:
   * ```typescript
   * obs$.pipe(takeUntil(this.destroy$)).subscribe(...);
   * ```
   * Cuando this.destroy$.next() se llama, todas las suscripciones se cancelan.
   *
   * NOTA: Con async pipe no es necesario porque async pipe maneja su propia
   * desuscripción. Pero lo mantenemos para futuras suscripciones manuales.
   */
  private readonly destroy$ = new Subject<void>();

  /**
   * Opciones del gráfico mensual (definidas aquí porque son estáticas)
   */
  monthlyChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
      },
    },
  };

  // ==========================================================================
  // LIFECYCLE
  // ==========================================================================

  /**
   * ngOnInit - Inicialización del componente
   *
   * Aquí disparamos la action para cargar los datos del dashboard.
   *
   * Flujo:
   * 1. Componente se inicializa
   * 2. ngOnInit dispara loadAllDashboardData
   * 3. El Effect escucha la action
   * 4. El Effect hace forkJoin de 4 peticiones HTTP
   * 5. El Effect dispara loadAllDashboardDataSuccess con los resultados
   * 6. El Reducer actualiza el estado con los nuevos datos
   * 7. Los selectores recalculan el ViewModel
   * 8. El async pipe recibe el nuevo ViewModel
   * 9. El template se re-renderiza con los nuevos datos
   */
  ngOnInit(): void {
    console.log('📊 [DashboardPage] Inicializando, cargando datos...');
    this.store.dispatch(DashboardActions.loadAllDashboardData({}));
  }

  /**
   * ngOnDestroy - Limpieza
   *
   * Completamos el Subject para cancelar todas las suscripciones pendientes.
   * Esto previene memory leaks si hay suscripciones manuales activas.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================================================
  // HANDLERS DE EVENTOS
  // ==========================================================================

  /**
   * Handler: Refrescar el dashboard
   *
   * Dispara la action refreshDashboard.
   * El Effect que escucha refreshDashboard es el mismo que loadAllDashboardData
   * (ver el ofType en dashboard.effects.ts).
   */
  onRefresh(): void {
    console.log('🔄 [DashboardPage] Refrescando dashboard...');
    this.store.dispatch(DashboardActions.refreshDashboard());
  }

  /**
   * Handler: Cambiar el número de meses a mostrar
   *
   * Dispara setMonthsToShow que:
   * 1. El Reducer actualiza monthsToShow en el estado
   * 2. El Effect setMonthsToShow$ dispara loadMonthlyStats con el nuevo período
   * 3. El Effect loadMonthlyStats$ hace la petición HTTP
   * 4. El Reducer actualiza monthlyStats con los nuevos datos
   *
   * Cadena de acciones:
   * setMonthsToShow → (effect) → loadMonthlyStats → (effect) → HTTP → loadMonthlyStatsSuccess
   */
  onMonthsChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const months = Number(select.value);
    console.log(`📅 [DashboardPage] Cambiando a ${months} meses`);
    this.store.dispatch(DashboardActions.setMonthsToShow({ months }));
  }
}
