/**
 * InventoryBreakdown Component (Dumb)
 *
 * Dos gráficos lado a lado:
 * 1. Distribución por estado (doughnut) - available/sold/rented/negotiating
 * 2. Top ciudades por número de propiedades (barras horizontales)
 *
 * Ambos gráficos muestran la misma data de diferentes ángulos.
 */

import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import {
  DashboardSummary,
  CityDistribution,
} from '../../../../core/models';

@Component({
  selector: 'app-inventory-breakdown',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,

  template: `
    <div class="grid">
      <!-- DISTRIBUCIÓN POR ESTADO (DONA) -->
      <div class="col-12 lg:col-6">
        <div class="surface-card shadow-1 border-round p-4 h-full">
          <div class="flex justify-content-between align-items-center mb-3">
            <h3 class="text-lg font-semibold text-900 m-0">Distribución por Estado</h3>
            <i class="pi pi-tags text-500"></i>
          </div>

          @if (loading) {
            <div class="border-round flex justify-content-center align-items-center"
                 style="height: 300px; background: var(--surface-200);">
              <i class="pi pi-spin pi-spinner text-3xl text-400"></i>
            </div>
          } @else if (summary) {
            <div style="height: 300px;">
              <canvas
                baseChart
                [data]="statusChartData"
                [type]="statusChartType"
                [options]="statusChartOptions">
              </canvas>
            </div>

            <!-- LEYENDA NUMÉRICA -->
            <div class="flex justify-content-around mt-3">
              @for (item of statusLegend; track item.label) {
                <div class="text-center">
                  <div class="flex align-items-center justify-content-center gap-1 mb-1">
                    <span class="border-circle" [style.background]="item.color" style="width: 0.75rem; height: 0.75rem; display: inline-block;"></span>
                    <span class="text-500 text-sm">{{ item.label }}</span>
                  </div>
                  <div class="font-bold text-900">{{ item.count }}</div>
                </div>
              }
            </div>
          } @else {
            <div class="text-center text-500 py-6">
              <i class="pi pi-chart-pie text-3xl mb-2"></i>
              <p>Sin datos</p>
            </div>
          }
        </div>
      </div>

      <!-- TOP CIUDADES (BARRAS HORIZONTALES) -->
      <div class="col-12 lg:col-6">
        <div class="surface-card shadow-1 border-round p-4 h-full">
          <div class="flex justify-content-between align-items-center mb-3">
            <h3 class="text-lg font-semibold text-900 m-0">Top Ciudades</h3>
            <i class="pi pi-map text-500"></i>
          </div>

          @if (loading) {
            <div class="border-round flex justify-content-center align-items-center"
                 style="height: 300px; background: var(--surface-200);">
              <i class="pi pi-spin pi-spinner text-3xl text-400"></i>
            </div>
          } @else if (cities && cities.length > 0) {
            <div style="height: 300px;">
              <canvas
                baseChart
                [data]="cityChartData"
                [type]="cityChartType"
                [options]="cityChartOptions">
              </canvas>
            </div>
          } @else {
            <div class="text-center text-500 py-6">
              <i class="pi pi-map text-3xl mb-2"></i>
              <p>Sin datos</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class InventoryBreakdownComponent {
  @Input() summary: DashboardSummary | null = null;
  @Input() cities: CityDistribution[] | null = null;
  @Input() loading = false;

  // ========================================================================
  // GRÁFICO DE ESTADOS (DONA)
  // ========================================================================

  statusChartType: ChartType = 'doughnut';

  get statusChartData(): any {
    if (!this.summary) return { labels: [], datasets: [] };

    return {
      labels: ['Disponibles', 'Vendidas', 'Rentadas', 'En negociación'],
      datasets: [
        {
          data: [
            this.summary.availableProperties,
            this.summary.soldProperties,
            this.summary.rentedProperties,
            this.summary.negotiatingProperties,
          ],
          backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#6366F1'],
          hoverBackgroundColor: ['#059669', '#2563EB', '#D97706', '#4F46E5'],
          borderWidth: 2,
          borderColor: 'var(--surface-card, #fff)',
        },
      ],
    };
  }

  statusChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const total = this.summary?.totalProperties ?? 0;
            const value = ctx.parsed;
            const pct = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${ctx.label}: ${value} (${pct}%)`;
          },
        },
      },
    },
  };

  get statusLegend(): { label: string; count: number; color: string }[] {
    if (!this.summary) return [];
    return [
      { label: 'Disponibles', count: this.summary.availableProperties, color: '#10B981' },
      { label: 'Vendidas', count: this.summary.soldProperties, color: '#3B82F6' },
      { label: 'Rentadas', count: this.summary.rentedProperties, color: '#F59E0B' },
      { label: 'Negociando', count: this.summary.negotiatingProperties, color: '#6366F1' },
    ];
  }

  // ========================================================================
  // GRÁFICO DE CIUDADES (BARRAS HORIZONTALES)
  // ========================================================================

  /**
   * Tipo: 'bar' con indexAxis: 'y' para barras horizontales.
   * Chart.js 4+ controla la orientación con indexAxis en las opciones,
   * no con un tipo de gráfico separado.
   */
  cityChartType: ChartType = 'bar';

  get cityChartData(): any {
    if (!this.cities || this.cities.length === 0) {
      return { labels: [], datasets: [] };
    }

    // Tomar las top 8 ciudades para que el gráfico sea legible
    const top = [...this.cities]
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      labels: top.map((c) => c.city),
      datasets: [
        {
          label: 'Propiedades',
          data: top.map((c) => c.count),
          backgroundColor: top.map((_, i) => this.getBarColor(i)),
          borderRadius: 4,
          barThickness: 18,
        },
      ],
    };
  }

  cityChartOptions: ChartConfiguration['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.parsed.x} propiedades`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { precision: 0 },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      y: {
        grid: { display: false },
      },
    },
  };

  private getBarColor(index: number): string {
    const palette = [
      '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#06B6D4', '#F97316', '#6366F1',
    ];
    return palette[index % palette.length];
  }
}
