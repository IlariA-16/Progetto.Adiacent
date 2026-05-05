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
          <a [routerLink]="['/favorites']" class="btn-fav-page">
            <span>⭐</span> <span>I miei Preferiti</span>
          </a>
          <a [routerLink]="['/add']" class="btn-add-page">
            <span>➕</span> <span>Aggiungi Casa</span>
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
      console.log('Tentativo di connessione al server dati...');

      // Carichiamo i dati dal json-server (porta 3000)
      // Dato che db.json è nella root, usiamo l'endpoint del server
      const response = await fetch('http://localhost:3000/locations');
      
      if (!response.ok) {
        throw new Error(`Server non raggiungibile. Status: ${response.status}`);
      }

      const data: HousingLocation[] = await response.json();

      if (data && data.length > 0) {
        // Popoliamo il database Dexie solo se è vuoto (logica gestita nel Service)
        await this.dbService.seedDatabase(data);
        console.log('✅ Dexie inizializzato con successo con i dati dal server!');
      } else {
        console.warn('⚠️ Il server ha risposto, ma l\'elenco delle case è vuoto.');
      }

    } catch (error) {
      console.error('❌ Errore durante l\'inizializzazione di Dexie:', error);
      console.log('Suggerimento: Assicurati di aver avviato il server con: npx json-server --watch db.json');
    }
  }
}
