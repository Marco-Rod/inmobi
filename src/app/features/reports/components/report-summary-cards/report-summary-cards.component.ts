/**
 * ReportSummaryCards Component (Dumb)
 *
 * Muestra métricas clave del reporte en tarjetas con tendencia.
 * Similar a StatsCards del dashboard pero con datos más detallados
 * e indicadores de cambio (↑↓) cuando hay comparación con período anterior.
 */

import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardSummary } from '../../../../core/models';

interface ReportCard {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  iconBg: string;
}

@Component({
  selector: 'app-report-summary-cards',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,

  template: `
    <div class="grid">
      @if (loading) {
        @for (item of [1, 2, 3, 4, 5, 6]; track item) {
          <div class="col-12 md:col-6 lg:col-4">
            <div class="surface-card shadow-1 border-round p-3">
              <div class="flex justify-content-between mb-3">
                <div class="border-round" style="width: 7rem; height: 1rem; background: var(--surface-200);"></div>
                <div class="border-circle" style="width: 2.5rem; height: 2.5rem; background: var(--surface-200);"></div>
              </div>
              <div class="border-round" style="width: 5rem; height: 1.5rem; background: var(--surface-200);"></div>
            </div>
          </div>
        }
      } @else if (summary) {
        @for (card of cards; track card.title) {
          <div class="col-12 md:col-6 lg:col-4">
            <div class="surface-card shadow-1 border-round p-3">
              <div class="flex justify-content-between align-items-center mb-3">
                <span class="text-500 font-medium text-sm">{{ card.title }}</span>
                <div
                  class="flex align-items-center justify-content-center border-circle"
                  [style.background]="card.iconBg"
                  style="width: 2.5rem; height: 2.5rem;">
                  <i [class]="card.icon + ' text-xl'" [style.color]="card.iconColor"></i>
                </div>
              </div>
              <div class="text-900 font-bold text-2xl mb-1">{{ card.value }}</div>
              <span class="text-400 text-sm">{{ card.subtitle }}</span>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class ReportSummaryCardsComponent {
  @Input() summary: DashboardSummary | null = null;
  @Input() loading = false;

  get cards(): ReportCard[] {
    if (!this.summary) return [];

    const currencySymbol = this.summary.currency === 'MXN' ? '$' : 'US$';
    const fmt = (n: number) => n.toLocaleString('es-MX');
    const fmtPrice = (n: number) => {
      if (n >= 1_000_000) return `${currencySymbol}${(n / 1_000_000).toFixed(1)}M`;
      if (n >= 1_000) return `${currencySymbol}${(n / 1_000).toFixed(0)}K`;
      return `${currencySymbol}${fmt(n)}`;
    };

    return [
      {
        title: 'Total Propiedades',
        value: fmt(this.summary.totalProperties),
        subtitle: 'Registradas en el sistema',
        icon: 'pi pi-building',
        iconColor: '#3B82F6',
        iconBg: '#EFF6FF',
      },
      {
        title: 'Disponibles',
        value: fmt(this.summary.availableProperties),
        subtitle: `${this.pct(this.summary.availableProperties)}% del total`,
        icon: 'pi pi-check-circle',
        iconColor: '#10B981',
        iconBg: '#ECFDF5',
      },
      {
        title: 'Vendidas',
        value: fmt(this.summary.soldProperties),
        subtitle: `${this.pct(this.summary.soldProperties)}% del total`,
        icon: 'pi pi-dollar',
        iconColor: '#F59E0B',
        iconBg: '#FFFBEB',
      },
      {
        title: 'Rentadas',
        value: fmt(this.summary.rentedProperties),
        subtitle: `${this.pct(this.summary.rentedProperties)}% del total`,
        icon: 'pi pi-key',
        iconColor: '#8B5CF6',
        iconBg: '#F5F3FF',
      },
      {
        title: 'En Negociación',
        value: fmt(this.summary.negotiatingProperties),
        subtitle: `${this.pct(this.summary.negotiatingProperties)}% del total`,
        icon: 'pi pi-comments',
        iconColor: '#6366F1',
        iconBg: '#EEF2FF',
      },
      {
        title: 'Precio Promedio',
        value: fmtPrice(this.summary.averagePrice),
        subtitle: this.summary.totalInventoryValue
          ? `Inventario: ${fmtPrice(this.summary.totalInventoryValue)}`
          : 'Valor de mercado',
        icon: 'pi pi-chart-line',
        iconColor: '#EC4899',
        iconBg: '#FDF2F8',
      },
    ];
  }

  private pct(value: number): number {
    if (!this.summary || this.summary.totalProperties === 0) return 0;
    return Math.round((value / this.summary.totalProperties) * 100);
  }
}
