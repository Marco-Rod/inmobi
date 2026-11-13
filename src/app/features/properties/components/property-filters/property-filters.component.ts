/**
 * PropertyFiltersComponent (Dumb Component)
 *
 * Barra de filtros reactivos para la tabla de propiedades.
 *
 * CONCEPTOS IMPORTANTES:
 *
 * 1. Filtros reactivos:
 *    Cada cambio en un filtro emite un evento al contenedor.
 *    El contenedor actualiza el store y recarga los datos.
 *
 * 2. Debounce en búsqueda de texto:
 *    El input de texto NO emite en cada tecla.
 *    El contenedor aplica debounceTime(300) para agrupar emisiones.
 *    Esto evita hacer una petición HTTP por cada tecla pulsada.
 *
 * 3. Filtros sincrónicos vs async:
 *    - Selects (tipo, operación, estado): Emiten inmediatamente
 *    - Input de texto: Emiten con debounce desde el contenedor
 *    - Rango de precio: Emiten cuando el usuario deja de escribir
 *
 * 4. Estado de filtros activos:
 *    El componente muestra un badge con el número de filtros activos
 *    y un botón para limpiar todos los filtros.
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { InputNumberModule } from 'primeng/inputnumber';

import {
  PropertyFilter,
  PropertyTypeLabels,
  PropertyTypes,
  OperationTypeLabels,
  OperationTypes,
  PropertyStatusLabels,
  PropertyStatuses,
} from '../../../../core/models';

/**
 * Modelo de evento que emite el componente cuando cambian los filtros.
 *
 * El contenedor recibe este objeto y decide qué hacer:
 * - Actualizar el store (setFilters)
 * - Recargar datos (loadProperties)
 * - Aplicar debounce (solo para search)
 */
export interface FilterChangeEvent {
  filter: keyof PropertyFilter;
  value: string | number | undefined;
}

@Component({
  selector: 'app-property-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    SelectModule,
    ButtonModule,
    BadgeModule,
    InputNumberModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,

  template: `
    <!-- =====================================================================
         BARRA DE FILTROS
         ===================================================================== -->
    <div class="surface-card shadow-1 border-round p-4 mb-4">

      <!-- HEADER: título + contador + limpiar -->
      <div class="flex justify-content-between align-items-center mb-3">
        <div class="flex align-items-center gap-2">
          <i class="pi pi-filter text-primary"></i>
          <h3 class="text-lg font-semibold text-900 m-0">Filtros</h3>
          @if (activeFilterCount > 0) {
            <p-badge [value]="activeFilterCount" severity="info"></p-badge>
          }
        </div>

        @if (hasActiveFilters) {
          <p-button
            label="Limpiar"
            icon="pi pi-times"
            [text]="true"
            size="small"
            severity="danger"
            (onClick)="clearAll.emit()">
          </p-button>
        }
      </div>

      <!-- GRID DE FILTROS -->
      <div class="grid">

        <!-- BÚSQUEDA DE TEXTO (con debounce desde el contenedor) -->
        <div class="col-12 md:col-6 lg:col-3">
          <label class="font-semibold text-sm mb-1 block">Buscar</label>
          <div class="p-inputgroup">
            <span class="p-inputgroup-addon">
              <i class="pi pi-search"></i>
            </span>
            <!--
              Usamos [(ngModel)] bidireccional + (ngModelChange) para emitir.
              El contenedor aplicará debounceTime a este evento.
            -->
            <input
              pInputText
              type="text"
              [ngModel]="filters?.search ?? ''"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Título, ciudad, descripción..."
              class="w-full">
          </div>
        </div>

        <!-- TIPO DE PROPIEDAD -->
        <div class="col-12 md:col-6 lg:col-2">
          <label class="font-semibold text-sm mb-1 block">Tipo</label>
          <p-select
            [ngModel]="filters?.propertyType ?? null"
            (ngModelChange)="onFilterChange('propertyType', $event)"
            [options]="typeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Todos"
            [showClear]="true"
            class="w-full">
          </p-select>
        </div>

        <!-- OPERACIÓN -->
        <div class="col-12 md:col-6 lg:col-2">
          <label class="font-semibold text-sm mb-1 block">Operación</label>
          <p-select
            [ngModel]="filters?.operation ?? null"
            (ngModelChange)="onFilterChange('operation', $event)"
            [options]="operationOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Todas"
            [showClear]="true"
            class="w-full">
          </p-select>
        </div>

        <!-- ESTADO -->
        <div class="col-12 md:col-6 lg:col-2">
          <label class="font-semibold text-sm mb-1 block">Estado</label>
          <p-select
            [ngModel]="filters?.status ?? null"
            (ngModelChange)="onFilterChange('status', $event)"
            [options]="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Todos"
            [showClear]="true"
            class="w-full">
          </p-select>
        </div>

        <!-- PRECIO MÍNIMO -->
        <div class="col-6 lg:col-2">
          <label class="font-semibold text-sm mb-1 block">Precio mín.</label>
          <p-inputNumber
            [ngModel]="filters?.minPrice ?? null"
            (ngModelChange)="onFilterChange('minPrice', $event)"
            mode="currency"
            currency="MXN"
            [min]="0"
            placeholder="0"
            class="w-full">
          </p-inputNumber>
        </div>

        <!-- PRECIO MÁXIMO -->
        <div class="col-6 lg:col-2">
          <label class="font-semibold text-sm mb-1 block">Precio máx.</label>
          <p-inputNumber
            [ngModel]="filters?.maxPrice ?? null"
            (ngModelChange)="onFilterChange('maxPrice', $event)"
            mode="currency"
            currency="MXN"
            [min]="0"
            placeholder="Sin límite"
            class="w-full">
          </p-inputNumber>
        </div>
      </div>

      <!-- CIUDAD (en su propia fila para más espacio) -->
      <div class="grid mt-2">
        <div class="col-12 md:col-6">
          <label class="font-semibold text-sm mb-1 block">Ciudad</label>
          <input
            pInputText
            type="text"
            [ngModel]="filters?.city ?? ''"
            (ngModelChange)="onFilterChange('city', $event)"
            placeholder="Ej: Guadalajara"
            class="w-full">
        </div>
      </div>
    </div>
  `,
})
export class PropertyFiltersComponent {
  // ==========================================================================
  // INPUTS
  // ==========================================================================

