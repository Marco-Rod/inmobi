/**
 * ReportsPage Component (Smart Component)
 *
 * Página de reportes y estadísticas detalladas.
 *
 * DIFERENCIA CON EL DASHBOARD:
 * - Dashboard: Vista rápida con 4 tarjetas + 2 gráficos
 * - Reportes: Análisis profundo con 6 métricas + gráficos mixtos + breakdown
 *
 * REUTILIZACIÓN DEL STORE:
 * ReportsPage usa el MISMO store del dashboard (selectDashboardFeature).
 * No crea su propio slice de estado porque los datos son los mismos.
 * Solo necesita diferentes selectores y componentes de presentación.
 *
 * Si los reportes necesitaran datos adicionales (ej. reportes personalizados
 * con fechas específicas), sí crearíamos un store separado.
 */

import {
  Component,
  inject,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

import { ReportSummaryCardsComponent } from '../components/report-summary-cards/report-summary-cards.component';
import { SalesTrendChartComponent } from '../components/sales-trend-chart/sales-trend-chart.component';
import { InventoryBreakdownComponent } from '../components/inventory-breakdown/inventory-breakdown.component';

import * as DashboardActions from '../../dashboard/store/dashboard.actions';
import {
  selectSummary,
  selectCityDistribution,
  selectMonthlyStats,
  selectDashboardLoading,
  selectLastUpdated,
  selectMonthsToShow,
} from '../../dashboard/store/dashboard.selectors';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    FormsModule,
    ButtonModule,
    SelectModule,
    ReportSummaryCardsComponent,
    SalesTrendChartComponent,
    InventoryBreakdownComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,

  template: `
    <!-- HEADER -->
    <div class="flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="text-3xl font-bold text-900 mb-1">Reportes y Estadísticas</h1>
        <p class="text-500 m-0">
          Análisis detallado del mercado inmobiliario
          @if (lastUpdated$ | async) {
            · Actualizado: {{ lastUpdated$ | async | date: 'short' }}
          }
        </p>
      </div>

      <div class="flex align-items-center gap-2">
        <!-- SELECTOR DE PERÍODO -->
        <span class="text-500 text-sm">Período:</span>
        <p-select
          [ngModel]="monthsToShow$ | async"
          (ngModelChange)="onMonthsChange($event)"
          [options]="periodOptions"
          optionLabel="label"
          optionValue="value"
          styleClass="w-auto">
        </p-select>

        <!-- BOTÓN REFRESCAR -->
        <p-button
          icon="pi pi-refresh"
          [text]="true"
          [rounded]="true"
          (onClick)="onRefresh()"
          [loading]="(anyLoading$ | async)">
        </p-button>
      </div>
    </div>

    <!-- SECCIÓN 1: TARJETAS DE MÉTRICAS -->
    <div class="mb-4">
      <ng-container *ngIf="summary$ | async as summary; else loadingSummary">
        <app-report-summary-cards
          [summary]="summary"
          [loading]="!!((anyLoading$ | async) && !summary)">
        </app-report-summary-cards>
      </ng-container>
      <ng-template #loadingSummary>
        <app-report-summary-cards [loading]="true"></app-report-summary-cards>
      </ng-template>
    </div>

    <!-- SECCIÓN 2: TENDENCIA DE VENTAS -->
    <div class="mb-4">
      <ng-container *ngIf="monthlyStats$ | async as stats; else loadingTrend">
        <app-sales-trend-chart
          [stats]="stats"
          [loading]="!!((anyLoading$ | async) && stats.length === 0)">
        </app-sales-trend-chart>
      </ng-container>
      <ng-template #loadingTrend>
        <app-sales-trend-chart [loading]="true"></app-sales-trend-chart>
      </ng-template>
    </div>

    <!-- SECCIÓN 3: BREAKDOWN DE INVENTARIO -->
    <div class="mb-4">
      <ng-container *ngIf="{
        summary: summary$ | async,
        cities: cityDistribution$ | async
      } as data">
        <app-inventory-breakdown
          [summary]="data.summary"
          [cities]="data.cities"
          [loading]="!!((anyLoading$ | async) && !data.summary)">
        </app-inventory-breakdown>
      </ng-container>
    </div>

    <!-- FOOTER: nota pedagógica -->
    <div class="surface-card border-round p-3 text-center">
      <p class="text-500 text-sm m-0">
        <i class="pi pi-info-circle mr-1"></i>
        Los datos del reporte provienen del mismo store del dashboard
        (reutilización de estado). Si necesitas reportes con filtros de fecha
        personalizados, crea un store separado para no acoplar ambos módulos.
      </p>
    </div>
  `,
})
export class ReportsPageComponent implements OnInit {
  private readonly store = inject(Store);

  // ==========================================================================
  // OBSERVABLES DEL STORE (del dashboard)
  // ==========================================================================

  summary$ = this.store.select(selectSummary);
  cityDistribution$ = this.store.select(selectCityDistribution);
  monthlyStats$ = this.store.select(selectMonthlyStats);
  lastUpdated$ = this.store.select(selectLastUpdated);
  monthsToShow$ = this.store.select(selectMonthsToShow);

  /**
   * anyLoading$ combina los loading states individuales.
   * Usamos un Observable separado para mantener el template limpio.
   */
  anyLoading$: Observable<boolean> = this.store
    .select(selectDashboardLoading)
    .pipe(
      map((loading) =>
        loading.summary ||
        loading.cityDistribution ||
        loading.typeDistribution ||
        loading.monthlyStats
      )
    );

  // ==========================================================================
  // CONFIGURACIÓN
  // ==========================================================================

  periodOptions = [
    { label: '3 meses', value: 3 },
    { label: '6 meses', value: 6 },
    { label: '12 meses', value: 12 },
  ];

  // ==========================================================================
  // LIFECYCLE
  // ==========================================================================

  ngOnInit(): void {
    console.log('📊 [ReportsPage] Cargando datos para reportes...');
    // Carga los datos si aún no están cargados (el dashboard puede ya haberlos cargado)
    this.store.dispatch(DashboardActions.loadAllDashboardData({}));
  }

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  onRefresh(): void {
    this.store.dispatch(DashboardActions.refreshDashboard());
  }

  onMonthsChange(months: number): void {
    this.store.dispatch(DashboardActions.setMonthsToShow({ months }));
  }}
