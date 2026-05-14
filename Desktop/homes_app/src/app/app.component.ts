import { Component, OnInit, inject } from '@angular/core'; 
import { RouterModule, Router } from '@angular/router'; 
import { CommonModule } from '@angular/common'; 
import { HomeComponent } from './home/home.component';
import { DbService } from './db.service';
import { HousingLocation } from './housing-location'; 
import housingData from '../../db.json';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-root',
  styleUrls: ['./app.component.css'],
  imports: [HomeComponent, CommonModule, RouterModule, TranslateModule],
  template: `
    <main>
      <header class="brand-name">
        <a [routerLink]="['/']" style="cursor: pointer; display: flex; align-items: center;">
          <img class="brand-logo" src="/assets/logo.svg" alt="logo" aria-hidden="true">
        </a>

        <div class="nav-links">
          <!-- VISIBILI SOLO SE ADMIN -->
          <a *ngIf="isAdmin()" [routerLink]="['/dashboard']" class="btn-dashboard-page">🚀 {{ 'NAV.DASHBOARD' | translate }}</a>
          <a *ngIf="isAdmin()" [routerLink]="['/add']" class="btn-add-page">➕ {{ 'NAV.ADD' | translate }}</a>
          
          <!-- VISIBILE SOLO SE LOGGATO -->
          <a *ngIf="isLogged()" [routerLink]="['/favorites']" class="btn-fav-page">⭐ {{ 'NAV.FAVORITES' | translate }}</a>
          
          <a [routerLink]="['/about']" class="btn-about-page">ℹ️ {{ 'NAV.ABOUT' | translate }}</a>
          
          <!-- SELETTORE DELLA LINGUA (Menu a tendina) -->
          <select #langSelect (change)="changelang(langSelect.value)" [value]="translate.currentLang" class="lang-selector">
            <option value="it">🇮🇹 IT</option>
            <option value="en">🇬🇧 EN</option>
          </select>

          <!-- Se loggato mostra Nome, Profilo e Logout -->
          <div *ngIf="isLogged(); else authButtons" class="user-actions">
            <span class="user-welcome">Ciao, <b>{{ userName }}</b> ({{ userRole }})</span>
            <a [routerLink]="['/user-profile']" class="btn-user-profile">👤 Profilo</a>
            <button (click)="handleLogout()" class="btn-logout">🚪 Esci</button>
          </div>

          <ng-template #authButtons>
            <div class="auth-group">
              <a [routerLink]="['/login']" class="btn-accedi">Accedi</a>
              <a [routerLink]="['/register']" class="btn-iscriviti">Iscriviti</a>
            </div>
          </ng-template>
        </div>
      </header>

      <section class="content">
        <router-outlet></router-outlet>
      </section>
    </main>
  `
})
export class AppComponent implements OnInit {
  title = 'homes';
  userName: string = 'Utente';
  userRole: string = '';
  private router = inject(Router);

  constructor(private dbService: DbService, public translate: TranslateService) {
    this.translate.setFallbackLang('it');
    const savedLang = localStorage.getItem('userLanguage') || 'it';
    this.translate.use(savedLang);
  }

  changelang(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('userLanguage', lang);
  }

  isLogged(): boolean {
    return localStorage.getItem('statoLogin') !== null;
  }

  isAdmin(): boolean {
    return localStorage.getItem('userRole') === 'admin';
  }

  handleLogout() {
    localStorage.clear(); 
    this.router.navigate(['/']).then(() => {
      window.location.reload();
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      const data = (housingData as any)?.locations as HousingLocation[];
      if (data && data.length > 0) {
        await this.dbService.seedDatabase(data);
      }
    } catch (error) {
      console.error('Errore Dexie:', error);
    }

    if (this.isLogged()) {
      const profile = await this.dbService.getUserProfile();
      if (profile) {
        this.userName = profile.nome;
        this.userRole = profile.role ?? 'user';
      }
    }
  }
}
