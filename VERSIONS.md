# Versiones de Dependencias

## Fecha de Creación
**12 de noviembre de 2026**

---

## Resumen Ejecutivo

Este proyecto utiliza **Angular 22.2.0** con las últimas versiones compatibles de todas las dependencias necesarias. Todas las versiones han sido verificadas para compatibilidad mutua.

---

## Entorno de Desarrollo

| Herramienta | Versión | Notas |
|-------------|---------|-------|
| **Node.js** | 26.3.0 | LTS compatible con Angular 22 |
| **npm** | 12.2.0 | Gestor de paquetes |
| **Angular CLI** | 22.2.7 | Herramienta de línea de comandos |

---

## Dependencias de Producción

### Framework Principal

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `@angular/core` | 22.2.0 | Framework principal de Angular |
| `@angular/common` | 22.2.0 | Directivas y pipes comunes |
| `@angular/compiler` | 22.2.0 | Compilador de Angular |
| `@angular/forms` | 22.2.0 | Formularios reactivos y template-driven |
| `@angular/platform-browser` | 22.2.0 | Renderizado en navegador |
| `@angular/platform-server` | 22.2.0 | Server-Side Rendering (SSR) |
| `@angular/router` | 22.2.0 | Sistema de rutas |
| `@angular/ssr` | 22.2.7 | Utilidades SSR |

### Estado y Programación Reactiva

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `rxjs` | 7.8.0 | Programación reactiva con Observables |
| `@ngrx/store` | 22.0.1 | State management centralizado |
| `@ngrx/effects` | 22.0.1 | Side effects y operaciones asíncronas |
| `@ngrx/signals` | 22.0.1 | SignalStore para estado con Signals |
| `@ngrx/store-devtools` | 22.0.1 | Herramientas de depuración del store |

### Componentes UI

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `primeng` | 21.1.10 | Biblioteca de componentes UI principal |
| `primeicons` | 8.0.2 | Iconos de PrimeNG |
| `@angular/material` | 22.2.7 | Material Design (demostración) |
| `@angular/cdk` | 22.2.7 | Component Dev Kit de Angular |

### Gráficos y Visualización

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `ng2-charts` | 11.0.0 | Wrapper Angular para Chart.js |
| `chart.js` | 4.6.1 | Motor de gráficos |

### Otros

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `express` | 5.1.0 | Servidor para SSR |
| `tslib` | 2.3.0 | Runtime library de TypeScript |

---

## Dependencias de Desarrollo

### Compilación y Build

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `@angular/build` | 22.2.7 | Sistema de build de Angular |
| `@angular/compiler-cli` | 22.2.0 | Compilador CLI |
| `typescript` | 6.0.2 | Lenguaje TypeScript |

### Testing

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `vitest` | 5.0.0 | Test runner moderno |
| `jsdom` | 30.0.0 | DOM virtual para testing |

### Linting y Formateo

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `eslint` | 10.14.0 | Linter de JavaScript/TypeScript |
| `@angular-eslint/builder` | 22.6.0 | Builder de ESLint para Angular |
| `@angular-eslint/eslint-plugin` | 22.6.0 | Reglas ESLint para Angular |
| `@angular-eslint/eslint-plugin-template` | 22.6.0 | Reglas para templates Angular |
| `@angular-eslint/schematics` | 22.6.0 | Schematics de Angular ESLint |
| `@angular-eslint/template-parser` | 22.6.0 | Parser de templates |
| `@typescript-eslint/eslint-plugin` | 8.72.2 | Plugin ESLint para TypeScript |
| `@typescript-eslint/parser` | 8.72.2 | Parser TypeScript para ESLint |
| `prettier` | 3.8.1 | Formateador de código |

### Tipos TypeScript

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `@types/express` | 5.0.1 | Tipos para Express |
| `@types/node` | 22.12.0 | Tipos para Node.js |

---

## Notas Importantes

### ⚠️ PrimeNG 21 con Angular 22

**Situación:** PrimeNG 21.1.10 es la última versión open-source. PrimeNG 22 requiere licencia comercial desde junio 2026.

**Solución implementada:** Se instaló con `--legacy-peer-deps` para permitir el uso de PrimeNG 21 con Angular 22.

**Impacto:** 
- ✅ Funciona correctamente para propósitos didácticos
- ✅ API estable y madura
- ⚠️ No recibirá actualizaciones de seguridad futuras
- ⚠️ Para producción considerar:
  - Migrar a **Optimus UI** (fork MIT de PrimeNG)
  - Usar **Angular Material** exclusivamente
  - Adquirir licencia de PrimeNG 22+

### TypeScript Strict Mode

El proyecto está configurado con **TypeScript strict mode habilitado**:

```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "strictFunctionTypes": true,
  "strictBindCallApply": true,
  "strictPropertyInitialization": true,
  "noImplicitThis": true,
  "alwaysStrict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true
}
```

Esto garantiza:
- Máxima seguridad de tipos
- Detección temprana de errores
- Mejor autocompletado en IDE
- Código más mantenible

---

## Actualización de Dependencias

### Cómo actualizar Angular

```bash
# Actualizar Angular CLI global
npm install -g @angular/cli@latest

# Actualizar proyecto con ng update
ng update @angular/core @angular/cli

# Actualizar NgRx
ng update @ngrx/store

# Actualizar PrimeNG (cuando esté disponible)
ng update primeng
```

### Verificar compatibilidad

Antes de actualizar, siempre revisar:
1. [Angular Update Guide](https://update.angular.dev/)
2. [NgRx Compatibility Matrix](https://ngrx.io/guide/migration/v22)
3. [PrimeNG Changelog](https://www.primefaces.org/primeng/showcase/#/setup)

---

## Comandos de Verificación

```bash
# Verificar versiones instaladas
npm list --depth=0

# Verificar vulnerabilidades
npm audit

# Verificar versiones obsoletas
npm outdated

# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

---

## Compatibilidad de Navegadores

Angular 22 soporta:

| Navegador | Versión Mínima |
|-----------|----------------|
| Chrome | Últimas 2 versiones |
| Firefox | Últimas 2 versiones, ESR |
| Edge | Últimas 2 versiones |
| Safari | Últimas 2 versiones |
| iOS Safari | Últimas 2 versiones |
| Android Chrome | Últimas 2 versiones |

---

## Referencias

- [Angular Docs](https://angular.dev/)
- [NgRx Docs](https://ngrx.io/)
- [RxJS Docs](https://rxjs.dev/)
- [PrimeNG Docs](https://www.primefaces.org/primeng/)
- [TypeScript Docs](https://www.typescriptlang.org/)
- [Chart.js Docs](https://www.chartjs.org/)

---

**Última actualización:** 12 de noviembre de 2026
