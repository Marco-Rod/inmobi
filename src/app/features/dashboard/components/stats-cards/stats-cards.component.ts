/**
 * StatsCards Component
 *
 * Componente PRESENTACIONAL que muestra las 4 tarjetas de estadísticas
 * en la parte superior del dashboard.
 *
 * PATRÓN: Componente presentacional (Dumb Component)
 *
 * - Recibe datos via @Input()
 * - Emite eventos via @Output()
 * - NO conoce NgRx, ni servicios, ni estado global
 * - Solo se encarga de MOSTRAR datos y EMITIR eventos de usuario
 *
 * Ventajas:
 * ✅ Reutilizable en cualquier contexto
 * ✅ Fácil de testear (solo inputs/outputs)
 * ✅ Lógica de UI separada de lógica de negocio
 * ✅ Funciona con OnPush change detection
 *
 * Contraposición: DashboardPage es el componente CONTENEDOR (Smart Component)
 * que sí conoce NgRx y pasa los datos a este componente.
 */

import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardSummary } from '../../../../core/models';

/**
 * Modelo de una tarjeta de estadística
 *
 * Definimos la forma de cada tarjeta para que sea genérica y reutilizable.
 */
interface StatCard {
  title: string;
  value: number | string;
  icon: string;        // Clase de PrimeIcons
  color: string;       // Clase CSS de color Tailwind/PrimeNG
  bgColor: string;     // Color de fondo del icono
  subtitle?: string;   // Texto adicional debajo del valor
}

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  imports: [CommonModule],

  /**
   * OnPush Change Detection
   *
   * Angular tiene dos estrategias de detección de cambios:
   *
   * Default: Angular revisa el componente en CADA ciclo de change detection
   * (cualquier evento, timer, petición HTTP). Puede ser costoso.
   *
   * OnPush: Angular solo revisa el componente cuando:
   * - Un @Input() cambia su REFERENCIA (no su valor interno)
   * - Se dispara un evento interno
   * - El componente llama markForCheck()
   * - Un Observable al que está suscrito emite (con async pipe)
   *
   * Para que OnPush funcione correctamente, los @Input deben ser INMUTABLES.
   * Si mutas el objeto del input, OnPush no detecta el cambio.
   * Esto se alinea perfectamente con NgRx (siempre crea nuevos objetos).
   *
   * Resultado: Mejor performance, menos ciclos de change detection.
   */
  changeDetection: ChangeDetectionStrategy.OnPush,

  template: `
    <!-- =====================================================================
         STATS CARDS GRID
         Muestra 4 tarjetas en un grid responsivo
         ===================================================================== -->
    <div class="grid">
      @if (loading) {
        <!-- SKELETON LOADER: Se muestra mientras cargan los datos -->
        @for (item of [1, 2, 3, 4]; track item) {
          <div class="col-12 md:col-6 lg:col-3">
            <div class="surface-card shadow-1 p-3 border-round">
              <div class="flex justify-content-between mb-3">
                <!-- Skeleton para el título -->
                <div
                  class="border-round"
                  style="width: 8rem; height: 1rem; background: var(--surface-200);">
                </div>
                <!-- Skeleton para el icono -->
                <div
                  class="border-circle"
                  style="width: 2.5rem; height: 2.5rem; background: var(--surface-200);">
                </div>
              </div>
              <!-- Skeleton para el valor -->
              <div
                class="border-round mb-2"
                style="width: 5rem; height: 1.5rem; background: var(--surface-200);">
              </div>
            </div>
          </div>
        }
      } @else if (summary) {
        <!-- TARJETAS REALES: Se muestran cuando hay datos -->
        @for (card of cards; track card.title) {
          <div class="col-12 md:col-6 lg:col-3">
            <!--
              surface-card: Color de fondo del tema (claro/oscuro automático)
              shadow-1: Sombra sutil de PrimeNG
              border-round: Bordes redondeados
              p-3: Padding de 1.5rem (PrimeFlex)
            -->
            <div class="surface-card shadow-1 border-round p-3">
              <div class="flex justify-content-between align-items-center mb-3">
                <!-- Título de la tarjeta -->
                <span class="text-500 font-medium text-sm">{{ card.title }}</span>

                <!-- Icono con fondo de color -->
                <div
                  class="flex align-items-center justify-content-center border-round"
                  [style.background]="card.bgColor"
                  style="width: 2.5rem; height: 2.5rem;">
                  <i [class]="card.icon + ' text-xl'" [style.color]="card.color"></i>
                </div>
              </div>

              <!-- Valor principal -->
              <div class="text-900 font-bold text-2xl mb-1">
                {{ card.value }}
              </div>

              <!-- Subtítulo opcional -->
              @if (card.subtitle) {
                <span class="text-400 text-sm">{{ card.subtitle }}</span>
              }
            </div>
          </div>
        }
      } @else {
        <!-- ESTADO VACÍO: Cuando no hay datos y no está cargando -->
        <div class="col-12">
          <div class="surface-card shadow-1 border-round p-4 text-center text-500">
            <i class="pi pi-info-circle text-2xl mb-2"></i>
            <p>No hay datos disponibles</p>
          </div>
        </div>
      }
    </div>
  `,
})
export class StatsCardsComponent {
  /**
   * @Input() - Datos del resumen del dashboard
   *
   * El componente contenedor (DashboardPage) obtiene estos datos del store
   * y los pasa aquí. Este componente no sabe de dónde vienen.
   *
   * null indica que los datos aún no han cargado.
   */
  @Input() summary: DashboardSummary | null = null;

