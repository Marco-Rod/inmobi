import { Routes } from '@angular/router';

/**
 * Rutas de la aplicación
 *
 * ESTRUCTURA CON LAYOUT WRAPPER:
 *
 * MainLayoutComponent es la ruta padre que renderiza el sidebar + header.
 * Las rutas hijas (children) se renderizan dentro del <router-outlet>
 * del layout. Esto significa que todas las páginas comparten el mismo
 * sidebar y header sin repetir código.
 *
 * ```typescript
 * {
 *   path: '',
 *   component: MainLayoutComponent,  // ← Layout wrapper
 *   children: [
 *     { path: 'dashboard', ... },    // ← Se renderiza dentro del layout
 *     { path: 'properties', ... },
 *   ]
 * }
 * ```
 */

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/components/main-layout/main-layout.component')
        .then((m) => m.MainLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        title: 'Dashboard | CRM Inmobiliario',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard-page.component')
            .then((m) => m.DashboardPageComponent),
      },
      {
        path: 'properties',
        title: 'Propiedades | CRM Inmobiliario',
        loadComponent: () =>
          import('./features/properties/pages/properties-page.component')
            .then((m) => m.PropertiesPageComponent),
      },
      {
        path: 'properties/new',
        title: 'Nueva propiedad | CRM Inmobiliario',
        loadComponent: () =>
          import('./features/properties/pages/property-form-page.component')
            .then((m) => m.PropertyFormPageComponent),
      },
      {
        path: 'properties/:id',
        title: 'Detalle de propiedad | CRM Inmobiliario',
        loadComponent: () =>
          import('./features/properties/pages/property-detail-page.component')
            .then((m) => m.PropertyDetailPageComponent),
      },
      {
        path: 'properties/:id/edit',
        title: 'Editar propiedad | CRM Inmobiliario',
        loadComponent: () =>
          import('./features/properties/pages/property-form-page.component')
            .then((m) => m.PropertyFormPageComponent),
      },
      {
        path: 'reports',
        title: 'Reportes | CRM Inmobiliario',
        loadComponent: () =>
          import('./features/reports/pages/reports-page.component')
            .then((m) => m.ReportsPageComponent),
      },
      {
        path: 'material-demo',
        title: 'Material Demo | CRM Inmobiliario',
        loadComponent: () =>
          import('./features/material-demo/pages/material-demo-page.component')
            .then((m) => m.MaterialDemoPageComponent),
      },
      {
        path: 'signals-demo',
        title: 'Signals Demo | CRM Inmobiliario',
        loadComponent: () =>
          import('./features/material-demo/pages/signals-demo-page.component')
            .then((m) => m.SignalsDemoPageComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
