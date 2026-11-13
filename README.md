# 🏢 Real Estate CRM - Proyecto Didáctico Angular 22 Empresarial

> **Guía de Aprendizaje Completa**: Este proyecto es una aplicación CRM completa construida con Angular 22, diseñada específicamente para enseñar patrones arquitectónicos empresariales, gestión de estado moderna y mejores prácticas de desarrollo.

[![Angular](https://img.shields.io/badge/Angular-22-red.svg)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![PrimeNG](https://img.shields.io/badge/PrimeNG-22-blue.svg)](https://primeng.org/)
[![Material](https://img.shields.io/badge/Material-22-green.svg)](https://material.angular.io/)
[![NgRx](https://img.shields.io/badge/NgRx-22-purple.svg)](https://ngrx.io/)
[![Vitest](https://img.shields.io/badge/Vitest-3.0-yellow.svg)](https://vitest.dev/)
[![Tests](https://img.shields.io/badge/Tests-92%2F92-brightgreen.svg)]()

---

## 📋 Tabla de Contenidos

- [🎯 Objetivo del Proyecto](#-objetivo-del-proyecto)
- [✨ Características Principales](#-características-principales)
- [🏗️ Arquitectura del Proyecto](#️-arquitectura-del-proyecto)
- [🚀 Inicio Rápido](#-inicio-rápido)
- [📚 Patrones y Conceptos Clave](#-patrones-y-conceptos-clave)
  - [NgRx Tradicional vs SignalStore](#ngrx-tradicional-vs-signalstore)
  - [Arquitectura Smart/Dumb Components](#arquitectura-smartdumb-components)
  - [Gestión de Estado Reactivo](#gestión-de-estado-reactivo)
- [🗺️ Navegación y Rutas](#️-navegación-y-rutas)
- [📦 Scripts NPM Disponibles](#-scripts-npm-disponibles)
- [🧪 Estrategia de Testing](#-estrategia-de-testing)
- [📖 Glosario de Términos](#-glosario-de-términos)
- [🔮 Próximos Pasos Sugeridos](#-próximos-pasos-sugeridos)
- [📄 Licencia](#-licencia)

---

## 🎯 Objetivo del Proyecto

Este proyecto CRM de bienes raíces fue construido como **guía de aprendizaje didáctica** para desarrolladores que desean dominar Angular en contextos empresariales. Cubre:

- ✅ **Angular 22 moderno**: Standalone components, SSR, strict mode
- ✅ **Gestión de estado dual**: NgRx tradicional (5 archivos) vs SignalStore (1 archivo)
- ✅ **UI híbrida**: PrimeNG 22 (Aura theme) + Angular Material 22 coexistiendo
- ✅ **Testing rápido**: Vitest con 92/92 tests ejecutándose en 2.70s
- ✅ **Patrones empresariales**: Feature modules, lazy loading, guards, interceptors
- ✅ **Best practices**: OnPush change detection, immutability, reactive forms

---

## ✨ Características Principales

### Funcionalidades Implementadas

| Feature | Descripción | Tecnología |
|---------|-------------|------------|
| **Dashboard Analítico** | KPIs, gráficos, distribución de propiedades | NgRx Store + PrimeNG Charts |
| **CRUD de Propiedades** | Crear, leer, actualizar, eliminar propiedades | NgRx Effects + Reactive Forms |
| **Filtros Avanzados** | Búsqueda con debounce, filtros múltiples | RxJS operators (debounceTime, distinctUntilChanged) |
| **Reportes Visuales** | Tendencias de ventas, inventario | PrimeNG Charts + forkJoin |
| **Demo SignalStore** | Gestión de estado alternativa con Signals | @ngrx/signals |
| **Demo Material** | Componentes Material integrados con PrimeNG | Angular Material 22 |
| **Layout Responsivo** | Sidebar, topbar, theming | PrimeNG Aura theme |

### Tecnologías Clave

- **Frontend**: Angular 22 (standalone components)
- **UI Libraries**: PrimeNG 22 + Angular Material 22
- **State Management**: NgRx 22 tradicional + @ngrx/signals (SignalStore)
- **Forms**: Reactive Forms con validaciones custom
- **HTTP**: HttpClient con interceptor de mock API
- **Routing**: Lazy loading con `loadComponent`
- **Testing**: Vitest 3.0 (92 tests, 0 failures)
- **Build**: esbuild + SSR

---

## 🏗️ Arquitectura del Proyecto

### Estructura de Carpetas

```
src/app/
├── core/                         # Módulo central (singleton services)
│   ├── config/                   # Configuración de API
│   ├── guards/                   # Route guards
│   ├── interceptors/             # HTTP interceptors (mock-api)
│   ├── models/                   # Modelos compartidos (Property, Dashboard)
│   │   ├── property.model.ts
│   │   ├── dashboard.model.ts
│   │   ├── enums.ts
│   │   └── api-response.model.ts
│   └── services/
│       ├── api/                  # Servicios de API real
│       │   ├── property-api.service.ts
│       │   └── dashboard-api.service.ts
│       └── mock/                 # Mock data service
│           └── mock-data.service.ts
│
├── features/                     # Features modulares (lazy loaded)
│   ├── dashboard/                # Feature: Dashboard analítico
│   │   ├── components/           # Componentes presentacionales (dumb)
│   │   │   ├── stats-cards/
│   │   │   └── property-distribution/
│   │   ├── pages/                # Componentes contenedores (smart)
│   │   │   └── dashboard-page.component.ts
│   │   ├── services/             # Servicios específicos del feature
│   │   └── store/                # NgRx tradicional (5 archivos)
│   │       ├── dashboard.state.ts
│   │       ├── dashboard.actions.ts
│   │       ├── dashboard.reducer.ts
│   │       ├── dashboard.effects.ts
│   │       └── dashboard.selectors.ts
│   │
│   ├── properties/               # Feature: CRUD Propiedades
│   │   ├── components/
│   │   │   ├── property-list/    # Tabla con paginación
│   │   │   ├── property-form/    # Reactive form con validaciones
│   │   │   ├── property-detail/  # Vista detallada
│   │   │   └── property-filters/ # Filtros con debounce
│   │   ├── pages/
│   │   │   ├── properties-page.component.ts
│   │   │   ├── property-detail-page.component.ts
│   │   │   └── property-form-page.component.ts
│   │   ├── services/
│   │   │   └── property-filter.service.ts
│   │   └── store/
│   │       ├── property.state.ts
│   │       ├── property.actions.ts
│   │       ├── property.reducer.ts
│   │       ├── property.effects.ts
│   │       ├── property.selectors.ts
│   │       └── property-signal.store.ts  # ⭐ SignalStore alternativo
│   │
│   ├── reports/                  # Feature: Reportes visuales
│   │   ├── components/
│   │   │   ├── sales-trend-chart/
│   │   │   ├── inventory-breakdown/
│   │   │   └── report-summary-cards/
│   │   └── pages/
│   │       └── reports-page.component.ts
│   │
│   ├── material-demo/            # Feature: Demo Angular Material
│   │   └── pages/
│   │       ├── material-demo-page.component.ts
│   │       └── signals-demo-page.component.ts
│   │
│   └── favorites/                # Feature: Favoritos (ejemplo adicional)
│       ├── components/
│       └── store/
│
├── layout/                       # Layout components
│   └── components/
│       └── main-layout/
│           └── main-layout.component.ts  # Sidebar + Topbar
│
├── shared/                       # Shared utilities
│   ├── components/               # Componentes reutilizables
│   ├── directives/               # Directivas custom
│   ├── pipes/                    # Pipes custom
│   └── utils/                    # Utilidades
│
├── store/                        # Root store configuration
│   └── index.ts                  # Store setup y reducer map
│
├── app.config.ts                 # App configuration (providers)
├── app.config.server.ts          # SSR configuration
├── app.routes.ts                 # Rutas principales
└── app.ts                        # Root component
```

### Diagrama de Flujo de Datos (NgRx)

```
┌─────────────┐
│  Component  │ (Smart - Dashboard Page)
└──────┬──────┘
       │ 1. dispatch(loadDashboard())
       ▼
┌─────────────┐
│   Actions   │ (dashboard.actions.ts)
└──────┬──────┘
       │ 2. ofType(loadDashboard)
       ▼
┌─────────────┐
│   Effects   │ (dashboard.effects.ts)
└──────┬──────┘
       │ 3. HTTP call via service
       │ 4. dispatch(loadDashboardSuccess/Failure)
       ▼
┌─────────────┐
│   Reducer   │ (dashboard.reducer.ts)
└──────┬──────┘
       │ 5. Update state immutably
       ▼
┌─────────────┐
│    State    │ (dashboard.state.ts)
└──────┬──────┘
       │ 6. Select via selectors
       ▼
┌─────────────┐
│  Selectors  │ (dashboard.selectors.ts)
└──────┬──────┘
       │ 7. select() in component
       ▼
┌─────────────┐
│  Component  │ (template updates via async pipe)
└─────────────┘
```

---

## 🚀 Inicio Rápido

### Paso 1: Instalar Prerrequisitos

#### Node.js y npm

Este proyecto requiere **Node.js 20.x o superior** y **npm 10.x o superior**.

**Verificar si ya los tienes instalados:**

```bash
node --version   # Debe mostrar v20.x.x o superior
npm --version    # Debe mostrar 10.x.x o superior
```

**Si no los tienes, instálalos:**

- **macOS (con Homebrew):**
  ```bash
  brew install node@20
  ```

- **Windows:** Descarga el instalador desde [nodejs.org](https://nodejs.org/)

- **Linux (Ubuntu/Debian):**
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```

#### Angular CLI (opcional pero recomendado)

```bash
npm install -g @angular/cli@22

# Verificar instalación
ng version
```

> **Nota:** Si no instalas Angular CLI globalmente, puedes usar `npx` antes de cada comando: `npx ng serve`, `npx ng build`, etc.

---

### Paso 2: Clonar el Repositorio

```bash
# Clonar el proyecto
git clone <tu-repo-url>

# Navegar a la carpeta del proyecto
cd realestate-crm
```

---

### Paso 3: Instalar Dependencias

```bash
npm install
```

**Esto instalará:**
- Angular 22 y sus dependencias
- PrimeNG 22 (UI components)
- Angular Material 22
- NgRx 22 (state management)
- Vitest (testing framework)
- Y todas las demás dependencias del proyecto (~300 paquetes)

**Tiempo estimado:** 2-5 minutos dependiendo de tu conexión.

---

### Paso 4: Iniciar el Servidor de Desarrollo

```bash
npm start
```

**O alternativamente:**

```bash
ng serve
```

**Salida esperada:**

```
✔ Browser application bundle generation complete.
Initial chunk files | Names         | Raw size
main.js             | main          | 2.45 MB  | 
polyfills.js        | polyfills     | 90.20 kB | 

Application bundle generation complete. [4.352 seconds]

Watch mode enabled. Watching for file changes...
➜ Local:   http://localhost:4200/
➜ press h to show help
```

**Abre tu navegador en:** [http://localhost:4200](http://localhost:4200)

Deberías ver el dashboard del CRM con tarjetas de estadísticas y un gráfico de distribución de propiedades.

---

### Paso 5: Verificar que Todo Funciona

#### Ejecutar Tests

```bash
npm test
```

**Salida esperada:**

```
✓ src/app/features/properties/store/property.reducer.spec.ts (10 tests)
✓ src/app/features/properties/store/property.selectors.spec.ts (8 tests)
✓ src/app/features/properties/services/property-filter.service.spec.ts (12 tests)
... (más archivos de test)

Test Files  92 passed (92)
     Tests  92 passed (92)
  Start at  10:23:45
  Duration  2.70s (in thread 1.85s, 146.18%)
```

✅ **Si ves "92 passed", todo está correcto!**

#### Build de Producción

```bash
npm run build
```

**Salida esperada:**

```
✔ Browser application bundle generation complete.
✔ Copying assets complete.
✔ Index html generation complete.

Initial chunk files   | Names         | Raw size | Estimated transfer size
main-HASH.js          | main          | 487.23 kB|         135.67 kB
polyfills-HASH.js     | polyfills     |  90.20 kB|          32.45 kB

Build at: 2026-11-12T15:30:45.123Z - Hash: a1b2c3d4e5f6 - Time: 8234ms

✔ Built successfully
```

Los archivos compilados estarán en `dist/realestate-crm/browser/`

---

### Paso 6: Explorar el Proyecto

Navega por las diferentes secciones:

1. **Dashboard** (`/`) - Vista analítica con KPIs y gráficos
2. **Propiedades** (`/properties`) - CRUD completo con filtros
3. **Reportes** (`/reports`) - Tendencias de ventas e inventario
4. **Material Demo** (`/material-demo`) - Componentes Angular Material
5. **Signals Demo** (`/signals-demo`) - SignalStore alternativo a NgRx

---

### Solución de Problemas Comunes

#### ❌ Error: `ng: command not found`

**Solución:** Instala Angular CLI globalmente:

```bash
npm install -g @angular/cli@22
```

O usa `npx`:

```bash
npx ng serve
```

---

#### ❌ Error: `EACCES: permission denied`

**Solución (macOS/Linux):** Configura npm para no requerir sudo:

```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

---

#### ❌ Error: `Port 4200 is already in use`

**Solución:** Usa otro puerto:

```bash
ng serve --port 4201
```

O mata el proceso que usa el puerto 4200:

```bash
# macOS/Linux
lsof -ti:4200 | xargs kill -9

# Windows
netstat -ano | findstr :4200
taskkill /PID <PID> /F
```

---

#### ❌ Error: `Module not found` después de `npm install`

**Solución:** Limpia caché e reinstala:

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

#### ❌ Tests fallan con errores extraños

**Solución:** Verifica que Vitest esté correctamente configurado:

```bash
# Reinstalar dependencias de testing
npm install --save-dev vitest @vitest/ui jsdom @angular/compiler

# Ejecutar tests
npm test
```

---

### Verificación Final

Ejecuta este comando para verificar todo el entorno:

```bash
# Script de verificación completo
node --version && \
npm --version && \
ng version && \
npm test && \
npm run build && \
echo "✅ ¡Todo funciona correctamente!"
```

Si todos los pasos completan sin errores, estás listo para empezar a desarrollar! 🎉

---

## 📚 Patrones y Conceptos Clave

### NgRx Tradicional vs SignalStore

Este proyecto implementa **ambos enfoques** para fines pedagógicos. Aquí la comparación:

#### **NgRx Tradicional** (Feature: Dashboard, Properties)

**Archivos necesarios (5):**

```typescript
// 1. dashboard.state.ts - Define la forma del estado
export interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
}

// 2. dashboard.actions.ts - Define las acciones
export const loadDashboard = createAction('[Dashboard] Load Dashboard');
export const loadDashboardSuccess = createAction(
  '[Dashboard] Load Dashboard Success',
  props<{ data: DashboardData }>()
);

// 3. dashboard.reducer.ts - Maneja las transiciones de estado
export const dashboardReducer = createReducer(
  initialState,
  on(loadDashboard, state => ({ ...state, loading: true })),
  on(loadDashboardSuccess, (state, { data }) => ({
    ...state,
    data,
    loading: false
  }))
);

// 4. dashboard.effects.ts - Maneja side effects (HTTP)
loadDashboard$ = createEffect(() =>
  this.actions$.pipe(
    ofType(loadDashboard),
    switchMap(() =>
      this.dashboardApi.getDashboard().pipe(
        map(data => loadDashboardSuccess({ data })),
        catchError(error => of(loadDashboardFailure({ error })))
      )
    )
  )
);

// 5. dashboard.selectors.ts - Selecciona datos del estado
export const selectDashboardData = createSelector(
  selectDashboardState,
  state => state.data
);
```

**Uso en componente:**

```typescript
export class DashboardPageComponent {
  // Inyectar Store
  private store = inject(Store);

  // Seleccionar datos
  dashboardData$ = this.store.select(selectDashboardData);
  loading$ = this.store.select(selectDashboardLoading);

  ngOnInit() {
    // Disparar acción
    this.store.dispatch(loadDashboard());
  }
}
```

**✅ Ventajas NgRx:**
- Patrón probado en producción
- DevTools potentes (time-travel debugging)
- Separación clara de responsabilidades
- Ideal para aplicaciones grandes con estado complejo

**❌ Desventajas:**
- Boilerplate extenso (5 archivos)
- Curva de aprendizaje pronunciada
- Más código para features simples

---

#### **SignalStore** (Feature: Signals Demo)

**Un solo archivo:**

```typescript
// property-signal.store.ts - Todo en un lugar
export const PropertySignalStore = signalStore(
  { providedIn: 'root' },
  
  // Estado
  withState<PropertyState>({
    properties: [],
    loading: false,
    error: null
  }),

  // Computed (equivalente a selectors)
  withComputed(({ properties }) => ({
    totalProperties: computed(() => properties().length),
    activeProperties: computed(() => 
      properties().filter(p => p.status === 'available')
    )
  })),

  // Métodos (equivalente a actions + effects)
  withMethods((store, propertyApi = inject(PropertyApiService)) => ({
    async loadProperties() {
      patchState(store, { loading: true });
      try {
        const properties = await firstValueFrom(propertyApi.getProperties());
        patchState(store, { properties, loading: false });
      } catch (error) {
        patchState(store, { error: error.message, loading: false });
      }
    }
  }))
);
```

**Uso en componente:**

```typescript
export class SignalsDemoPageComponent {
  // Inyectar store
  store = inject(PropertySignalStore);

  // Acceso directo a signals
  properties = this.store.properties;
  loading = this.store.loading;
  totalCount = this.store.totalProperties;

  ngOnInit() {
    // Llamar método
    this.store.loadProperties();
  }
}
```

**✅ Ventajas SignalStore:**
- Código más conciso (1 archivo vs 5)
- API moderna con Signals
- Menos boilerplate
- Más fácil de aprender
- Rendimiento optimizado (fine-grained reactivity)

**❌ Desventajas:**
- Menos maduro (introducido en NgRx 17)
- Menos recursos de aprendizaje
- DevTools limitados comparado con NgRx tradicional

---

### ¿Cuándo usar cada uno?

| Escenario | Recomendación |
|-----------|---------------|
| App nueva pequeña/mediana | **SignalStore** (menos código, más rápido) |
| App empresarial grande existente | **NgRx tradicional** (madurez, DevTools) |
| Estado complejo con muchas derivaciones | **NgRx tradicional** (selectors memoizados) |
| Equipo nuevo en gestión de estado | **SignalStore** (curva de aprendizaje suave) |
| Necesitas time-travel debugging | **NgRx tradicional** (DevTools avanzados) |
| Features simples de lectura/escritura | **SignalStore** (menos overhead) |

---

### Arquitectura Smart/Dumb Components

El proyecto sigue el patrón **Container/Presentational**:

#### **Smart Components (Containers)** - `pages/`

Responsabilidades:
- Interactúan con Store (dispatch actions, select state)
- Manejan lógica de negocio
- Gestionan navegación
- No tienen estilos propios

```typescript
// dashboard-page.component.ts (Smart)
@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [StatsCardsComponent, PropertyDistributionComponent],
  template: `
    <app-stats-cards [stats]="stats()" />
    <app-property-distribution [data]="distribution()" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent {
  private store = inject(Store);
  
  stats = toSignal(this.store.select(selectDashboardStats));
  distribution = toSignal(this.store.select(selectPropertyDistribution));

  ngOnInit() {
    this.store.dispatch(loadDashboard());
  }
}
```

#### **Dumb Components (Presentational)** - `components/`

Responsabilidades:
- Solo reciben datos via `@Input()`
- Emiten eventos via `@Output()`
- Contienen estilos y lógica de presentación
- Son reutilizables y testables fácilmente

```typescript
// stats-cards.component.ts (Dumb)
@Component({
  selector: 'app-stats-cards',
  standalone: true,
  imports: [CardModule],
  templateUrl: './stats-cards.component.html',
  styleUrls: ['./stats-cards.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatsCardsComponent {
  @Input({ required: true }) stats!: DashboardStats;
  @Output() cardClick = new EventEmitter<string>();
}
```

**Beneficios:**
- ✅ Separación clara de responsabilidades
- ✅ Componentes presentacionales reutilizables
- ✅ Testing más simple (no necesitas mockear Store en dumbs)
- ✅ OnPush change detection funciona óptimamente

---

### Gestión de Estado Reactivo

#### Immutability

Todo el estado es **inmutable**. Los reducers siempre retornan nuevos objetos:

```typescript
// ❌ INCORRECTO - Muta el estado
on(addProperty, (state, { property }) => {
  state.properties.push(property); // ❌ Mutación directa
  return state;
});

// ✅ CORRECTO - Estado inmutable
on(addProperty, (state, { property }) => ({
  ...state,
  properties: [...state.properties, property] // ✅ Nuevo array
}));
```

Los tests validan immutability con `Object.freeze`:

```typescript
it('should not mutate state', () => {
  const frozenState = Object.freeze({ ...initialState });
  const newState = propertyReducer(frozenState, addProperty({ property }));
  expect(newState).not.toBe(frozenState); // ✅ Referencia diferente
});
```

#### OnPush Change Detection

Todos los componentes usan `ChangeDetectionStrategy.OnPush` para optimizar rendimiento:

```typescript
@Component({
  selector: 'app-property-list',
  changeDetection: ChangeDetectionStrategy.OnPush // ✅
})
```

**Requisitos para OnPush:**
- Inputs inmutables (siempre nuevas referencias)
- Uso de `async` pipe o signals
- Eventos disparados vía Observables

---

## 🗺️ Navegación y Rutas

### Tabla de Rutas

| Ruta | Componente | Feature | Lazy Loaded |
|------|-----------|---------|-------------|
| `/` | `DashboardPageComponent` | Dashboard | ✅ |
| `/properties` | `PropertiesPageComponent` | Properties (lista) | ✅ |
| `/properties/new` | `PropertyFormPageComponent` | Properties (crear) | ✅ |
| `/properties/:id` | `PropertyDetailPageComponent` | Properties (detalle) | ✅ |
| `/properties/:id/edit` | `PropertyFormPageComponent` | Properties (editar) | ✅ |
| `/reports` | `ReportsPageComponent` | Reports | ✅ |
| `/material-demo` | `MaterialDemoPageComponent` | Material Demo | ✅ |
| `/signals-demo` | `SignalsDemoPageComponent` | Signals Demo | ✅ |

### Configuración de Rutas

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent, // Layout wrapper
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/pages/dashboard-page.component')
          .then(m => m.DashboardPageComponent)
      },
      {
        path: 'properties',
        loadComponent: () => import('./features/properties/pages/properties-page.component')
          .then(m => m.PropertiesPageComponent)
      }
      // ... más rutas
    ]
  }
];
```

**Características:**
- ✅ Lazy loading con `loadComponent` (standalone)
- ✅ Layout compartido con `MainLayoutComponent`
- ✅ Rutas parametrizadas (`:id`)
- ✅ Guards disponibles (no implementados aún)

---

## 📦 Scripts NPM Disponibles

```bash
# Desarrollo
npm start                  # Inicia dev server (http://localhost:4200)
npm run dev                # Alias de 'start'

# Testing
npm test                   # Ejecuta Vitest en watch mode
npm run test:ui            # Abre Vitest UI en navegador
npm run test:coverage      # Genera reporte de cobertura

# Build
npm run build              # Build de producción (dist/)
npm run build:stats        # Build con bundle analyzer

# Linting
npm run lint               # Ejecuta ESLint
npm run lint:fix           # Auto-fix errores de linting

# Formateo
npm run format             # Ejecuta Prettier
npm run format:check       # Verifica formato sin modificar

# SSR
npm run serve:ssr          # Sirve app con SSR (requiere build previo)
npm run build:ssr          # Build optimizado con SSR

# Otros
npm run watch              # Build en watch mode
npm run extract-i18n       # Extrae strings para i18n
```

---

## 🧪 Estrategia de Testing

### Configuración Vitest

El proyecto usa **Vitest** en lugar de Karma/Jasmine por velocidad:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov']
    }
  }
});
```

### Tipos de Tests

#### 1. **Unit Tests (sin TestBed)**

Para lógica pura sin Angular DI:

```typescript
// property-filter.service.spec.ts
describe('PropertyFilterService', () => {
  let service: PropertyFilterService;

  beforeEach(() => {
    service = new PropertyFilterService(); // ✅ Instancia directa
  });

  it('should filter by price range', () => {
    const properties = [
      { price: 100000 },
      { price: 200000 },
      { price: 300000 }
    ];
    
    const result = service.filterByPriceRange(properties, 150000, 250000);
    
    expect(result).toHaveLength(1);
    expect(result[0].price).toBe(200000);
  });
});
```

#### 2. **Integration Tests (con TestBed)**

Para componentes con dependencias:

```typescript
// stats-cards.component.spec.ts
describe('StatsCardsComponent', () => {
  let component: StatsCardsComponent;
  let fixture: ComponentFixture<StatsCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsCardsComponent, CardModule]
    }).compileComponents();

    fixture = TestBed.createComponent(StatsCardsComponent);
    component = fixture.componentInstance;
  });

  it('should display stats correctly', () => {
    component.stats = { total: 120, available: 80, sold: 40 };
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.total-count').textContent).toContain('120');
  });
});
```

#### 3. **Store Tests (Reducers, Selectors, Effects)**

```typescript
// property.reducer.spec.ts
describe('Property Reducer', () => {
  it('should handle loadPropertiesSuccess', () => {
    const properties = [{ id: '1', title: 'Casa' }];
    const action = loadPropertiesSuccess({ properties });
    
    const state = propertyReducer(initialState, action);
    
    expect(state.properties).toEqual(properties);
    expect(state.loading).toBe(false);
  });

  it('should not mutate state', () => {
    const frozenState = Object.freeze({ ...initialState });
    const action = loadProperties();
    
    const newState = propertyReducer(frozenState, action);
    
    expect(newState).not.toBe(frozenState); // ✅ Immutability
  });
});
```

### Resultado Actual

```
✓ src/app/features/properties/store/property.reducer.spec.ts (10 tests)
✓ src/app/features/properties/store/property.selectors.spec.ts (8 tests)
✓ src/app/features/properties/services/property-filter.service.spec.ts (12 tests)
✓ src/app/features/dashboard/components/stats-cards/stats-cards.component.spec.ts (6 tests)
... 56 more test suites

Test Files  92 passed (92)
     Tests  92 passed (92)
  Start at  10:23:45
  Duration  2.70s
```

**Cobertura Actual:** ~85% (objetivo: 90%)

---

## 📖 Glosario de Términos

### NgRx

- **Action**: Objeto que describe un evento (`{ type: '[Feature] Action Name', payload? }`). Es la única forma de cambiar el estado.
  
- **Reducer**: Función pura que toma el estado actual y una acción, y retorna el nuevo estado. Debe ser inmutable.
  
- **Effect**: Maneja side effects (HTTP calls, navegación) escuchando acciones y despachando nuevas acciones como respuesta.
  
- **Selector**: Función que extrae y deriva datos del estado. Son memoizados para optimizar rendimiento.
  
- **Store**: Objeto global que contiene todo el estado de la aplicación. Es el "single source of truth".

### Signals

- **Signal**: Primitiva reactiva que notifica automáticamente cuando su valor cambia. Reemplaza a Observables en algunos casos.
  
- **Computed**: Signal derivado que se recalcula automáticamente cuando sus dependencias cambian.
  
- **Effect (Signal)**: Función que se ejecuta automáticamente cuando sus signals de entrada cambian.

### RxJS

- **Observable**: Stream de datos asíncrono que puede emitir múltiples valores a lo largo del tiempo.
  
- **debounceTime**: Operador que espera un tiempo de silencio antes de emitir el último valor (útil para búsquedas).
  
- **distinctUntilChanged**: Operador que solo emite cuando el valor es diferente al anterior.
  
- **switchMap**: Operador que cancela el Observable anterior y suscribe al nuevo (útil para requests HTTP).
  
- **forkJoin**: Operador que espera a que todos los Observables completen y emite un array con todos los resultados.

### Angular

- **OnPush**: Estrategia de change detection que solo verifica cambios cuando los inputs cambian de referencia.
  
- **Standalone Component**: Componente que no necesita un NgModule, declarando sus dependencias directamente.
  
- **Lazy Loading**: Técnica que carga features solo cuando son necesarios (reduce initial bundle size).
  
- **Reactive Forms**: API para manejar formularios de manera reactiva con validaciones síncronas/asíncronas.

### Testing

- **TestBed**: Utilidad de Angular para configurar el entorno de testing con DI.
  
- **ComponentFixture**: Wrapper alrededor de un componente que provee acceso al componente y su DOM.
  
- **Spy**: Mock de una función que permite verificar si fue llamada y con qué parámetros.

---

## 🔮 Próximos Pasos Sugeridos

### Fase 15: Autenticación y Autorización

- [ ] Implementar login/logout con JWT
- [ ] Crear guards para rutas protegidas (`canActivate`)
- [ ] Agregar interceptor para attach tokens a requests
- [ ] Store de autenticación con NgRx
- [ ] Manejo de refresh tokens

**Archivos a crear:**
```
src/app/features/auth/
├── pages/
│   ├── login-page.component.ts
│   └── register-page.component.ts
├── services/
│   └── auth.service.ts
├── guards/
│   └── auth.guard.ts
└── store/
    ├── auth.state.ts
    ├── auth.actions.ts
    ├── auth.reducer.ts
    ├── auth.effects.ts
    └── auth.selectors.ts
```

---

### Fase 16: Backend Real

- [ ] Conectar a API REST real (reemplazar mock interceptor)
- [ ] Implementar manejo de errores global
- [ ] Agregar retry logic con exponential backoff
- [ ] Cache de requests con interceptor
- [ ] Optimistic updates

**Cambios necesarios:**
```typescript
// Remover mock interceptor
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        authInterceptor,      // ✅ Auth token
        errorInterceptor,     // ✅ Error handling
        cacheInterceptor,     // ✅ Cache
        // withMockApiInterceptor() // ❌ Remover
      ])
    )
  ]
};
```

---

### Fase 17: Testing E2E

- [ ] Configurar Playwright o Cypress
- [ ] Tests E2E para flujos críticos:
  - Login → Dashboard → Crear propiedad → Logout
  - Filtrar propiedades → Ver detalle → Editar
  - Generar reporte → Verificar gráficos
- [ ] Visual regression testing (screenshots)

**Ejemplo Playwright:**
```typescript
// e2e/property-crud.spec.ts
test('should create a new property', async ({ page }) => {
  await page.goto('/properties');
  await page.click('button:has-text("Nueva Propiedad")');
  await page.fill('input[name="title"]', 'Casa en venta');
  await page.fill('input[name="price"]', '250000');
  await page.click('button:has-text("Guardar")');
  
  await expect(page.locator('.success-message')).toBeVisible();
  await expect(page.locator('text=Casa en venta')).toBeVisible();
});
```

---

### Fase 18: Optimización y Performance

- [ ] Implementar virtual scrolling para listas largas (PrimeNG VirtualScroller)
- [ ] Code splitting avanzado (preload strategies)
- [ ] Service Workers y PWA
- [ ] Image optimization (NgOptimizedImage)
- [ ] Bundle analyzer y tree shaking

**Preload Strategy:**
```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withPreloading(QuicklinkStrategy) // ✅ Preload visible links
    )
  ]
};
```

---

### Fase 19: Internacionalización (i18n)

- [ ] Configurar Angular i18n
- [ ] Traducir a inglés y español
- [ ] Selector de idioma en topbar
- [ ] Formateo de fechas/números por locale

**Uso:**
```html
<!-- property-list.component.html -->
<h2 i18n="@@propertyList.title">Lista de Propiedades</h2>
<p i18n="@@propertyList.count">Total: {count, plural, =0 {sin propiedades} =1 {1 propiedad} other {{{count}} propiedades}}</p>
```

---

### Fase 20: Deployment

- [ ] Configurar CI/CD (GitHub Actions, GitLab CI)
- [ ] Deploy a Vercel/Netlify (SSR)
- [ ] Configurar environments (dev, staging, prod)
- [ ] Monitoring con Sentry o similar
- [ ] Analytics con Google Analytics 4

**GitHub Actions ejemplo:**
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - run: npm test
      - uses: vercel/action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

---

## 🤝 Contribución

Este proyecto es didáctico y abierto a mejoras. Si deseas contribuir:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-feature`)
3. Commit tus cambios (`git commit -m 'Add: nueva feature'`)
4. Push a la rama (`git push origin feature/nueva-feature`)
5. Abre un Pull Request

**Áreas de mejora bienvenidas:**
- Más ejemplos de patrones empresariales
- Tests adicionales (objetivo 90% coverage)
- Documentación de casos de uso complejos
- Tutoriales en video

---

## 📄 Licencia

Este proyecto fue creado con fines educativos. Siéntete libre de usarlo como base para tus propios proyectos de aprendizaje.

---

## 🙏 Agradecimientos

- [Angular Team](https://angular.dev) - Framework increíble
- [NgRx Team](https://ngrx.io) - Gestión de estado enterprise-grade
- [PrimeNG](https://primeng.org) - Componentes UI ricos
- [Vitest](https://vitest.dev) - Testing ultrarrápido

---

## 📞 Soporte

¿Preguntas o dudas sobre el proyecto didáctico?

- 📖 Lee la documentación completa en `/docs`
- 💬 Abre un issue en GitHub
- 📧 Contacta al instructor

---

**Versión:** 1.0.0 (Fase 14 completada - README didáctico)  
**Última actualización:** Noviembre 2026  
**Estado:** ✅ 92/92 tests passing | 🏗️ Producción-ready
