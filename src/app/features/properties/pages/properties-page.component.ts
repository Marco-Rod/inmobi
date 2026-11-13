/**
 * PropertiesPage Component (Smart Component)
 *
 * Contenedor principal del módulo de propiedades.
 * Gestiona la lista de propiedades con NgRx y un ConfirmationDialog para eliminar.
 *
 * RESPONSABILIDADES:
 * - Despachar actions de NgRx (loadProperties, deleteProperty)
 * - Leer datos del store con selectores
 * - Manejar navegación a crear/editar/detalle
 * - Confirmar eliminación con PrimeNG ConfirmDialog
 * - Pasar datos a los componentes dumb (PropertyListComponent)
 *
 * FLUJO DE DATOS:
 * Store → selectores → PropertiesPage (vm$) → @Input → PropertyList → UI
 * UI → @Output → PropertiesPage → dispatch action → Effect → HTTP → Reducer → Store
 */

import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { PropertyListComponent, PaginationInfo } from '../components/property-list/property-list.component';
import { PropertyFiltersComponent, FilterChangeEvent } from '../components/property-filters/property-filters.component';
import { PropertyFilterService } from '../services/property-filter.service';
import { Property, PropertyFilter } from '../../../core/models';
import * as PropertyActions from '../store/property.actions';
import {
  selectPropertyListViewModel,
  selectError,
  selectFilters,
} from '../store/property.selectors';