  /**
   * @Input() - Estado de carga
   *
   * Cuando true, se muestra el skeleton loader.
   * Cuando false y summary es null, se muestra el estado vacío.
   */
  @Input() loading = false;

  /**
   * Getter: Genera el array de tarjetas a partir del summary
   *
   * Usamos un getter en lugar de ngOnChanges para mantener el código simple.
   * El getter se recalcula automáticamente cuando Angular accede a él durante
   * el render, después de que OnPush haya detectado un cambio en @Input.
   *
   * Alternativa con Signal (Angular 17+):
   * ```typescript
   * cards = computed(() => this.generateCards(this.summary()));
   * ```
   */
  get cards(): StatCard[] {
    if (!this.summary) return [];

    return [
      {
        title: 'Total Propiedades',
        value: this.summary.totalProperties,
        icon: 'pi pi-home',
        color: '#3B82F6',
        bgColor: '#EFF6FF',
        subtitle: 'En el sistema',
      },
      {
        title: 'Disponibles',
        value: this.summary.availableProperties,
        icon: 'pi pi-check-circle',
        color: '#10B981',
        bgColor: '#ECFDF5',
        subtitle: `${this.getPercentage(this.summary.availableProperties, this.summary.totalProperties)}% del total`,
      },
      {
        title: 'Vendidas',
        value: this.summary.soldProperties,
        icon: 'pi pi-dollar',
        color: '#F59E0B',
        bgColor: '#FFFBEB',
        subtitle: 'Este período',
      },
      {
        title: 'Precio Promedio',
        value: this.formatPrice(this.summary.averagePrice, this.summary.currency),
        icon: 'pi pi-chart-line',
        color: '#8B5CF6',
        bgColor: '#F5F3FF',
        subtitle: 'Valor de mercado',
      },
    ];
  }

  /** Calcula porcentaje redondeado */
  private getPercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  /** Formatea precio con símbolo de moneda */
  private formatPrice(price: number, currency: string): string {
    const symbol = currency === 'MXN' ? '$' : currency === 'USD' ? 'US$' : '$';
    if (price >= 1_000_000) {
      return `${symbol}${(price / 1_000_000).toFixed(1)}M`;
    }
    if (price >= 1_000) {
      return `${symbol}${(price / 1_000).toFixed(0)}K`;
    }
    return `${symbol}${price}`;
  }
}
