import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DbService } from './db.service';
import { HousingLocation } from './housing-location'; 
import housingData from '../../db.json';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
          <div class="lang-selector">
            <button (click)="changelang('it')" [class.active]="translate.currentLang === 'it'" class="btn-it">IT</button>
            <button (click)="changelang('en')" [class.active]="translate.currentLang === 'en'" class="btn-en">EN</button>
          </div>
          
          <a [routerLink]="['/dashboard']" class="btn-dashboard-page">🚀 {{ 'NAV.DASHBOARD' | translate }}</a>
          <a [routerLink]="['/add']" class="btn-add-page">➕ {{ 'NAV.ADD' | translate }}</a>
          <a [routerLink]="['/favorites']" class="btn-fav-page">⭐ {{ 'NAV.FAVORITES' | translate }}</a>
          <a [routerLink]="['/about']" class="btn-about-page">ℹ️ {{ 'NAV.ABOUT' | translate }}</a>
        </div>
      </header>

      <section class="content">
        <router-outlet></router-outlet>
      </section>
    </main>
  `,
  styleUrls: ['./app.component.css'],
  imports: [HomeComponent, RouterModule, TranslateModule]
})
export class AppComponent implements OnInit {
  title = 'homes';

  constructor(private dbService: DbService, public translate: TranslateService) {
    // MODIFICA: Usiamo setFallbackLang per evitare il warning di deprecazione
    this.translate.setFallbackLang('it');
    
    // Recupera la lingua salvata nel localStorage o usa l'italiano come default
    const savedLang = localStorage.getItem('userLanguage') || 'it';
    this.translate.use(savedLang);
  }

  // Funzione per cambiare lingua e salvare la preferenza nel browser
  changelang(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('userLanguage', lang);
  }

  async ngOnInit(): Promise<void> {
    try {
      const data = (housingData as any)?.locations as HousingLocation[];
      if (data && data.length > 0) {
        // Popola il database Dexie all'avvio
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