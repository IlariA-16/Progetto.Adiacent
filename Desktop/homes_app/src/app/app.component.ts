import { Component, OnInit, inject } from '@angular/core'; 
import { RouterModule, Router } from '@angular/router'; 
import { CommonModule } from '@angular/common'; 
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
          
          <!-- Se loggato mostra Profilo, altrimenti i due tasti di autenticazione -->
          <a *ngIf="isLogged(); else authButtons" [routerLink]="['/user-profile']" class="btn-user-profile">
            👤 Il mio Profilo
          </a>

          <ng-template #authButtons>
            <div class="auth-group">
              <a [routerLink]="['/login']" class="btn-accedi">Accedi</a>
              <a [routerLink]="['/register']" class="btn-iscriviti">Iscriviti ora</a>
            </div>
          </ng-template>
        </div>
      </header>

      <section class="content">
        <router-outlet></router-outlet>
      </section>
    </main>
  `,
  styleUrls: ['./app.component.css'],
  imports: [HomeComponent, RouterModule, CommonModule]
})
export class AppComponent implements OnInit {
  title = 'homes';
  private router = inject(Router);

  constructor(private dbService: DbService) {}

  // Controlla se l'utente è loggato tramite localStorage
  isLogged(): boolean {
    return localStorage.getItem('statoLogin') !== null;
  }

  async ngOnInit(): Promise<void> {
    try {
      const data = (housingData as any)?.locations as HousingLocation[];
      if (data && data.length > 0) {
        await this.dbService.seedDatabase(data);
        console.log('Dexie inizializzato correttamente');
      }
    } catch (error) {
      console.error('Errore durante inizializzazione Dexie:', error);
    }
  }
}
