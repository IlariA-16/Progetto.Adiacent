import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';
import { HousingService } from '../housing.service'; 
import { DbService } from '../db.service'; // Importiamo il nuovo DbService

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  private housingService = inject(HousingService);
  private dbService = inject(DbService); // Iniettiamo il database
  
  userName: string = 'Ospite';
  applicationsCount: number = 0; 
  appliedHouses: any[] = [];    

  // Getter per i preferiti dal HousingService (se lo usi ancora per i preferiti)
  get favoritesCount(): number {
    return this.housingService.getFavoritesCount();
  }

  // Logica del saluto basata sul nome
  get saluto(): string {
    return this.userName.toLowerCase().endsWith('o') ? 'Bentornato' : 'Bentornata';
  }

  ngOnInit() {
    // 1. Recupera il nome dell'utente dal localStorage
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      this.userName = savedName;
    }

    // 2. RENDIAMO DINAMICA LA TABELLA E IL CONTATORE
    // Ci sottoscriviamo alle candidature salvate su Dexie
    this.dbService.applications$.subscribe(async (apps) => {
      this.applicationsCount = apps.length; // Aggiorna il numero "Domande Inviate"
      
      // Recuperiamo i dati delle case per mostrare nomi e località reali
      const locations = await this.dbService.locations.toArray();
      
      // Arricchiamo le candidature con i dati della casa (Nome e Città)
      this.appliedHouses = apps.map(app => {
        const house = locations.find(h => h.id === app.locationId);
        return {
          ...app,
          locationName: house ? house.name : 'Alloggio rimosso',
          city: house ? house.city : 'N/A'
        };
      });
    });
  }

  // Helper per il colore dello stato (opzionale se vuoi usarlo nel template)
  getStatusColor(status: string): string {
    if (status === 'Approvata') return '#2ecc71';
    if (status === 'Rifiutata') return '#e74c3c';
    return '#ff9800'; // In Revisione
  }
}
