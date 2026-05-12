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
          <!-- VISIBILI SOLO SE ADMIN -->
          <a *ngIf="isAdmin()" [routerLink]="['/dashboard']" class="btn-dashboard-page">🚀 Dashboard</a>
          <a *ngIf="isAdmin()" [routerLink]="['/add']" class="btn-add-page">➕ Aggiungi Casa</a>
          
          <!-- VISIBILE SOLO SE LOGGATO -->
          <a *ngIf="isLogged()" [routerLink]="['/favorites']" class="btn-fav-page">⭐ Preferiti</a>
          
          <a [routerLink]="['/about']" class="btn-about-page">ℹ️ Chi Siamo</a>
          
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
  `,
  styleUrls: ['./app.component.css'],
  imports: [HomeComponent, RouterModule, CommonModule]
})
export class AppComponent implements OnInit {
  title = 'homes';
  userName: string = 'Utente';
  userRole: string = '';
  private router = inject(Router);

  constructor(private dbService: DbService) {}

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
    // 1. Inizializzazione Database
    try {
      const data = (housingData as any)?.locations as HousingLocation[];
      if (data && data.length > 0) {
        await this.dbService.seedDatabase(data);
      }
    } catch (error) {
      console.error('Errore Dexie:', error);
    }

    // 2. Recupero nome utente se loggato
    if (this.isLogged()) {
      const profile = await this.dbService.getUserProfile();
      if (profile) {
        this.userName = profile.nome;
        this.userRole = profile.role ?? 'user';
      }
    }
  }
}
