/**
 * PropertyDetailPage Component (Smart Component)
 *
 * Página contenedora para la vista de detalle de una propiedad.
 * Ruta: /properties/:id
 *
 * RESPONSABILIDADES:
 * - Obtener el ID de la ruta
 * - Cargar la propiedad del store o via HTTP
 * - Pasar datos al PropertyDetailComponent (dumb)
 * - Manejar navegación (volver, editar)
 */

import {
  Component,
  inject,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';

import { PropertyDetailComponent } from '../components/property-detail/property-detail.component';
import { Property } from '../../../core/models';
import * as PropertyActions from '../store/property.actions';
import {
  selectSelectedProperty,
  selectLoading,
  selectPropertyById,
} from '../store/property.selectors';

@Component({
  selector: 'app-property-detail-page',
  standalone: true,
  imports: [CommonModule, PropertyDetailComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,

  template: `
    <div class="mb-4">
      <!-- LOADING: mientras carga la propiedad -->
      @if (loading && !property) {
        <div class="text-center py-8">
          <i class="pi pi-spin pi-spinner text-4xl text-400"></i>
          <p class="text-500 mt-3">Cargando propiedad...</p>
        </div>
      } @else {
        <!-- DETALLE -->
        <app-property-detail
          [property]="property"
          (back)="navigateBack()"
          (edit)="navigateToEdit($event)">
        </app-property-detail>
      }
    </div>
  `,
})
export class PropertyDetailPageComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /** Propiedad cargada para mostrar */
  property: Property | null = null;
  loading = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadProperty(id);
    }

    // Suscribirse a la propiedad seleccionada
    this.store.select(selectSelectedProperty).subscribe((prop) => {
      this.property = prop;
    });

    // Suscribirse al loading
    this.store.select(selectLoading).subscribe((loading) => {
      this.loading = loading;
    });
  }

  /**
   * Carga la propiedad para mostrar.
   *
   * Estrategia igual que el formulario:
   * 1. Intentar del store local (selectPropertyById) - rápido
   * 2. Si no está, dispara loadPropertyById - petición HTTP
   */
  private loadProperty(id: number): void {
    // Intentar del store primero
    this.store
      .select(selectPropertyById(id))
      .pipe(take(1))
      .subscribe((property) => {
        if (property) {
          this.store.dispatch(PropertyActions.selectProperty({ property }));
        } else {
          // No está en el store, cargar del servidor
          this.store.dispatch(PropertyActions.loadPropertyById({ id }));
        }
      });
  }

  navigateBack(): void {
    this.router.navigate(['/properties']);
  }

  navigateToEdit(property: Property): void {
    this.router.navigate(['/properties', property.id, 'edit']);
  }
}
