/**
 * MaterialDemoPage Component
 *
 * Página de demostración que muestra componentes de Angular Material
 * funcionando junto con PrimeNG en la misma aplicación.
 *
 * PROPÓSITO DIDÁCTICO:
 * Demostrar que Angular Material y PrimeNG pueden coexistir.
 * En proyectos reales, normalmente eliges UNA biblioteca de UI para
 * mantener consistencia visual. Pero saber integrar ambas es valioso
 * porque:
 * 1. Algunos componentes de Material no tienen equivalente en PrimeNG
 * 2. Algunos equipos tienen código legado con Material y migran a PrimeNG
 * 3. Cada biblioteca tiene fortalezas diferentes
 *
 * COMPONENTS DEMOSTRADOS:
 * - MatCard: Tarjetas de contenido
 * - MatButtonModule: Botones con elevación y ripple
 * - MatTabs: Pestañas horizontales
 * - MatTable: Tabla con sorting y paginación
 * - MatProgressBar: Barra de progreso
 * - MatBadge: Notificaciones en iconos
 * - MatTooltip: Tooltips informativos
 */

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

/** Datos para la tabla de Material */
interface DemoProperty {
  id: number;
  title: string;
  type: string;
  price: number;
  status: string;
}

@Component({
  selector: 'app-material-demo-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatTabsModule,
    MatTableModule,
    MatProgressBarModule,
    MatBadgeModule,
    MatTooltipModule,
    MatToolbarModule,
    MatIconModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,

  template: `
    <!-- HEADER CON MATERIAL TOOLBAR -->
    <mat-toolbar color="primary" class="mb-4 border-round">
      <mat-icon class="mr-2">palette</mat-icon>
      <span>Angular Material Demo</span>
      <span class="flex-1"></span>
      <button mat-icon-button
              matTooltip="Estadísticas"
              [matBadge]="3"
              matBadgeColor="warn">
        <mat-icon>notifications</mat-icon>
      </button>
    </mat-toolbar>

    <!-- INFO -->
    <div class="surface-card shadow-1 border-round p-3 mb-4">
      <p class="text-500 m-0">
        <i class="pi pi-info-circle mr-1"></i>
        Esta página demuestra componentes de Angular Material funcionando
        en paralelo con PrimeNG. Cada biblioteca tiene sus propios estilos
        y patrones, pero pueden coexistir sin conflictos.
      </p>
    </div>

    <!-- TABS DE MATERIAL -->
    <mat-card class="mb-4">
      <mat-card-header>
        <mat-card-title>Componentes de Material</mat-card-title>
        <mat-card-subtitle>Navega entre las pestañas para ver ejemplos</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <mat-tab-group>
          <!-- TAB 1: BOTONES -->
          <mat-tab label="Botones">
            <div class="flex flex-wrap gap-3 py-4">
              <button mat-raised-button color="primary">Primary</button>
              <button mat-raised-button color="accent">Accent</button>
              <button mat-raised-button color="warn">Warn</button>
              <button mat-raised-button disabled>Disabled</button>
              <button mat-stroked-button color="primary">Stroked</button>
              <button mat-flat-button color="accent">Flat</button>
              <button mat-icon-button color="primary" matTooltip="Favorito">
                <mat-icon>favorite</mat-icon>
              </button>
              <button mat-fab color="primary" matTooltip="Acción principal">
                <mat-icon>add</mat-icon>
              </button>
            </div>
          </mat-tab>

          <!-- TAB 2: TABLA -->
          <mat-tab label="Tabla">
            <div class="py-4">
              <table mat-table [dataSource]="dataSource" class="w-full">
                <!-- Columna ID -->
                <ng-container matColumnDef="id">
                  <th mat-header-cell *matHeaderCellDef>ID</th>
                  <td mat-cell *matCellDef="let row">{{ row.id }}</td>
                </ng-container>

                <!-- Columna Título -->
                <ng-container matColumnDef="title">
                  <th mat-header-cell *matHeaderCellDef>Título</th>
                  <td mat-cell *matCellDef="let row">{{ row.title }}</td>
                </ng-container>

                <!-- Columna Tipo -->
                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef>Tipo</th>
                  <td mat-cell *matCellDef="let row">{{ row.type }}</td>
                </ng-container>

                <!-- Columna Precio -->
                <ng-container matColumnDef="price">
                  <th mat-header-cell *matHeaderCellDef>Precio</th>
                  <td mat-cell *matCellDef="let row">
                    {{ '$' + row.price.toLocaleString('es-MX') }}
                  </td>
                </ng-container>

                <!-- Columna Estado -->
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Estado</th>
                  <td mat-cell *matCellDef="let row">{{ row.status }}</td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
              </table>
            </div>
          </mat-tab>

          <!-- TAB 3: PROGRESS Y BADGES -->
          <mat-tab label="Progress & Badges">
            <div class="py-4">
              <h4 class="font-semibold mb-2">Progress Bar</h4>
              <mat-progress-bar mode="determinate" [value]="65" class="mb-4">
              </mat-progress-bar>

              <mat-progress-bar mode="determinate" [value]="30" color="warn" class="mb-4">
              </mat-progress-bar>

              <h4 class="font-semibold mb-2 mt-4">Badges en iconos</h4>
              <div class="flex gap-4">
                <button mat-icon-button
                        matTooltip="3 mensajes nuevos"
                        [matBadge]="3"
                        matBadgeColor="primary">
                  <mat-icon>email</mat-icon>
                </button>

                <button mat-icon-button
                        matTooltip="12 notificaciones"
                        [matBadge]="12"
                        matBadgeColor="warn">
                  <mat-icon>notifications</mat-icon>
                </button>

                <button mat-icon-button
                        matTooltip="Sin badge (oculto)"
                        [matBadgeHidden]="true"
                        [matBadge]="0">
                  <mat-icon>home</mat-icon>
                </button>
              </div>
            </div>
          </mat-tab>

          <!-- TAB 4: COMPARACIÓN PRIMENG VS MATERIAL -->
          <mat-tab label="PrimeNG vs Material">
            <div class="py-4">
              <p class="text-600 mb-3">
                Comparación lado a lado de las dos bibliotecas:
              </p>

              <div class="grid">
                <!-- PrimeNG -->
                <div class="col-6">
                  <h5 class="font-semibold mb-2">PrimeNG</h5>
                  <ul class="list-none p-0 text-600">
                    <li class="mb-1">✅ Tema Aura (CSS variables)</li>
                    <li class="mb-1">✅ PrimeFlex (grid + utilities)</li>
                    <li class="mb-1">✅ Más de 80 componentes</li>
                    <li class="mb-1">✅ Sin dependencia de CDK</li>
                    <li class="mb-1">⚠️ PrimeNG 22 requiere licencia</li>
                  </ul>
                </div>

                <!-- Material -->
                <div class="col-6">
                  <h5 class="font-semibold mb-2">Angular Material</h5>
                  <ul class="list-none p-0 text-600">
                    <li class="mb-1">✅ Oficial de Google</li>
                    <li class="mb-1">✅ Basado en Material Design</li>
                    <li class="mb-1">✅ Integrado con Angular CDK</li>
                    <li class="mb-1">✅ Totalmente open source</li>
                    <li class="mb-1">⚠️ Menos componentes que PrimeNG</li>
                  </ul>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card-content>
    </mat-card>

    <!-- NOTA FINAL -->
    <div class="surface-card shadow-1 border-round p-4">
      <h3 class="text-lg font-semibold text-900 mb-2">
        ¿Cuándo usar cada biblioteca?
      </h3>
      <div class="grid">
        <div class="col-12 md:col-6">
          <h4 class="font-semibold text-primary mb-1">PrimeNG</h4>
          <p class="text-600 text-sm">
            Ideal para aplicaciones empresariales con tablas complejas, filtros
            avanzados, y componentes ricos. Más componentes disponibles y
            mejor soporte para casos de uso complejos.
          </p>
        </div>
        <div class="col-12 md:col-6">
          <h4 class="font-semibold text-primary mb-1">Angular Material</h4>
          <p class="text-600 text-sm">
            Ideal para aplicaciones que siguen Material Design de Google.
            Mejor integración con Angular CDK (drag-drop, virtual scroll).
            Totalmente open source sin restricciones de licencia.
          </p>
        </div>
      </div>
    </div>
  `,
})
export class MaterialDemoPageComponent {
  /** Columnas a mostrar en la tabla de Material */
  displayedColumns: string[] = ['id', 'title', 'type', 'price', 'status'];

  /** Datos de ejemplo para la tabla */
  dataSource: DemoProperty[] = [
    { id: 1, title: 'Casa en Polanco', type: 'Casa', price: 5000000, status: 'Disponible' },
    { id: 2, title: 'Depto en Roma Norte', type: 'Departamento', price: 2500000, status: 'Vendida' },
    { id: 3, title: 'Oficina en Santa Fe', type: 'Oficina', price: 8000000, status: 'Rentada' },
    { id: 4, title: 'Terreno en Toluca', type: 'Terreno', price: 1200000, status: 'Disponible' },
    { id: 5, title: 'Local en Coyoacán', type: 'Local', price: 3500000, status: 'Negociando' },
  ];
}
