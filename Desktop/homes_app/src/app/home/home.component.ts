import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HousingLocationComponent } from '../housing-location/housing-location.component';
import { RouterModule } from '@angular/router';
import { DbService } from '../db.service';
import { HousingLocation } from '../housing-location'; 
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
      <div *ngFor="let housingLocation of filteredLocationList" 
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
                  <!-- Pulsante Approva -->
                  <button *ngIf="app.status !== 'Approvata'" 
                          (click)="updateStatus(app.id, 'Approvata')" 
                          class="btn-icon approve" title="Approva">✔</button>
                  
                  <!-- Pulsante Rifiuta -->
                  <button *ngIf="app.status !== 'Rifiutata'" 
                          (click)="updateStatus(app.id, 'Rifiutata')" 
                          class="btn-icon reject" title="Rifiuta">✖</button>
                  
                  <!-- Pulsante Elimina -->
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
  housingLocationList: HousingLocation[] = [];
  filteredLocationList: HousingLocation[] = [];
  showModal = false;
  selectedLocation: HousingLocation | null = null;
  currentApplications: any[] = [];

  private dbService = inject(DbService);

  async ngOnInit() {
    if (data && data.locations) {
      await this.dbService.seedDatabase(data.locations);
    }
    this.dbService.locations$.subscribe((results: HousingLocation[]) => {
      this.housingLocationList = results;
      this.filteredLocationList = results;
    });
  }

  async openApplicationsModal(location: HousingLocation) {
    if (!location.id) return;
    this.selectedLocation = location;
    try {
      this.currentApplications = await this.dbService.table('applications')
        .where('locationId').equals(location.id).toArray();
      this.showModal = true;
    } catch (error) { console.error(error); }
  }

  // AGGIORNA STATO (Approva/Rifiuta)
  async updateStatus(id: number, newStatus: string) {
    await this.dbService.table('applications').update(id, { status: newStatus });
    const app = this.currentApplications.find(a => a.id === id);
    if (app) app.status = newStatus;
  }

  // ELIMINA DEFINITIVAMENTE
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

  filterResults(text: string) {
    if (!text) {
      this.filteredLocationList = this.housingLocationList;
      return;
    }
    this.filteredLocationList = this.housingLocationList.filter(
      housingLocation => housingLocation?.city.toLowerCase().includes(text.toLowerCase())
    );
  }
}
