import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HousingLocationComponent } from '../housing-location/housing-location.component';
import { RouterModule } from '@angular/router';
import { DbService } from '../db.service';
import { HousingLocation } from '../housing-location'; 
import { Observable, map } from 'rxjs';
import data from '../../../db.json';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HousingLocationComponent, RouterModule],
  template: `
    <section>
      <form (submit)="$event.preventDefault()">
        <input type="text" placeholder="Filtra per città" #filter id="city-filter" name="city-filter">
        <button class="primary" type="button" (click)="filterResults(filter.value)">Cerca</button>
      </form>
    </section>

    <section class="results">
      <!-- AGGIUNTO IL PIPE ASYNC QUI SOTTO -->
      <div *ngFor="let housingLocation of (filteredLocationList$ | async)" 
           (click)="openApplicationsModal(housingLocation)"
           style="cursor: pointer">
        <app-housing-location [housingLocation]="housingLocation"></app-housing-location>
      </div>
    </section>

    <!-- Overlay della Modale -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h3>Gestione Candidature: {{ selectedLocation?.name }}</h3>
        <hr>
        
        <div *ngIf="currentApplications.length > 0; else noApps">
          <table class="app-table">
            <thead>
              <tr>
                <th>Candidato</th>
                <th>Data</th>
                <th>Stato</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let app of currentApplications">
                <td>{{ app.applicantName }}</td>
                <td>{{ app.date }}</td>
                <td [style.color]="getStatusColor(app.status)" style="font-weight: bold;">
                  {{ app.status }}
                </td>
                <td class="action-cell">
                  <button *ngIf="app.status !== 'Approvata'" 
                          (click)="updateStatus(app.id, 'Approvata')" 
                          class="btn-icon approve" title="Approva">✔</button>
                  
                  <button *ngIf="app.status !== 'Rifiutata'" 
                          (click)="updateStatus(app.id, 'Rifiutata')" 
                          class="btn-icon reject" title="Rifiuta">✖</button>
                  
                  <button (click)="deleteApplication(app.id)" 
                          class="btn-icon delete" title="Elimina">🗑</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template #noApps>
          <div class="empty-state">
            <p>Nessuna candidatura ricevuta per questa proprietà.</p>
          </div>
        </ng-template>

        <button class="primary close-btn" (click)="closeModal()">Chiudi</button>
      </div>
    </div>
  `,
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  // Trasformiamo le liste in Observable per Dexie
  housingLocationList$: Observable<HousingLocation[]>;
  filteredLocationList$: Observable<HousingLocation[]>;
  
  showModal = false;
  selectedLocation: HousingLocation | null = null;
  currentApplications: any[] = [];

  private dbService = inject(DbService);

  constructor() {
    // Inizializziamo i flussi di dati direttamente dal DbService
    this.housingLocationList$ = this.dbService.locations$;
    this.filteredLocationList$ = this.housingLocationList$;
  }

  async ngOnInit() {
    // Popolamento iniziale se il DB è vuoto
    if (data && data.locations) {
      await this.dbService.seedDatabase(data.locations);
    }
  }

  // --- FILTRO REATTIVO ---
  filterResults(text: string) {
    if (!text) {
      this.filteredLocationList$ = this.housingLocationList$;
      return;
    }
    // Usiamo il map di RxJS per filtrare i dati che arrivano da Dexie
    this.filteredLocationList$ = this.housingLocationList$.pipe(
      map(locations => locations.filter(
        loc => loc.city.toLowerCase().includes(text.toLowerCase())
      ))
    );
  }

  // --- LOGICA MODALE ---
  async openApplicationsModal(location: HousingLocation) {
    if (!location.id) return;
    this.selectedLocation = location;
    try {
      // Recupera le applicazioni filtrate per l'ID della casa
      this.currentApplications = await this.dbService.table('applications')
        .where('locationId').equals(location.id).toArray();
      this.showModal = true;
    } catch (error) { console.error(error); }
  }

  async updateStatus(id: number, newStatus: string) {
    await this.dbService.table('applications').update(id, { status: newStatus });
    // Aggiorna la vista locale della tabella nella modale
    const app = this.currentApplications.find(a => a.id === id);
    if (app) app.status = newStatus;
  }

  async deleteApplication(id: number) {
    if (confirm('Sei sicuro di voler eliminare questa candidatura?')) {
      await this.dbService.table('applications').delete(id);
      this.currentApplications = this.currentApplications.filter(a => a.id !== id);
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Approvata': return '#2ecc71';
      case 'Rifiutata': return '#e74c3c';
      default: return '#ff9800';
    }
  }

  closeModal() {
    this.showModal = false;
    this.selectedLocation = null;
  }
}
