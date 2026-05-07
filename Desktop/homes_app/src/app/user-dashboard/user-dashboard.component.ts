import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { HousingService } from '../housing.service';
import { DbService } from '../db.service'; 

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, FormsModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  private housingService = inject(HousingService);
  private dbService = inject(DbService); 

  userName: string = 'Ospite';
  applicationsCount: number = 0;
  appliedHouses: any[] = [];    

  // Variabili per la gestione Modale
  isModalOpen = false;
  selectedApp: any = null;
  nuovoStato: string = '';
  candidatiPerCasa: any[] = []; // Per la visualizzazione stile tabella nella modale

  get favoritesCount(): number {
    return this.housingService.getFavoritesCount();
  }

  get saluto(): string {
    return this.userName.toLowerCase().endsWith('o') ? 'Bentornato' : 'Bentornata';
  }

  ngOnInit() {
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      this.userName = savedName;
    }

    this.dbService.applications$.subscribe(async (apps) => {
      this.applicationsCount = apps.length; 
      const locations = await this.dbService.locations.toArray();
     
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

  // --- AZIONI TABELLA E MODALE ---

  async rifiutaCandidatura(id: number) {
    // Pulsante Arancione: imposta lo stato a Rifiutata
    await this.dbService.updateApplicationStatus(id, 'Rifiutata');
    if (this.isModalOpen) await this.refreshModalData();
  }

  async eliminaCandidatura(id: number) {
    // Pulsante Rosso: elimina definitivamente
    if (confirm('Sei sicuro di voler eliminare definitivamente questa candidatura?')) {
      await this.dbService.deleteApplication(id);
      if (this.isModalOpen) await this.refreshModalData();
    }
  }

  // Metodi per la Modale
  async openGestione(app: any) {
    this.selectedApp = app;
    this.nuovoStato = app.status; 
    
    // Recupera tutti i candidati per questa specifica casa
    const tutte = await this.dbService.applications.toArray();
    this.candidatiPerCasa = tutte.filter(a => a.locationId === app.locationId);
    
    this.isModalOpen = true;
  }

  private async refreshModalData() {
    if (this.selectedApp) {
      const tutte = await this.dbService.applications.toArray();
      this.candidatiPerCasa = tutte.filter(a => a.locationId === this.selectedApp.locationId);
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedApp = null;
  }

  async salvaCandidatura() {
    if (this.selectedApp) {
      await this.dbService.updateApplicationStatus(this.selectedApp.id, this.nuovoStato);
      this.closeModal();
    }
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'Approvata': return '#2ecc71';
      case 'Rifiutata': return '#e74c3c';
      default: return '#ff9800'; 
    }
  }
}
