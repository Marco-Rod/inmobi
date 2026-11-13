import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * App Component (Root)
 *
 * Componente raíz de la aplicación.
 * Solo contiene el router-outlet que renderiza los componentes según la ruta.
 * El layout (navbar, sidebar, footer) se implementará en la Fase 11.
 */
@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('RealState CRM');
}
