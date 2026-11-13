/**
 * PropertyFormComponent (Dumb Component)
 *
 * Formulario reactivo para crear y editar propiedades.
 *
 * PATRÓN: Reactive Forms de Angular
 *
 * Reactive Forms vs Template-driven Forms:
 *
 * Reactive Forms (lo que usamos):
 * - Configuración en el componente (TypeScript)
 * - Validaciones declarativas con Validators
 * - Suscripción a cambios de valor
 * - Mejor para formularios complejos
 * - Mejor testing
 * - Tree-shakeable
 *
 * Template-driven Forms:
 * - Configuración en el HTML
 * - Usa ngModel y ngForm
 * - Más simple para formularios básicos
 * - Menos control programático
 *
 * DECISIÓN: Reactive Forms por ser patrón empresarial estándar.
 *
 * CARACTERÍSTICAS:
 * - Modo crear y modo editar
 * - Validaciones síncronas y asíncronas
 * - Errores de validación del servidor
 * - Deshabilitar botón mientras guarda
 * - Reset del formulario al cancelar
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';

import {
  Property,
  PropertyCreateDto,
  PropertyUpdateDto,
  PropertyStatus,
  PropertyTypeLabels,
  PropertyTypes,
  OperationTypeLabels,
  OperationTypes,
  PropertyStatusLabels,
  PropertyStatuses,
  Currency,
  CurrencyNames,
  Currencies,
  PROPERTY_VALIDATION_RULES,
} from '../../../../core/models';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    SelectModule,
    ButtonModule,
    MessageModule,
    TooltipModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,

  template: `
    <!-- =====================================================================
         FORMULARIO DE PROPIEDAD
         ===================================================================== -->
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="property-form">

      <!-- MENSAJE DE ERROR GLOBAL -->
      @if (error) {
        <div class="surface-ground border-round p-3 mb-3 border-1 border-red-500">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-exclamation-triangle text-red-500"></i>
            <span class="text-red-500 font-semibold">{{ error }}</span>
          </div>
        </div>
      }

      <!-- TÍTULO -->
      <div class="field mb-3">
        <label for="title" class="font-semibold mb-1 block">
          Título <span class="text-red-500">*</span>
        </label>
        <input
          pInputText
          id="title"
          formControlName="title"
          class="w-full"
          placeholder="Ej: Casa residencial con jardín"
          [class.ng-invalid]="isInvalid('title')"
          [class.ng-dirty]="isDirty('title')">
        @if (getFieldError('title')) {
          <small class="block text-red-500 mt-1">{{ getFieldError('title') }}</small>
        }
      </div>

      <!-- DESCRIPCIÓN -->
      <div class="field mb-3">
        <label for="description" class="font-semibold mb-1 block">
          Descripción <span class="text-red-500">*</span>
        </label>
        <textarea
          pTextarea
          id="description"
          formControlName="description"
          class="w-full"
          rows="4"
          placeholder="Describe la propiedad en detalle..."
          [class.ng-invalid]="isInvalid('description')"
          [class.ng-dirty]="isDirty('description')">
        </textarea>
        @if (getFieldError('description')) {
          <small class="block text-red-500 mt-1">{{ getFieldError('description') }}</small>
        }
      </div>

      <!-- GRID: Tipo y Operación -->
      <div class="grid">
        <!-- TIPO DE PROPIEDAD -->
        <div class="col-12 md:col-6 field mb-3">
          <label for="propertyType" class="font-semibold mb-1 block">
            Tipo <span class="text-red-500">*</span>
          </label>
          <p-select
            inputId="propertyType"
            formControlName="propertyType"
            [options]="typeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Selecciona..."
            class="w-full">
          </p-select>
          @if (getFieldError('propertyType')) {
            <small class="block text-red-500 mt-1">{{ getFieldError('propertyType') }}</small>
          }
        </div>

        <!-- OPERACIÓN -->
        <div class="col-12 md:col-6 field mb-3">
          <label for="operation" class="font-semibold mb-1 block">
            Operación <span class="text-red-500">*</span>
          </label>
          <p-select
            inputId="operation"
            formControlName="operation"
            [options]="operationOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Selecciona..."
            class="w-full">
          </p-select>
          @if (getFieldError('operation')) {
            <small class="block text-red-500 mt-1">{{ getFieldError('operation') }}</small>
          }
        </div>
      </div>

      <!-- GRID: Precio y Moneda -->
      <div class="grid">
        <div class="col-12 md:col-8 field mb-3">
          <label for="price" class="font-semibold mb-1 block">
            Precio <span class="text-red-500">*</span>
          </label>
          <p-inputNumber
            inputId="price"
            formControlName="price"
            mode="currency"
            [currency]="form.get('currency')?.value"
            [min]="0"
            class="w-full">
          </p-inputNumber>
          @if (getFieldError('price')) {
            <small class="block text-red-500 mt-1">{{ getFieldError('price') }}</small>
          }
        </div>

        <div class="col-12 md:col-4 field mb-3">
          <label for="currency" class="font-semibold mb-1 block">
            Moneda <span class="text-red-500">*</span>
          </label>
          <p-select
            inputId="currency"
            formControlName="currency"
            [options]="currencyOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full">
          </p-select>
        </div>
      </div>

      <!-- GRID: Ciudad y Estado -->
      <div class="grid">
        <div class="col-12 md:col-6 field mb-3">
          <label for="city" class="font-semibold mb-1 block">
            Ciudad <span class="text-red-500">*</span>
          </label>
          <input
            pInputText
            id="city"
            formControlName="city"
            class="w-full"
            placeholder="Ej: Guadalajara">
          @if (getFieldError('city')) {
            <small class="block text-red-500 mt-1">{{ getFieldError('city') }}</small>
          }
        </div>

        <div class="col-12 md:col-6 field mb-3">
          <label for="state" class="font-semibold mb-1 block">
            Estado <span class="text-red-500">*</span>
          </label>
          <input
            pInputText
            id="state"
            formControlName="state"
            class="w-full"
            placeholder="Ej: Jalisco">
          @if (getFieldError('state')) {
            <small class="block text-red-500 mt-1">{{ getFieldError('state') }}</small>
          }
        </div>
      </div>

      <!-- GRID: Recámaras, Baños, Superficie -->
      <div class="grid">
        <div class="col-12 md:col-4 field mb-3">
          <label for="bedrooms" class="font-semibold mb-1 block">
            Recámaras <span class="text-red-500">*</span>
          </label>
          <p-inputNumber
            inputId="bedrooms"
            formControlName="bedrooms"
            [min]="0"
            [max]="50"
            class="w-full">
          </p-inputNumber>
        </div>

        <div class="col-12 md:col-4 field mb-3">
          <label for="bathrooms" class="font-semibold mb-1 block">
            Baños <span class="text-red-500">*</span>
          </label>
          <p-inputNumber
            inputId="bathrooms"
            formControlName="bathrooms"
            [min]="0"
            [max]="20"
            class="w-full">
          </p-inputNumber>
        </div>

        <div class="col-12 md:col-4 field mb-3">
          <label for="areaM2" class="font-semibold mb-1 block">
            Superficie (m²) <span class="text-red-500">*</span>
          </label>
          <p-inputNumber
            inputId="areaM2"
            formControlName="areaM2"
            [min]="1"
            suffix=" m²"
            class="w-full">
          </p-inputNumber>
        </div>
      </div>

      <!-- ESTADO (solo en modo editar) -->
      @if (isEditMode()) {
        <div class="field mb-3">
          <label for="status" class="font-semibold mb-1 block">Estado</label>
          <p-select
            inputId="status"
            formControlName="status"
            [options]="statusOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full">
          </p-select>
        </div>
      }

      <!-- IMAGE URL (opcional) -->
      <div class="field mb-3">
        <label for="imageUrl" class="font-semibold mb-1 block">
          URL de imagen (opcional)
        </label>
        <input
          pInputText
          id="imageUrl"
          formControlName="imageUrl"
          class="w-full"
          placeholder="https://...">
      </div>

      <!-- BOTONES DE ACCIÓN -->
      <div class="flex gap-2 justify-content-end mt-4">
        <p-button
          type="button"
          label="Cancelar"
          icon="pi pi-times"
          severity="secondary"
          [outlined]="true"
          (onClick)="cancel.emit()">
        </p-button>
        <p-button
          type="submit"
          [label]="isEditMode() ? 'Actualizar' : 'Crear'"
          icon="pi pi-check"
          [loading]="saving"
          [disabled]="form.invalid">
        </p-button>
      </div>
    </form>
  `,
})
export class PropertyFormComponent implements OnInit, OnDestroy {
  /** FormBuilder inyectado con inject() */
  private readonly fb = inject(FormBuilder);

  // ==========================================================================
  // INPUTS
  // ==========================================================================

  /** Propiedad a editar. null = modo crear */
  @Input() property: Property | null = null;

  /** Estado de guardado (loading del botón) */
  @Input() saving = false;

  /** Error del servidor */
  @Input() error: string | null = null;

  /** Errores de validación del servidor por campo */
  @Input() serverValidationErrors: Record<string, string[]> | null = null;

  // ==========================================================================
  // OUTPUTS
  // ==========================================================================

  /** Emite cuando el formulario se envía (válido) */
  @Output() save = new EventEmitter<PropertyCreateDto | PropertyUpdateDto>();

  /** Emite cuando el usuario cancela */
  @Output() cancel = new EventEmitter<void>();

  // ==========================================================================
  // FORM GROUP
  // ==========================================================================

  /**
   * FormGroup principal del formulario.
   *
   * Un FormGroup agrupa múltiples FormControl y permite:
   * - Validar el formulario completo
   * - Acceder a controles individuales por nombre
   * - Escuchar cambios de valor
   * - Resetear todos los campos
   */
  form!: FormGroup;

  /**
   * Computed signal que indica si estamos en modo editar.
   *
   * signal(): Nueva API reactiva de Angular 17+
   * computed(): Deriva un valor de otros signals
   *
   * Aquí derivamos isEditMode de si property es null o no.
   * Si property tiene valor, estamos editando; si no, creando.
   */
  private readonly _property = signal<Property | null>(null);

  isEditMode = computed(() => this._property() !== null);

  // ==========================================================================
  // OPCIONES PARA DROPDOWNS
  // ==========================================================================

  /** Opciones para el dropdown de tipo de propiedad */
  typeOptions = PropertyTypes.map((t) => ({
    label: PropertyTypeLabels[t],
    value: t,
  }));

  operationOptions = OperationTypes.map((o) => ({
    label: OperationTypeLabels[o],
    value: o,
  }));

  currencyOptions = Currencies.map((c) => ({
    label: CurrencyNames[c],
    value: c,
  }));

  statusOptions = PropertyStatuses.map((s) => ({
    label: PropertyStatusLabels[s],
    value: s,
  }));

  // ==========================================================================
  // LIFECYCLE
  // ==========================================================================

  ngOnInit(): void {
    this._property.set(this.property);
    this.buildForm();
    // Si hay propiedad para editar, cargar sus valores
    if (this.property) {
      this.patchForm(this.property);
    }
  }

  ngOnDestroy(): void {
    // Angular limpia automáticamente los FormGroup al destruir el componente
  }

  // ==========================================================================
  // CONSTRUCCIÓN DEL FORMULARIO
  // ==========================================================================

  /**
   * Construye el FormGroup con todos los campos y validadores.
   *
   * Validators.required: Campo obligatorio
   * Validators.minLength/maxLength: Longitud mínima/máxima
   * Validators.min/max: Valor mínimo/máximo
   *
   * Los valores de validación se toman de PROPERTY_VALIDATION_RULES
   * (definidos en property.model.ts) para mantener consistencia.
   */
  private buildForm(): void {
    this.form = this.fb.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(PROPERTY_VALIDATION_RULES.title.minLength),
          Validators.maxLength(PROPERTY_VALIDATION_RULES.title.maxLength),
        ],
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(PROPERTY_VALIDATION_RULES.description.minLength),
          Validators.maxLength(PROPERTY_VALIDATION_RULES.description.maxLength),
        ],
      ],
      propertyType: ['', [Validators.required]],
      operation: ['', [Validators.required]],
      price: [
        null,
        [
          Validators.required,
          Validators.min(PROPERTY_VALIDATION_RULES.price.min),
        ],
      ],
      currency: ['MXN' as Currency, [Validators.required]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      state: ['', [Validators.required, Validators.minLength(2)]],
      bedrooms: [
        0,
        [
          Validators.required,
          Validators.min(PROPERTY_VALIDATION_RULES.bedrooms.min),
          Validators.max(PROPERTY_VALIDATION_RULES.bedrooms.max),
        ],
      ],
      bathrooms: [
        0,
        [
          Validators.required,
          Validators.min(PROPERTY_VALIDATION_RULES.bathrooms.min),
          Validators.max(PROPERTY_VALIDATION_RULES.bathrooms.max),
        ],
      ],
      areaM2: [
        null,
        [
          Validators.required,
          Validators.min(PROPERTY_VALIDATION_RULES.areaM2.min),
        ],
      ],
      imageUrl: [''],
      // status solo se incluye en modo editar
      status: ['available' as PropertyStatus],
    });

    // En modo crear, el control 'status' se deshabilita
    if (!this.property) {
      this.form.get('status')?.disable();
    }
  }

  /** Carga los valores de la propiedad existente en el formulario */
  private patchForm(property: Property): void {
    this.form.patchValue({
      title: property.title,
      description: property.description,
      propertyType: property.propertyType,
      operation: property.operation,
      price: property.price,
      currency: property.currency,
      city: property.city,
      state: property.state,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      areaM2: property.areaM2,
      imageUrl: property.imageUrl ?? '',
      status: property.status,
    });
  }

  // ==========================================================================
  // SUBMIT
  // ==========================================================================

  /**
   * Handler del submit del formulario.
   *
   * Flujo:
   * 1. Verifica que el formulario sea válido
   * 2. Extrae los valores con form.getRawValue()
   *    (getRawValue incluye campos deshabilitados, a diferencia de value)
   * 3. Emite save con el DTO apropiado (Create o Update)
   *
   * El contenedor (PropertiesPage) recibe el evento y dispara la action de NgRx.
   */
  onSubmit(): void {
    if (this.form.invalid) {
      // Marca todos los campos como tocados para mostrar errores
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();

    if (this.isEditMode()) {
      // Modo editar: emitir UpdatePropertyDto (campos opcionales)
      const updateDto: PropertyUpdateDto = {
        title: formValue.title,
        description: formValue.description,
        propertyType: formValue.propertyType,
        operation: formValue.operation,
        price: formValue.price,
        currency: formValue.currency,
        city: formValue.city,
        state: formValue.state,
        bedrooms: formValue.bedrooms,
        bathrooms: formValue.bathrooms,
        areaM2: formValue.areaM2,
        imageUrl: formValue.imageUrl || undefined,
        status: formValue.status,
      };
      this.save.emit(updateDto);
    } else {
      // Modo crear: emitir PropertyCreateDto
      const createDto: PropertyCreateDto = {
        title: formValue.title,
        description: formValue.description,
        propertyType: formValue.propertyType,
        operation: formValue.operation,
        price: formValue.price,
        currency: formValue.currency,
        city: formValue.city,
        state: formValue.state,
        bedrooms: formValue.bedrooms,
        bathrooms: formValue.bathrooms,
        areaM2: formValue.areaM2,
        imageUrl: formValue.imageUrl || undefined,
      };
      this.save.emit(createDto);
    }
  }

  // ==========================================================================
  // HELPERS DE VALIDACIÓN (para el template)
  // ==========================================================================

  /** ¿El campo está inválido y tocado? */
  isInvalid(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  /** ¿El campo fue modificado? */
  isDirty(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!control && control.dirty;
  }

  /**
   * Obtiene el mensaje de error para un campo específico.
   *
   * Prioridad de errores:
   * 1. Errores del servidor (serverValidationErrors)
   * 2. Errores de validación del cliente (Validators)
   */
  getFieldError(fieldName: string): string | null {
    const control = this.form.get(fieldName);
    if (!control || !control.errors) return null;

    // Primero revisar errores del servidor
    if (this.serverValidationErrors?.[fieldName]) {
      return this.serverValidationErrors[fieldName][0];
    }

    // Luego errores de validación del cliente
    if (control.errors['required']) return 'Este campo es obligatorio';
    if (control.errors['minlength']) {
      return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    }
    if (control.errors['maxlength']) {
      return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    }
    if (control.errors['min']) return `El valor mínimo es ${control.errors['min'].min}`;
    if (control.errors['max']) return `El valor máximo es ${control.errors['max'].max}`;

    return 'Campo inválido';
  }
}
