/**
 * PropertyFormPage Component (Smart Component)
 *
 * Página contenedora del formulario de crear/editar propiedad.
 * Se usa tanto para /properties/new como para /properties/:id/edit.
 *
 * RESPONSABILIDADES:
 * - Determinar si es modo crear o editar (basado en la ruta)
 * - Si es editar: cargar la propiedad del store o via loadPropertyById
 * - Pasar datos al PropertyFormComponent (dumb)
 * - Recibir el evento save y disparar la action de NgRx
 * - Navegar después de guardar exitosamente
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

import { ButtonModule } from 'primeng/button';

import { PropertyFormComponent } from '../components/property-form/property-form.component';
import {
  Property,
  PropertyCreateDto,
  PropertyUpdateDto,
} from '../../../core/models';
import * as PropertyActions from '../store/property.actions';
import {
  selectSelectedProperty,
  selectCreating,
  selectUpdating,
  selectError,
  selectValidationErrors,
  selectPropertyById,
} from '../store/property.selectors';

@Component({
  selector: 'app-property-form-page',
  standalone: true,
  imports: [CommonModule, ButtonModule, PropertyFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,

  template: `
    <!-- HEADER -->
    <div class="flex align-items-center justify-content-between mb-4">
      <div class="flex align-items-center gap-3">
        <p-button
          icon="pi pi-arrow-left"
          [text]="true"
          [rounded]="true"
          (onClick)="navigateBack()">
        </p-button>
        <h1 class="text-3xl font-bold text-900 m-0">
          {{ isEditMode ? 'Editar propiedad' : 'Nueva propiedad' }}
        </h1>
      </div>
    </div>

    <!-- FORMULARIO -->
    <div class="surface-card shadow-1 border-round p-4 max-w-4xl">
      @if (isEditMode && !property) {
        <!-- LOADING: mientras carga la propiedad a editar -->
        <div class="text-center py-6">
          <i class="pi pi-spin pi-spinner text-3xl text-400"></i>
          <p class="text-500 mt-2">Cargando propiedad...</p>
        </div>
      } @else {
        <!-- FORMULARIO: crear o editar -->
        <app-property-form
          [property]="property"
          [saving]="saving"
          [error]="error"
          [serverValidationErrors]="validationErrors"
          (save)="onSave($event)"
          (cancel)="navigateBack()">
        </app-property-form>
      }
    </div>
  `,
})
export class PropertyFormPageComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /** Observable de la propiedad seleccionada */
  private readonly selectedProperty$ = this.store.select(selectSelectedProperty);
  private readonly creating$ = this.store.select(selectCreating);
  private readonly updating$ = this.store.select(selectUpdating);
  private readonly error$ = this.store.select(selectError);
  private readonly validationErrors$ = this.store.select(selectValidationErrors);

  /** Propiedad que se está editando (null si es modo crear) */
  property: Property | null = null;
  isEditMode = false;
  saving = false;
  error: string | null = null;
  validationErrors: Record<string, string[]> | null = null;

  /** ID de la propiedad si estamos editando */
  private editingId: number | null = null;

  ngOnInit(): void {
    // Determinar modo crear/editar desde la URL
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam && idParam !== 'new') {
      this.editingId = Number(idParam);
      this.isEditMode = true;
      this.loadPropertyForEdit();
    } else {
      this.isEditMode = false;
      // Limpiar selección previa
      this.store.dispatch(PropertyActions.deselectProperty());
    }

    // Suscribirse a los observables del store
    this.selectedProperty$.subscribe((prop) => {
      if (this.isEditMode && prop) {
        this.property = prop;
      }
    });

    // Combinar creating y updating en un solo "saving"
    this.creating$.subscribe((c) => { if (c) this.saving = true; });
    this.updating$.subscribe((u) => { if (u) this.saving = true; });

    // Crear: cuando creating pasa a false, si no hay error, fue exitoso
    this.creating$.subscribe((creating) => {
      if (!creating && this.saving && !this.isEditMode && !this.error) {
        this.navigateBack();
      }
      if (!creating) this.saving = false;
    });

    this.updating$.subscribe((updating) => {
      if (!updating && this.saving && this.isEditMode && !this.error) {
        this.navigateBack();
      }
      if (!updating) this.saving = false;
    });

    this.error$.subscribe((err) => {
      this.error = err;
    });

    this.validationErrors$.subscribe((errors) => {
      this.validationErrors = errors;
    });
  }

  /**
   * Carga la propiedad para editar.
   *
   * Estrategia:
   * 1. Primero intenta del store local (selectPropertyById) - rápido
   * 2. Si no está, dispara loadPropertyById - petición HTTP
   */
  private loadPropertyForEdit(): void {
    if (this.editingId === null) return;

    // Intentar del store primero
    this.store
      .select(selectPropertyById(this.editingId))
      .pipe(take(1))
      .subscribe((property) => {
        if (property) {
          this.property = property;
          this.store.dispatch(PropertyActions.selectProperty({ property }));
        } else {
          // No está en el store, cargar del servidor
          this.store.dispatch(PropertyActions.loadPropertyById({ id: this.editingId! }));
        }
      });
  }

  /**
   * Handler del evento save del formulario.
   *
   * Dispara la action correcta según el modo:
   * - Crear: createProperty
   * - Editar: updateProperty
   */
  onSave(dto: PropertyCreateDto | PropertyUpdateDto): void {
    if (this.isEditMode && this.editingId !== null) {
      this.store.dispatch(
        PropertyActions.updateProperty({
          id: this.editingId,
          changes: dto as PropertyUpdateDto,
        })
      );
    } else {
      this.store.dispatch(
        PropertyActions.createProperty({ property: dto as PropertyCreateDto })
      );
    }
  }

  /** Navega de vuelta a la lista */
  navigateBack(): void {
    this.router.navigate(['/properties']);
  }
}
