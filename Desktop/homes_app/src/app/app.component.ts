import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DbService } from './db.service';
import { HousingLocation } from './housing-location'; 
import housingData from '../../db.json';

@Component({
  standalone: true,
  selector: 'app-root',
  template: `
    <main>
      <header class="brand-name">
        <a [routerLink]="['/']" style="cursor: pointer; display: flex; align-items: center;">
          <img class="brand-logo" src="/assets/logo.svg" alt="logo" aria-hidden="true">
        </a>

        <div class="nav-links">
          <a [routerLink]="['/dashboard']" class="btn-dashboard-page">🚀 La mia Dashboard</a>
          <a [routerLink]="['/add']" class="btn-add-page">➕ Aggiungi Casa</a>
          <a [routerLink]="['/favorites']" class="btn-fav-page">⭐ I miei Preferiti</a>
          <a [routerLink]="['/about']" class="btn-about-page">ℹ️ Chi Siamo</a>
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
      const data = (housingData as any)?.locations as HousingLocation[];

      if (data && data.length > 0) {
        await this.dbService.seedDatabase(data);
        console.log('Dexie inizializzato correttamente');
      } else {
        console.warn('Nessun dato trovato in db.json');
      }

    } catch (error) {
      console.error('Errore durante inizializzazione Dexie:', error);
    }
  }
}