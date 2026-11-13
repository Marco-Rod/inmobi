/**
 * MainLayoutComponent
 *
 * Layout principal de la aplicación con:
 * - Sidebar de navegación (PrimeNG PanelMenu)
 * - Header con título y toggle del sidebar
 * - Router outlet para el contenido de cada ruta
 *
 * PATRÓN: Layout Wrapper Route
 *
 * En lugar de importar el layout en cada página, lo usamos como ruta padre:
 * ```typescript
 * {
 *   path: '',
 *   component: MainLayoutComponent,
 *   children: [
 *     { path: 'dashboard', loadComponent: ... },
 *     { path: 'properties', loadComponent: ... },
 *   ]
 * }
 * ```
 *
 * El layout tiene <router-outlet> donde se renderiza el contenido hijo.
 * El sidebar y el header son comunes a todas las páginas.
 */

import {
  Component,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';

/**
 * Item de navegación del sidebar.
 * Cada item tiene una ruta, un icono, una etiqueta y opcionalmente un badge.
 */
interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,

  template: `
    <div class="layout-wrapper" [class.sidebar-collapsed]="!sidebarOpen()">
      <!-- =====================================================================
           SIDEBAR DE NAVEGACIÓN
           ===================================================================== -->
      <aside class="sidebar" [class.open]="sidebarOpen()">
        <!-- LOGO / TÍTULO -->
        <div class="sidebar-header">
          <i class="pi pi-building text-2xl text-primary"></i>
          @if (sidebarOpen()) {
            <span class="text-lg font-bold text-900 ml-2">RealState CRM</span>
          }
        </div>

        <!-- NAVEGACIÓN -->
        <nav class="sidebar-nav">
          @for (item of navItems; track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="active"
              class="nav-item"
              [title]="item.label">
              <i [class]="item.icon" class="nav-icon"></i>
              @if (sidebarOpen()) {
                <span class="nav-label">{{ item.label }}</span>
              }
              @if (item.badge && sidebarOpen()) {
                <span class="nav-badge">{{ item.badge }}</span>
              }
            </a>
          }
        </nav>

        <!-- FOOTER del sidebar -->
        @if (sidebarOpen()) {
          <div class="sidebar-footer">
            <p class="text-400 text-xs m-0">v1.0.0 · CRM Inmobiliario</p>
            <p class="text-400 text-xs m-0">Angular 22 · NgRx · PrimeNG</p>
          </div>
        }
      </aside>

      <!-- =====================================================================
           ÁREA PRINCIPAL
           ===================================================================== -->
      <div class="main-area">
        <!-- HEADER BAR -->
        <header class="header-bar">
          <p-button
            [icon]="sidebarOpen() ? 'pi pi-bars' : 'pi pi-bars'"
            [text]="true"
            [rounded]="true"
            (onClick)="toggleSidebar()">
          </p-button>

          <h2 class="header-title">{{ pageTitle() }}</h2>

          <div class="flex-1"></div>

          <!-- ACCIONES DEL HEADER -->
          <div class="flex align-items-center gap-2">
            <p-button
              icon="pi pi-bell"
              [text]="true"
              [rounded]="true"
              size="small">
            </p-button>
            <p-button
              icon="pi pi-user"
              [text]="true"
              [rounded]="true"
              size="small">
            </p-button>
          </div>
        </header>

        <!-- CONTENIDO -->
        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,

  styles: [`
    /**
     * Layout CSS
     *
     * El layout usa flexbox para dos columnas:
     * - Sidebar (izquierda, ancho fijo)
     * - Main area (derecha, flex-1)
     *
     * El sidebar es colapsable: cuando está cerrado, solo muestra los iconos.
     * Las transiciones CSS hacen el cambio suave.
     */
    .layout-wrapper {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    /* SIDEBAR */
    .sidebar {
      width: 16rem;
      background: var(--surface-card);
      border-right: 1px solid var(--surface-border);
      display: flex;
      flex-direction: column;
      transition: width 0.2s ease;
      flex-shrink: 0;
    }

    .sidebar:not(.open) {
      width: 4rem;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid var(--surface-border);
      min-height: 4rem;
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      color: var(--text-color-secondary);
      text-decoration: none;
      transition: all 0.15s ease;
      margin-bottom: 0.25rem;
      gap: 0.75rem;
    }

    .nav-item:hover {
      background: var(--surface-hover);
      color: var(--text-color);
    }

    .nav-item.active {
      background: var(--primary-color);
      color: var(--primary-contrast-color);
      font-weight: 600;
    }

    .nav-item.active .nav-icon {
      color: var(--primary-contrast-color);
    }

    .nav-icon {
      font-size: 1.125rem;
      flex-shrink: 0;
    }

    .nav-label {
      flex: 1;
      white-space: nowrap;
    }

    .nav-badge {
      background: var(--primary-contrast-color);
      color: var(--primary-color);
      font-size: 0.75rem;
      padding: 0.125rem 0.5rem;
      border-radius: 1rem;
      font-weight: 600;
    }

    .sidebar-footer {
      padding: 0.75rem 1rem;
      border-top: 1px solid var(--surface-border);
    }

    /* MAIN AREA */
    .main-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .header-bar {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      background: var(--surface-card);
      border-bottom: 1px solid var(--surface-border);
      gap: 0.5rem;
      min-height: 4rem;
    }

    .header-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-color);
      margin: 0;
    }

    .content {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      background: var(--surface-ground);
    }

    /* RESPONSIVE: sidebar oculto en móvil */
    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        z-index: 1000;
        height: 100vh;
        box-shadow: 2px 0 8px rgba(0,0,0,0.1);
      }

      .sidebar:not(.open) {
        transform: translateX(-100%);
        width: 16rem;
      }
    }
  `],
})
export class MainLayoutComponent {
  /**
   * Signal que controla si el sidebar está abierto o colapsado.
   *
   * signal() es la API reactiva de Angular 17+.
   * En el template se accede como sidebarOpen() (función getter).
   */
  sidebarOpen = signal(true);

  /**
   * Signal con el título de la página actual.
   * En una implementación completa, esto vendría del Router events o de
   * un servicio que mapea rutas a títulos.
   */
  pageTitle = signal('Dashboard');

  /**
   * Items de navegación del sidebar.
   *
   * Cada item tiene:
   * - label: Texto a mostrar
   * - icon: Clase de PrimeIcons
   * - route: Ruta de Angular (routerLink)
   * - badge: Texto opcional en un badge
   *
   * routerLinkActive="active" añade la clase 'active' cuando la ruta
   * coincide con la ruta actual, resaltando el item activo.
   */
  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard' },
    { label: 'Propiedades', icon: 'pi pi-building', route: '/properties' },
    { label: 'Nueva propiedad', icon: 'pi pi-plus-circle', route: '/properties/new' },
    { label: 'Reportes', icon: 'pi pi-chart-bar', route: '/reports' },
    { label: 'Material Demo', icon: 'pi pi-palette', route: '/material-demo' },
    { label: 'Signals Demo', icon: 'pi pi-bolt', route: '/signals-demo' },
  ];

  /** Toggle del sidebar (abrir/cerrar) */
  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }
}
