import { Component, OnInit, inject } from '@angular/core'; // Aggiunto inject
import { RouterModule, Router } from '@angular/router'; // Aggiunto Router
import { CommonModule } from '@angular/common'; // Aggiunto CommonModule per ngIf
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
          
          <!-- NUOVO TASTO DINAMICO -->
          <a *ngIf="isLogged(); else loginBtn" [routerLink]="['/user-profile']" class="btn-user-profile">
            👤 Il mio Profilo
          </a>
          <ng-template #loginBtn>
            <a (click)="login()" class="btn-login">🔑 Accedi</a>
          </ng-template>
        </div>
      </header>

      <section class="content">
        <router-outlet></router-outlet>
      </section>
    </main>
  `,
  styleUrls: ['./app.component.css'],
  // Aggiunto CommonModule qui per far funzionare *ngIf
  imports: [HomeComponent, RouterModule, CommonModule]
})
export class AppComponent implements OnInit {
  title = 'homes';
  private router = inject(Router); // Iniettiamo il router per il login

  constructor(private dbService: DbService) {}

  // Controlla se l'utente è loggato
  isLogged(): boolean {
    return localStorage.getItem('statoLogin') !== null;
  }

  // Funzione per il tasto "Accedi"
  login() {
    localStorage.setItem('statoLogin', 'true');
    this.router.navigate(['/user-profile']);
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