@Component({
  selector: 'app-properties-page',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    ButtonModule,
    ConfirmDialogModule,
    ToastModule,
    PropertyListComponent,
    PropertyFiltersComponent,
  ],
  providers: [ConfirmationService, MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,

  template: `
    <!-- TOAST para notificaciones -->
    <p-toast></p-toast>

    <!-- CONFIRM DIALOG para eliminación -->
    <p-confirmDialog
      header="Confirmar eliminación"
      icon="pi pi-exclamation-triangle"
      acceptLabel="Sí, eliminar"
      rejectLabel="Cancelar"
      acceptStyleClass="p-button-danger">
    </p-confirmDialog>

    <!-- HEADER -->
    <div class="flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="text-3xl font-bold text-900 mb-1">Propiedades</h1>
        <p class="text-500 m-0">Gestiona tu inventario de propiedades</p>
      </div>

      <p-button
        label="Nueva propiedad"
        icon="pi pi-plus"
        (onClick)="navigateToCreate()">
      </p-button>
    </div>

    <!-- CONTENIDO: Tabla de propiedades -->
    <ng-container *ngIf="vm$ | async as vm">
      <!-- ERROR GLOBAL -->
      @if (vm.error) {
        <div class="surface-card shadow-1 border-round p-3 mb-4 border-1 border-red-500">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-exclamation-triangle text-red-500"></i>
            <span class="text-red-500">{{ vm.error }}</span>
          </div>
        </div>
      }

      <!-- FILTROS REACTIVOS -->
      <app-property-filters
        [filters]="vm.filters"
        [hasActiveFilters]="vm.hasActiveFilters"
        [activeFilterCount]="vm.activeFilterCount"
        (filterChange)="onFilterChange($event)"
        (searchChange)="onSearchChange($event)"
        (clearAll)="onClearFilters()">
      </app-property-filters>

      <!-- TABLA -->
      <app-property-list
        [properties]="vm.properties"
        [loading]="vm.loading"
        [pagination]="getPaginationInfo(vm)"
        (view)="onView($event)"
        (edit)="onEdit($event)"
        (delete)="onDelete($event)"
        (pageChange)="onPageChange($event)">
      </app-property-list>
    </ng-container>
  `,
})
export class PropertiesPageComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  /**
   * Servicio de filtros que encapsula la lógica de debounce y normalización.
   *
   * Inyectado con inject(). Proporciona:
   * - searchDebounced$: Observable con debounce de 300ms para la búsqueda
   * - updateFilter(): Actualiza un filtro inmutablemente
   * - resetFilters(): Resetea todos los filtros
   */
  private readonly filterService = inject(PropertyFilterService);

  /**
   * ViewModel Observable de la lista de propiedades.
   *
   * Combina: properties, loading, error, pagination, hasActiveFilters, isEmpty.
   * Una sola suscripción via async pipe en el template.
   */
  vm$: Observable<ReturnType<typeof selectPropertyListViewModel>> =
    this.store.select(selectPropertyListViewModel);

  // Escuchamos errores para mostrarlos como toast
  private readonly error$ = this.store.select(selectError);

  /**
   * Filtros actuales del store.
   * Necesario para construir los nuevos filtros inmutablemente.
   */
  private currentFilters: PropertyFilter = {};

  /** Subject para cancelar suscripciones al destruir el componente */
  private readonly destroy$ = new Subject<void>();

  // ==========================================================================
  // LIFECYCLE
  // ==========================================================================

  ngOnInit(): void {
    console.log('🏠 [PropertiesPage] Cargando propiedades...');
    this.store.dispatch(PropertyActions.loadProperties({}));

    // Suscribirse a los filtros actuales para mantener currentFilters sincronizado
    this.store
      .select(selectFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe((filters) => {
        this.currentFilters = filters;
      });

    /**
     * SUSCRIPCIÓN AL DEBOUNCED SEARCH
     *
     * El filterService.searchDebounced$ emite solo cuando el usuario
     * deja de escribir por 300ms. En ese momento:
     * 1. Actualizamos el filtro de búsqueda en el store
     * 2. Disparamos loadProperties para recargar con el nuevo filtro
     *
     * takeUntil(this.destroy$) asegura que la suscripción se cancele
     * automáticamente cuando el componente se destruye.
     */
    this.filterService.searchDebounced$
      .pipe(takeUntil(this.destroy$))
      .subscribe((searchTerm) => {
        console.log(`🔍 [PropertiesPage] Búsqueda debounced: "${searchTerm}"`);
        const newFilters = this.filterService.updateFilter(
          this.currentFilters,
          'search',
          searchTerm
        );
        this.store.dispatch(PropertyActions.setFilters({ filters: newFilters }));
        this.store.dispatch(PropertyActions.loadProperties({ page: 1 }));
      });

    // Mostrar errores como toast notifications
    this.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe((error) => {
        if (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error,
            life: 5000,
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================================================
  // HANDLERS DE EVENTOS DE LA TABLA
  // ==========================================================================

  /** Usuario hace click en "Ver detalle" */
  onView(property: Property): void {
    this.router.navigate(['/properties', property.id]);
  }

  /** Usuario hace click en "Editar" */
  onEdit(property: Property): void {
    this.router.navigate(['/properties', property.id, 'edit']);
  }

  /**
   * Usuario hace click en "Eliminar"
   *
   * Usa PrimeNG ConfirmationService para mostrar un diálogo de confirmación.
   * Solo dispara deleteProperty si el usuario confirma.
   */
  onDelete(property: Property): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas eliminar "${property.title}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        console.log(`🗑️ [PropertiesPage] Eliminando propiedad #${property.id}`);
        this.store.dispatch(PropertyActions.deleteProperty({ id: property.id }));
        this.messageService.add({
          severity: 'success',
          summary: 'Eliminada',
          detail: `Propiedad "${property.title}" eliminada`,
          life: 3000,
        });
      },
    });
  }

  /**
   * Usuario cambia de página o pageSize en la tabla.
   *
   * Dispara dos actions:
   * 1. setCurrentPage/setPageSize para actualizar el estado
   * 2. loadProperties para cargar la nueva página
   */
  onPageChange(event: { page: number; pageSize: number }): void {
    this.store.dispatch(PropertyActions.setCurrentPage({ page: event.page }));
    this.store.dispatch(PropertyActions.setPageSize({ pageSize: event.pageSize }));
    this.store.dispatch(PropertyActions.loadProperties({
      page: event.page,
      pageSize: event.pageSize,
    }));
  }

  // ==========================================================================
  // HANDLERS DE FILTROS REACTIVOS
  // ==========================================================================

  /**
   * Handler para cambios en filtros individuales (selects, inputs numéricos).
   *
   * A diferencia de la búsqueda de texto, estos cambios son INMEDIATOS:
   * el usuario selecciona un valor del dropdown y se aplica al instante.
   * No necesitamos debounce porque cada cambio es una acción deliberada.
   *
   * Flujo:
   * 1. PropertyFiltersComponent emite filterChange { filter, value }
   * 2. Usamos filterService para construir el nuevo objeto de filtros (inmutable)
   * 3. Disparamos setFilters para actualizar el store
   * 4. Disparamos loadProperties para recargar con los nuevos filtros
   */
  onFilterChange(event: FilterChangeEvent): void {
    console.log(`🔧 [PropertiesPage] Filtro cambiado: ${event.filter} = ${event.value}`);

    const newFilters = this.filterService.updateFilter(
      this.currentFilters,
      event.filter,
      event.value
    );

    this.store.dispatch(PropertyActions.setFilters({ filters: newFilters }));
    this.store.dispatch(PropertyActions.loadProperties({ page: 1 }));
  }

  /**
   * Handler para la búsqueda de texto.
   *
   * NO actualiza el store directamente.
   * En su lugar, pasa el valor al filterService que aplica debounce.
   *
   * El store se actualizará cuando searchDebounced$ emita (después de 300ms).
   *
   * Esto evita hacer una petición HTTP por cada tecla pulsada.
   */
  onSearchChange(searchTerm: string): void {
    this.filterService.pushSearch(searchTerm);
  }

  /**
   * Handler para limpiar todos los filtros.
   *
   * Dispara clearFilters del store (que resetea filters a {})
   * y luego recarga las propiedades sin filtros.
   */
  onClearFilters(): void {
    console.log('🧹 [PropertiesPage] Limpiando filtros...');
    this.store.dispatch(PropertyActions.clearFilters());
    this.store.dispatch(PropertyActions.loadProperties({ page: 1 }));
  }

  // ==========================================================================
  // NAVEGACIÓN
  // ==========================================================================

  navigateToCreate(): void {
    this.router.navigate(['/properties', 'new']);
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  /**
   * Extrae la información de paginación del ViewModel.
   *
   * El ViewModel tiene pagination como objeto completo,
   * pero PropertyListComponent espera PaginationInfo (subset).
   */
  getPaginationInfo(vm: any): PaginationInfo | null {
    if (!vm?.pagination) return null;
    return {
      currentPage: vm.pagination.currentPage,
      pageSize: vm.pagination.pageSize,
      totalCount: vm.pagination.totalCount,
    };
  }
}