  /** Filtros actuales del store */
  @Input() filters: PropertyFilter | null = null;

  /** ¿Hay filtros activos? */
  @Input() hasActiveFilters = false;

  /** Número de filtros activos (para el badge) */
  @Input() activeFilterCount = 0;

  // ==========================================================================
  // OUTPUTS
  // ==========================================================================

  /**
   * Emite cuando cambia un filtro individual (no search).
   * El contenedor actualiza el store inmediatamente.
   */
  @Output() filterChange = new EventEmitter<FilterChangeEvent>();

  /**
   * Emite cuando cambia el texto de búsqueda.
   * El contenedor aplica debounceTime(300) antes de actualizar el store.
   * Este evento se separa de filterChange precisamente para aplicar debounce.
   */
  @Output() searchChange = new EventEmitter<string>();

  /** Emite cuando el usuario hace click en "Limpiar" */
  @Output() clearAll = new EventEmitter<void>();

  // ==========================================================================
  // OPCIONES PARA SELECTS
  // ==========================================================================

  typeOptions = PropertyTypes.map((t) => ({
    label: PropertyTypeLabels[t],
    value: t,
  }));

  operationOptions = OperationTypes.map((o) => ({
    label: OperationTypeLabels[o],
    value: o,
  }));

  statusOptions = PropertyStatuses.map((s) => ({
    label: PropertyStatusLabels[s],
    value: s,
  }));

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  /**
   * Handler para cambios en selects, inputs numéricos y texto de ciudad.
   *
   * IMPORTANTE: Aquí no aplicamos debounce.
   * Los selects cambian de golpe (el usuario selecciona un valor).
   * El debounce solo tiene sentido para el input de búsqueda de texto libre
   * donde el usuario escribe carácter por carácter.
   */
  onFilterChange(
    filter: keyof PropertyFilter,
    value: string | number | undefined
  ): void {
    this.filterChange.emit({ filter, value });
  }

  /**
   * Handler específico para el input de búsqueda.
   *
   * Se separa de onFilterChange porque necesita debounce.
   * El contenedor recibirá este evento y aplicará debounceTime(300)
   * antes de actualizar el store y disparar la petición HTTP.
   *
   * Sin debounce: Si el usuario escribe "casa" rápido, haría 4 peticiones:
   *   "c" → HTTP → "ca" → HTTP → "cas" → HTTP → "casa" → HTTP
   * Con debounce(300): Si el usuario escribe "casa" en menos de 300ms, hace 1:
   *   "casa" → HTTP (una sola petición)
   */
  onSearchChange(value: string): void {
    this.searchChange.emit(value);
  }
}
