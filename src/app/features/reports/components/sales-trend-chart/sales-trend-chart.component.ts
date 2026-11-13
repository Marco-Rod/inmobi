/**
 * SalesTrendChart Component (Dumb)
 *
 * Gráfico de líneas que muestra la evolución de ventas y rentas mensuales.
 * Incluye dataset combinado: barras (totales) + línea (tendencia).
 *
 * PATRÓN: Mixed Chart de Chart.js
 * Chart.js permite combinar múltiples tipos en un solo gráfico.
 * Aquí usamos barras para ventas/rentas y una línea para el total.
 */

import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { MonthlyStats } from '../../../../core/models';

@Component({
  selector: 'app-sales-trend-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,

  template: `
    <div class="surface-card shadow-1 border-round p-4 h-full">
      <div class="flex justify-content-between align-items-center mb-3">
        <h3 class="text-lg font-semibold text-900 m-0">Tendencia de Ventas y Rentas</h3>
        <i class="pi pi-chart-line text-500"></i>
      </div>

      @if (loading) {
        <div class="border-round flex justify-content-center align-items-center"
             style="height: 350px; background: var(--surface-200);">
          <i class="pi pi-spin pi-spinner text-3xl text-400"></i>
        </div>
      } @else if (stats && stats.length > 0) {
        <div style="height: 350px;">
          <canvas
            baseChart
            [data]="chartData"
            [type]="chartType"
            [options]="chartOptions">
          </canvas>
        </div>

        <!-- RESUMEN NUMÉRICO DEBAJO DEL GRÁFICO -->
        <div class="grid mt-3">
          <div class="col-4 text-center">
            <div class="text-500 text-sm">Total ventas</div>
            <div class="text-xl font-bold text-blue-500">{{ totalSales }}</div>
          </div>
          <div class="col-4 text-center">
            <div class="text-500 text-sm">Total rentas</div>
            <div class="text-xl font-bold text-green-500">{{ totalRentals }}</div>
          </div>
          <div class="col-4 text-center">
            <div class="text-500 text-sm">Promedio/mes</div>
            <div class="text-xl font-bold text-900">{{ avgPerMonth }}</div>
          </div>
        </div>
      } @else {
        <div class="text-center text-500 py-6">
          <i class="pi pi-chart-line text-3xl mb-2"></i>
          <p>No hay datos disponibles</p>
        </div>
      }
    </div>
  `,
})
export class SalesTrendChartComponent {
  @Input() stats: MonthlyStats[] | null = null;
  @Input() loading = false;

  /**
   * Tipo de gráfico: 'bar' con dataset mixto.
   * Chart.js permite tener datasets de tipo 'line' dentro de un gráfico 'bar'
   * para crear visualizaciones combinadas.
   */
  chartType: ChartType = 'bar';

  /** Datos formateados para Chart.js (separan data de opciones) */
  get chartData(): any {
    if (!this.stats || this.stats.length === 0) {
      return { labels: [], datasets: [] };
    }

    const labels = this.stats.map((s) => {
      if (s.monthName) return s.monthName;
      const [year, month] = s.month.split('-');
      const date = new Date(Number(year), Number(month) - 1);
      return date.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' });
    });

    return {
      labels,
      datasets: [
        {
          type: 'bar' as const,
          label: 'Ventas',
          data: this.stats.map((s) => s.sales),
          backgroundColor: '#3B82F6',
          borderColor: '#2563EB',
          borderWidth: 1,
          yAxisID: 'y',
        },
        {
          type: 'bar' as const,
          label: 'Rentas',
          data: this.stats.map((s) => s.rentals),
          backgroundColor: '#10B981',
          borderColor: '#059669',
          borderWidth: 1,
          yAxisID: 'y',
        },
        {
          type: 'line' as const,
          label: 'Total operaciones',
          data: this.stats.map((s) => s.sales + s.rentals),
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.3,
          yAxisID: 'y',
        },
      ],
    };
  }

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { padding: 12, font: { size: 11 } },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  get totalSales(): number {
    return this.stats?.reduce((sum, s) => sum + s.sales, 0) ?? 0;
  }

  get totalRentals(): number {
    return this.stats?.reduce((sum, s) => sum + s.rentals, 0) ?? 0;
  }

  get avgPerMonth(): number {
    if (!this.stats || this.stats.length === 0) return 0;
    const total = this.totalSales + this.totalRentals;
    return Math.round(total / this.stats.length);
  }
}
