/**
 * PropertyListComponent (Dumb Component)
 *
 * Tabla de propiedades usando PrimeNG Table (p-table).
 *
 * RESPONSABILIDADES:
 * - Mostrar propiedades en una tabla con columnas
 * - Paginación controlada desde el store (no local)
 * - Emitir eventos al contenedor: editar, eliminar, ver detalle
 * - Skeleton loaders mientras carga
 *
 * NO RESPONSABLE DE:
 * - Cargar datos (lo hace el contenedor via NgRx)
 * - Navegar (lo hace el contenedor)
 * - Confirmar eliminación (lo hace el contenedor con un dialog)
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { Property } from '../../../../core/models';

/**
 * Información de paginación que el componente necesita.
 * Se pasa desde el store via el contenedor.
 */
export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalCount: number;
}

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, SkeletonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,

  template: `
    <!-- =====================================================================
         TABLA DE PROPIEDADES (PrimeNG p-table)
         ===================================================================== -->
    <p-table
      [value]="properties"
      [loading]="loading"
      [paginator]="true"
      [rows]="pagination?.pageSize ?? 10"
      [totalRecords]="pagination?.totalCount ?? 0"
      [first]="((pagination?.currentPage ?? 1) - 1) * (pagination?.pageSize ?? 10)"
      [rowsPerPageOptions]="[10, 20, 50]"
      [lazy]="true"
      (onLazyLoad)="onLazyLoad($event)"
      dataKey="id"
      styleClass="p-datatable-sm p-datatable-striped"
      [tableStyle]="{ 'min-width': '70rem' }">

      <!-- HEADER DE LA TABLA -->
      <ng-template #header let-columns>
        <tr>
          <th pSortableColumn="title">Título <p-sortIcon field="title"></p-sortIcon></th>
          <th>Tipo</th>
          <th>Operación</th>
          <th pSortableColumn="price">Precio <p-sortIcon field="price"></p-sortIcon></th>
          <th>Ubicación</th>
          <th>Estado</th>
          <th pSortableColumn="areaM2">m² <p-sortIcon field="areaM2"></p-sortIcon></th>
          <th class="text-center">Acciones</th>
        </tr>
      </ng-template>

      <!-- TEMPLATE DE CADA FILA -->
      <ng-template #body let-property>
        <tr>
          <!-- Título de la propiedad -->
          <td>
            <div class="font-semibold text-900">{{ property.title }}</div>
            <div class="text-500 text-sm">{{ property.bedrooms }} rec · {{ property.bathrooms }} baños</div>
          </td>

          <!-- Tipo de propiedad -->
          <td>
            <span class="text-700">{{ getPropertyTypeLabel(property.propertyType) }}</span>
          </td>

          <!-- Tipo de operación (Venta/Renta) -->
          <td>
            <p-tag
              [value]="property.operation === 'sale' ? 'Venta' : 'Renta'"
              [severity]="property.operation === 'sale' ? 'info' : 'success'">
            </p-tag>
          </td>

          <!-- Precio formateado -->
          <td class="font-bold">
            {{ formatCurrency(property.price, property.currency) }}
          </td>

          <!-- Ubicación -->
          <td>
            <div class="text-700">{{ property.city }}</div>
            <div class="text-500 text-sm">{{ property.state }}</div>
          </td>

          <!-- Estado con color codificado -->
          <td>
            <p-tag
              [value]="getStatusLabel(property.status)"
              [severity]="getStatusSeverity(property.status)">
            </p-tag>
          </td>

          <!-- Superficie -->
          <td>{{ property.areaM2 }} m²</td>

          <!-- Acciones: Ver, Editar, Eliminar -->
          <td class="text-center">
            <div class="flex gap-1 justify-content-center">
              <p-button
                icon="pi pi-eye"
                [text]="true"
                [rounded]="true"
                size="small"
                severity="info"
                (onClick)="view.emit(property)"
                pTooltip="Ver detalle">
              </p-button>
              <p-button
                icon="pi pi-pencil"
                [text]="true"
                [rounded]="true"
                size="small"
                severity="warn"
                (onClick)="edit.emit(property)"
                pTooltip="Editar">
              </p-button>
              <p-button
                icon="pi pi-trash"
                [text]="true"
                [rounded]="true"
                size="small"
                severity="danger"
                (onClick)="delete.emit(property)"
                pTooltip="Eliminar">
              </p-button>
            </div>
          </td>
        </tr>
      </ng-template>

      <!-- ESTADO VACÍO: cuando no hay propiedades -->
      <ng-template #emptymessage>
        <tr>
          <td colspan="8" class="text-center py-6">
            @if (loading) {
              <!-- SKELETON: filas fantasma mientras carga -->
              @for (row of [1, 2, 3, 4, 5]; track row) {
                <div class="flex align-items-center gap-3 py-2">
                  <p-skeleton width="12rem" height="1.5rem"></p-skeleton>
                  <p-skeleton width="6rem" height="1.5rem"></p-skeleton>
                  <p-skeleton width="5rem" height="1.5rem"></p-skeleton>
                  <p-skeleton width="8rem" height="1.5rem"></p-skeleton>
                </div>
              }
            } @else {
              <i class="pi pi-inbox text-4xl text-400 mb-3"></i>
              <p class="text-500 text-lg">No se encontraron propiedades</p>
            }
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class PropertyListComponent {
  // ==========================================================================
  // INPUTS - Datos del store
  // ==========================================================================

  /** Lista de propiedades a mostrar */
  @Input() properties: Property[] = [];

  /** Estado de carga */
  @Input() loading = false;

  /** Información de paginación */
  @Input() pagination: PaginationInfo | null = null;

  // ==========================================================================
  // OUTPUTS - Eventos al contenedor
  // ==========================================================================

  /** Usuario hace click en "Ver detalle" */
  @Output() view = new EventEmitter<Property>();

  /** Usuario hace click en "Editar" */
  @Output() edit = new EventEmitter<Property>();

  /** Usuario hace click en "Eliminar" */
  @Output() delete = new EventEmitter<Property>();

  /** Usuario cambia página o pageSize (lazy load) */
  @Output() pageChange = new EventEmitter<{ page: number; pageSize: number }>();

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  /**
   * Handler para lazy load del PrimeNG Table.
   *
   * p-table emite onLazyLoad cuando el usuario:
   * - Cambia de página
   * - Cambia el tamaño de página
   * - Ordena por una columna
   *
   * El evento contiene first (índice del primer elemento) y rows (pageSize).
   * Convertimos first a página (1-indexed) para el store.
   */
  onLazyLoad(event: any): void {
    const page = Math.floor(event.first / event.rows) + 1;
    const pageSize = event.rows;
    this.pageChange.emit({ page, pageSize });
  }

  // ==========================================================================
  // HELPERS DE FORMATEO
  // ==========================================================================

  /** Formatea precio con símbolo de moneda y separadores de miles */
  formatCurrency(price: number, currency: string): string {
    const symbol = currency === 'MXN' ? '$' : 'US$';
    return `${symbol}${price.toLocaleString('es-MX')}`;
  }

  /** Obtiene etiqueta legible del tipo de propiedad */
  getPropertyTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      house: 'Casa',
      apartment: 'Departamento',
      land: 'Terreno',
      commercial: 'Local',
      office: 'Oficina',
    };
    return labels[type] ?? type;
  }

  /** Obtiene etiqueta legible del estado */
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      available: 'Disponible',
      sold: 'Vendida',
      rented: 'Rentada',
      negotiating: 'Negociando',
    };
    return labels[status] ?? status;
  }

  /** Obtiene el severity de PrimeNG para el Tag del estado */
  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'secondary' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'secondary'> = {
      available: 'success',
      sold: 'info',
      rented: 'warn',
      negotiating: 'secondary',
    };
    return severities[status] ?? 'secondary';
  }
}
