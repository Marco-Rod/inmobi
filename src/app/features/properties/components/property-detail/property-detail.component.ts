/**
 * PropertyDetailComponent (Dumb Component)
 *
 * Vista de detalle de una propiedad individual.
 * Muestra todos los datos de la propiedad en formato de tarjeta informativa.
 *
 * PATRÓN: Componente presentacional puro
 * - Recibe la propiedad via @Input()
 * - Emite eventos de acción via @Output()
 * - Sin dependencias de NgRx ni servicios
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Property } from '../../../../core/models';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule],
  changeDetection: ChangeDetectionStrategy.OnPush,

  template: `
    @if (property) {
      <!-- CONTENEDOR PRINCIPAL -->
      <div class="surface-card shadow-1 border-round p-4">

        <!-- HEADER: imagen + título + estado -->
        <div class="flex flex-column md:flex-row gap-4 mb-4">
          <!-- IMAGEN (o placeholder) -->
          <div class="flex-shrink-0">
            @if (property.imageUrl) {
              <img
                [src]="property.imageUrl"
                [alt]="property.title"
                class="border-round"
                style="width: 20rem; height: 14rem; object-fit: cover;">
            } @else {
              <div
                class="flex align-items-center justify-content-center border-round surface-ground"
                style="width: 20rem; height: 14rem;">
                <i class="pi pi-image text-4xl text-400"></i>
              </div>
            }
          </div>

          <!-- INFO PRINCIPAL -->
          <div class="flex-1">
            <div class="flex justify-content-between align-items-start mb-2">
              <h2 class="text-2xl font-bold text-900 m-0">{{ property.title }}</h2>
              <p-tag
                [value]="getStatusLabel(property.status)"
                [severity]="getStatusSeverity(property.status)">
              </p-tag>
            </div>

            <p class="text-700 mb-3">{{ property.description }}</p>

            <!-- PRECIO DESTACADO -->
            <div class="flex align-items-center gap-3 mb-3">
              <span class="text-3xl font-bold text-primary">
                {{ formatCurrency(property.price, property.currency) }}
              </span>
              <p-tag
                [value]="property.operation === 'sale' ? 'Venta' : 'Renta'"
                [severity]="property.operation === 'sale' ? 'info' : 'success'">
              </p-tag>
            </div>

            <!-- UBICACIÓN -->
            <div class="flex align-items-center gap-2 text-700">
              <i class="pi pi-map-marker text-primary"></i>
              <span>{{ property.city }}, {{ property.state }}</span>
            </div>
          </div>
        </div>

        <!-- SEPARADOR -->
        <hr class="surface-border my-4 border-none border-top-1">

        <!-- CARACTERÍSTICAS EN GRID -->
        <div class="grid">
          <!-- Tipo -->
          <div class="col-12 md:col-6 lg:col-3">
            <div class="flex align-items-center gap-3">
              <div class="flex align-items-center justify-content-center border-circle"
                   style="width: 2.5rem; height: 2.5rem; background: #EFF6FF;">
                <i class="pi pi-home text-primary"></i>
              </div>
              <div>
                <div class="text-500 text-sm">Tipo</div>
                <div class="font-semibold text-900">{{ getPropertyTypeLabel(property.propertyType) }}</div>
              </div>
            </div>
          </div>

          <!-- Recámaras -->
          <div class="col-12 md:col-6 lg:col-3">
            <div class="flex align-items-center gap-3">
              <div class="flex align-items-center justify-content-center border-circle"
                   style="width: 2.5rem; height: 2.5rem; background: #ECFDF5;">
                <i class="pi pi-bed" style="color: #10B981;"></i>
              </div>
              <div>
                <div class="text-500 text-sm">Recámaras</div>
                <div class="font-semibold text-900">{{ property.bedrooms }}</div>
              </div>
            </div>
          </div>

          <!-- Baños -->
          <div class="col-12 md:col-6 lg:col-3">
            <div class="flex align-items-center gap-3">
              <div class="flex align-items-center justify-content-center border-circle"
                   style="width: 2.5rem; height: 2.5rem; background: #FFFBEB;">
                <i class="pi pi-bathroom" style="color: #F59E0B;"></i>
              </div>
              <div>
                <div class="text-500 text-sm">Baños</div>
                <div class="font-semibold text-900">{{ property.bathrooms }}</div>
              </div>
            </div>
          </div>

          <!-- Superficie -->
          <div class="col-12 md:col-6 lg:col-3">
            <div class="flex align-items-center gap-3">
              <div class="flex align-items-center justify-content-center border-circle"
                   style="width: 2.5rem; height: 2.5rem; background: #F5F3FF;">
                <i class="pi pi-chart-bar" style="color: #8B5CF6;"></i>
              </div>
              <div>
                <div class="text-500 text-sm">Superficie</div>
                <div class="font-semibold text-900">{{ property.areaM2 }} m²</div>
              </div>
            </div>
          </div>
        </div>

        <!-- METADATA -->
        <hr class="surface-border my-4 border-none border-top-1">
        <div class="grid">
          <div class="col-12 md:col-6">
            <div class="text-500 text-sm">ID de la propiedad</div>
            <div class="font-semibold text-900">#{{ property.id }}</div>
          </div>
          <div class="col-12 md:col-6">
            <div class="text-500 text-sm">Fecha de registro</div>
            <div class="font-semibold text-900">{{ formatDate(property.createdAt) }}</div>
          </div>
          <div class="col-12 md:col-6">
            <div class="text-500 text-sm">Última actualización</div>
            <div class="font-semibold text-900">{{ formatDate(property.updatedAt) }}</div>
          </div>
        </div>

        <!-- BOTONES DE ACCIÓN -->
        <div class="flex gap-2 justify-content-end mt-4">
          <p-button
            label="Volver"
            icon="pi pi-arrow-left"
            severity="secondary"
            [outlined]="true"
            (onClick)="back.emit()">
          </p-button>
          <p-button
            label="Editar"
            icon="pi pi-pencil"
            severity="warn"
            (onClick)="edit.emit(property)">
          </p-button>
        </div>
      </div>
    } @else {
      <!-- ESTADO: sin propiedad -->
      <div class="surface-card shadow-1 border-round p-4 text-center">
        <i class="pi pi-search text-4xl text-400 mb-3"></i>
        <p class="text-500 text-lg">No se encontró la propiedad</p>
      </div>
    }
  `,
})
export class PropertyDetailComponent {
  /** Propiedad a mostrar. null = no encontrada */
  @Input() property: Property | null = null;

  /** Usuario hace click en "Volver" */
  @Output() back = new EventEmitter<void>();

  /** Usuario hace click en "Editar" */
  @Output() edit = new EventEmitter<Property>();

  /** Formatea precio con moneda */
  formatCurrency(price: number, currency: string): string {
    const symbol = currency === 'MXN' ? '$' : 'US$';
    return `${symbol}${price.toLocaleString('es-MX')}`;
  }

  /** Etiqueta legible del tipo */
  getPropertyTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      house: 'Casa',
      apartment: 'Departamento',
      land: 'Terreno',
      commercial: 'Local comercial',
      office: 'Oficina',
    };
    return labels[type] ?? type;
  }

  /** Etiqueta legible del estado */
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      available: 'Disponible',
      sold: 'Vendida',
      rented: 'Rentada',
      negotiating: 'En negociación',
    };
    return labels[status] ?? status;
  }

  /** Severity de PrimeNG para el Tag */
  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'secondary' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'secondary'> = {
      available: 'success',
      sold: 'info',
      rented: 'warn',
      negotiating: 'secondary',
    };
    return severities[status] ?? 'secondary';
  }

  /** Formatea fecha ISO a formato legible en español */
  formatDate(date: Date | string): string {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
