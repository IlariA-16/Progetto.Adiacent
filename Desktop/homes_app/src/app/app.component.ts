import { Component } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-root',
    template: `
    <main>
      <header class="brand-name">
        <!-- AGGIUNTO: Link che riporta alla Home cliccando sul logo -->
        <a [routerLink]="['/']" style="cursor: pointer; display: flex; align-items: center;">
          <img class="brand-logo" src="/assets/logo.svg" alt="logo" aria-hidden="true">
        </a>

         <div class="nav-links">
          <a [routerLink]="['/dashboard']" class="btn-dashboard-page">🚀 La mia Dashboard</a>
          <a [routerLink]="['/favorites']" class="btn-fav-page">
            ⭐ I miei Preferiti
          </a>
          
          <a [routerLink]="['/about']" class="btn-about-page">
            ℹ️ Chi Siamo
          </a>
        </div>
      </header>
      <section class="content">
        <router-outlet> </router-outlet>
      </section>
    </main>
  `,

  styleUrls: ['./app.component.css'],
  imports:[HomeComponent, RouterModule]
})
export class AppComponent {
  title = 'homes';
}
