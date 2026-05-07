import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DbService } from './db.service';
import { HousingLocation } from './housing-location';

@Component({
  standalone: true,
  selector: 'app-root',
  template: `
    <main>
      <header class="brand-name">
        <a [routerLink]="['/']">
          <img class="brand-logo" src="/assets/logo.svg" alt="logo" aria-hidden="true">
        </a>
        
        <div class="nav-links">
          <!-- Tutti i bottoni ora condividono lo stesso stile grafico -->
          <a [routerLink]="['/dashboard']" class="nav-button">
            <span>📊</span> <span>La mia Dashboard</span>
          </a>

          <a [routerLink]="['/favorites']" class="nav-button">
            <span>⭐</span> <span>I miei Preferiti</span>
          </a>
          
          <a [routerLink]="['/add']" class="nav-button">
            <span>➕</span> <span>Aggiungi Casa</span>
          </a>
          
          <a [routerLink]="['/about']" class="nav-button">
            <span>ℹ️</span> <span>Chi Siamo</span>
          </a>
        </div>
      </header>

      <section class="content">
        <router-outlet></router-outlet>
      </section>
    </main>
  `,
  styleUrls: ['./app.component.css'],
  imports: [HomeComponent, RouterModule]
})
export class AppComponent implements OnInit {
  title = 'homes';

  constructor(private dbService: DbService) {}

  async ngOnInit(): Promise<void> {
    try {
      const response = await fetch('http://localhost:3000/locations');
      if (!response.ok) throw new Error(`Server status: ${response.status}`);
      const data: HousingLocation[] = await response.json();

      if (data && data.length > 0) {
        await this.dbService.seedDatabase(data);
      }
    } catch (error) {
      console.error('Errore inizializzazione Dexie:', error);
    }
  }
}
