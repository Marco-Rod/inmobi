/**
 * PropertyDistribution Component
 *
 * Componente presentacional que muestra gráficos de distribución:
 * - Distribución por ciudad (gráfico de torta/dona)
 * - Distribución por tipo de propiedad (gráfico de barras)
 *
 * PATRÓN: Componente presentacional con @Input()
 *
 * Recibe los datos ya transformados desde el store (selectores con formato Chart.js).
 * El componente solo se encarga de renderizar los gráficos.
 *
 * TECNOLOGÍA: ng2-charts + Chart.js
 *
 * ng2-charts es un wrapper de Angular para Chart.js.
 * Proporciona directivas como baseChartDirective para usar Chart.js
 * de forma declarativa en el template.
 */

import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

/**
 * Tipo para los datos de chart que vienen de los selectors.
 * Coincide con el formato que retorna selectCityChartData y selectTypeChartData.
 */
interface ChartDataResult {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
    hoverBackgroundColor?: string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

@Component({
  selector: 'app-property-distribution',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,

  template: `
    <!-- =====================================================================
         GRID DE DOS GRÁFICOS
         ===================================================================== -->
    <div class="grid">

      <!-- ==================================================================
           GRÁFICO DE DISTRIBUCIÓN POR CIUDAD (DONA)
           ================================================================== -->
      <div class="col-12 lg:col-6">
        <div class="surface-card shadow-1 border-round p-4 h-full">
          <div class="flex align-items-center justify-content-between mb-3">
            <h3 class="text-lg font-semibold text-900 m-0">Distribución por Ciudad</h3>
            <i class="pi pi-map text-500"></i>
          </div>

          @if (loadingCity) {
            <!-- SKELETON para el gráfico -->
            <div
              class="border-round flex justify-content-center align-items-center"
              style="height: 250px; background: var(--surface-200);">
              <i class="pi pi-spin pi-spinner text-3xl text-400"></i>
            </div>
          } @else if (cityChartData) {
            <!--
              baseChart - Directiva de ng2-charts

              [data]     - Datos a graficar (labels + datasets)
              [type]     - Tipo de gráfico ('doughnut', 'bar', 'pie', 'line')
              [options]  - Configuración del gráfico (leyenda, tooltips, ejes)

              doughnut es como pie pero con un agujero en el centro,
              más moderno y permite mostrar el total en el medio.
            -->
            <div style="height: 250px;">
              <canvas
                baseChart
                [data]="cityChartDataForChart"
                [type]="cityChartType"
                [options]="chartOptions"
                [plugins]="chartPlugins">
              </canvas>
            </div>
          } @else {
            <div class="text-center text-500 p-4">
              <i class="pi pi-chart-pie text-2xl mb-2"></i>
              <p>No hay datos disponibles</p>
            </div>
          }
        </div>
      </div>

      <!-- ==================================================================
           GRÁFICO DE DISTRIBUCIÓN POR TIPO (BARRAS)
           ================================================================== -->
      <div class="col-12 lg:col-6">
        <div class="surface-card shadow-1 border-round p-4 h-full">
          <div class="flex align-items-center justify-content-between mb-3">
            <h3 class="text-lg font-semibold text-900 m-0">Distribución por Tipo</h3>
            <i class="pi pi-th-large text-500"></i>
          </div>

          @if (loadingType) {
            <div
              class="border-round flex justify-content-center align-items-center"
              style="height: 250px; background: var(--surface-200);">
              <i class="pi pi-spin pi-spinner text-3xl text-400"></i>
            </div>
          } @else if (typeChartData) {
            <div style="height: 250px;">
              <canvas
                baseChart
                [data]="typeChartDataForChart"
                [type]="typeChartType"
                [options]="barChartOptions"
                [plugins]="chartPlugins">
              </canvas>
            </div>
          } @else {
            <div class="text-center text-500 p-4">
              <i class="pi pi-chart-bar text-2xl mb-2"></i>
              <p>No hay datos disponibles</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class PropertyDistributionComponent {
  // ==========================================================================
  // INPUTS - Datos del store
  // ==========================================================================

  /** Datos transformados para el gráfico de ciudades (de selectCityChartData) */
  @Input() cityChartData: ChartDataResult | null = null;

  /** Datos transformados para el gráfico de tipos (de selectTypeChartData) */
  @Input() typeChartData: ChartDataResult | null = null;

  /** Estado de carga individual por sección */
  @Input() loadingCity = false;
  @Input() loadingType = false;

  // ==========================================================================
  // CONFIGURACIÓN DE CHART.JS
  // ==========================================================================

  /**
   * Tipo de gráfico para ciudades: 'doughnut' (dona)
   *
   * ChartType es un tipo de Chart.js que define el tipo de visualización.
   */
  cityChartType: ChartType = 'doughnut';

  /** Tipo de gráfico para tipos de propiedad: 'bar' (barras) */
  typeChartType: ChartType = 'bar';

  /**
   * Datos para el gráfico de dona (sin type ni options, solo data).
   *
   * BaseChartDirective [data] espera ChartData:
   * { labels: string[], datasets: [...] }
   *
   * Lo separamos de ChartConfiguration que incluye type y options.
   */
  get cityChartDataForChart(): any {
    if (!this.cityChartData) return { labels: [], datasets: [] };
    return {
      labels: this.cityChartData.labels,
      datasets: this.cityChartData.datasets,
    };
  }

  /** Datos para el gráfico de barras */
  get typeChartDataForChart(): any {
    if (!this.typeChartData) return { labels: [], datasets: [] };
    return {
      labels: this.typeChartData.labels,
      datasets: this.typeChartData.datasets,
    };
  }

  /**
   * Opciones para el gráfico de dona.
   *
   * responsive: El gráfico se redimensiona con su contenedor.
   * maintainAspectRatio: false permite controlar la altura via CSS.
   * plugins.legend.position: Posición de la leyenda.
   */
  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 12,
          font: { size: 11 },
        },
      },
      tooltip: {
        callbacks: {
          /**
           * Callback para mostrar el valor y porcentaje en el tooltip.
           * Chart.js llama automáticamente a esta función por cada tooltip.
           */
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed;
            return `${label}: ${value} propiedades`;
          },
        },
      },
    },
  };

  /** Opciones para el gráfico de barras */
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Las barras son suficientemente claras
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y;
            return `${value} propiedades`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
      },
    },
  };

  /**
   * Plugins de Chart.js.
   *
   * Los plugins extienden la funcionalidad de Chart.js.
   * Aquí no usamos plugins custom, pero dejamos el array vacío
   * para poder agregarlos en el futuro (ej: etiquetas en las barras).
   */
  chartPlugins = [];
}
