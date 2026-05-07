import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HousingLocationComponent } from '../housing-location/housing-location.component';
import { HousingLocation } from '../housing-location';
import { DbService } from '../db.service'; 
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HousingLocationComponent, RouterModule, FormsModule],
  template: `
    <div class="home-layout">
      <!-- 🛠 SIDEBAR: RICERCA E FILTRI -->
      <aside class="sidebar">
        <div class="sidebar-section">
          <h3>Cerca Alloggio</h3>
          <div class="search-box">
            <input type="text" placeholder="Città, nome o stato..." #filter (keyup)="filterResults(filter.value)">
          </div>
        </div>

        <!-- FILTRO PREZZO (SLIDER) -->
        <div class="sidebar-section">
          <h3>Budget massimo: <span>{{maxPrice}}€</span></h3>
          <div class="price-slider-container">
            <input 
              type="range" 
              min="0" 
              max="2500" 
              step="50" 
              [(ngModel)]="maxPrice" 
              (input)="filterResults(filter.value)"
              class="slider">
          </div>
        </div>

        <!-- ✅ NUOVO: FILTRO METRATURA (SLIDER) -->
        <div class="sidebar-section">
          <h3>Superficie minima: <span>{{minMetratura}} m²</span></h3>
          <div class="price-slider-container">
            <input 
              type="range" 
              min="0" 
              max="200" 
              step="10" 
              [(ngModel)]="minMetratura" 
              (input)="filterResults(filter.value)"
              class="slider">
          </div>
        </div>

        <!-- ✅ NUOVO: FILTRO PIANO (BOTTONI) -->
        <div class="sidebar-section">
          <h3>Piano</h3>
          <div class="unit-filter-group">
            <button [class.active]="pianoSelezionato === 'Tutti'" (click)="setPianoFilter('Tutti', filter.value)">Tutti</button>
            <button [class.active]="pianoSelezionato === 'Terra'" (click)="setPianoFilter('Terra', filter.value)">T</button>
            <button [class.active]="pianoSelezionato === '1'" (click)="setPianoFilter('1', filter.value)">1°</button>
            <button [class.active]="pianoSelezionato === '2'" (click)="setPianoFilter('2', filter.value)">2°</button>
          </div>
        </div>

        <!-- FILTRO UNITÀ -->
        <div class="sidebar-section">
          <h3>Unità minime</h3>
          <div class="unit-filter-group">
            <button [class.active]="minUnits === 0" (click)="setUnitFilter(0, filter.value)">Tutte</button>
            <button [class.active]="minUnits === 1" (click)="setUnitFilter(1, filter.value)">1+</button>
            <button [class.active]="minUnits === 5" (click)="setUnitFilter(5, filter.value)">5+</button>
          </div>
        </div>

        <!-- FILTRO SERVIZI (CHECKBOX) -->
        <div class="sidebar-section">
          <h3>Servizi inclusi</h3>
          <div class="filter-box">
            <label class="filter-option">
              <input type="checkbox" [checked]="activeFilters.wifi" (change)="toggleFilter('wifi', filter.value)">
              <span class="custom-checkbox"></span>
              <span class="filter-label">📶 Wi-Fi incluso</span>
            </label>

            <label class="filter-option">
              <input type="checkbox" [checked]="activeFilters.laundry" (change)="toggleFilter('laundry', filter.value)">
              <span class="custom-checkbox"></span>
              <span class="filter-label">🧺 Lavanderia</span>
            </label>

            <button class="btn-reset" (click)="resetAllFilters(filter)">
              Svuota filtri
            </button>
          </div>
        </div>
      </aside>

      <!-- 🏠 CONTENUTO PRINCIPALE -->
      <main class="main-content">
        <header class="results-header">
          <h2>Alloggi trovati: {{filteredLocationList.length}}</h2>
        </header>

        <section class="results-grid">
          <app-housing-location 
            *ngFor="let housingLocation of filteredLocationList" 
            [housingLocation]="housingLocation"
            (click)="openGestione(housingLocation)"
            style="cursor: pointer;">
          </app-housing-location>
        </section>

        <div *ngIf="filteredLocationList.length === 0" class="no-results-msg">
          <p>Nessun alloggio trovato con questi filtri. Prova a cercarne altri!</p>
        </div>
      </main>
    </div>

    <!-- MODALE DI GESTIONE -->
    <div class="modal-overlay" *ngIf="isModalOpen" (click)="closeModal()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">Gestione Candidature: {{ selectedHouse?.name }}</h2>
          <button class="close-btn" (click)="closeModal()">&times;</button>
        </div>
        
        <div class="modal-body">
          <table class="modal-table" *ngIf="candidatiPerCasa.length > 0">
            <thead>
              <tr>
                <th>Candidato</th>
                <th>Data</th>
                <th>Stato</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of candidatiPerCasa">
                <td>{{ c.firstName }} {{ c.lastName }}</td>
                <td>{{ c.date }}</td>
                <td>
                  <span [style.color]="getStatusColor(c.status)" style="font-weight: bold;">
                    {{ c.status }}
                  </span>
                </td>
                <td class="actions-cell">
                  <button class="btn-action green" (click)="approvaCandidatura(c.id)" title="Approva">✔</button>
                  <button class="btn-action orange" (click)="rifiutaCandidatura(c.id)" title="Rifiuta">✖</button>
                  <button class="btn-action red" (click)="eliminaCandidatura(c.id)" title="Elimina">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div *ngIf="candidatiPerCasa.length === 0" style="text-align: center; padding: 20px; color: #64748b;">
            Nessuna candidatura per questo alloggio.
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-close-final" (click)="closeModal()">Chiudi</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  housingLocationList: HousingLocation[] = [];
  filteredLocationList: HousingLocation[] = [];
  
  // Stati dei filtri
  activeFilters = { wifi: false, laundry: false };
  minUnits: number = 0;
  maxPrice: number = 2500;
  minMetratura: number = 0;
  pianoSelezionato: string = 'Tutti';

  // Variabili modale
  isModalOpen = false;
  selectedHouse: HousingLocation | null = null;
  candidatiPerCasa: any[] = [];

  private dbService = inject(DbService);

  constructor() {
    this.dbService.locations$.subscribe((locations: HousingLocation[]) => {
      this.housingLocationList = locations;
      this.filterResults(''); 
    });
  }

  // ✅ LOGICA DI FILTRAGGIO AGGIORNATA
  filterResults(text: string) {
    const lowerText = text.toLowerCase();
    
    this.filteredLocationList = this.housingLocationList.filter(location => {
      // 1. Filtro Testuale
      const matchesSearch = !text || 
        location.city.toLowerCase().includes(lowerText) ||
        location.name.toLowerCase().includes(lowerText);

      // 2. Filtri Servizi
      const matchesWifi = this.activeFilters.wifi ? location.wifi : true;
      const matchesLaundry = this.activeFilters.laundry ? location.laundry : true;

      // 3. Filtro Unità
      const matchesUnits = location.availableUnits >= this.minUnits;

      // 4. Filtro Prezzo
      const housePrice = location.price !== undefined ? location.price : 0;
      const matchesPrice = housePrice <= this.maxPrice;

      // 5. Filtro Metratura
      const matchesMetratura = (location.metratura || 0) >= this.minMetratura;

      // 6. Filtro Piano
      const matchesPiano = this.pianoSelezionato === 'Tutti' || 
                           location.piano?.toString() === this.pianoSelezionato;

      return matchesSearch && matchesWifi && matchesLaundry && 
             matchesUnits && matchesPrice && matchesMetratura && matchesPiano;
    });
  }

  setUnitFilter(num: number, searchText: string) {
    this.minUnits = num;
    this.filterResults(searchText);
  }

  setPianoFilter(piano: string, searchText: string) {
    this.pianoSelezionato = piano;
    this.filterResults(searchText);
  }

  toggleFilter(type: string, searchText: string) {
    if (type === 'tutti') {
      this.activeFilters.wifi = false;
      this.activeFilters.laundry = false;
    } else {
      if (type === 'wifi') this.activeFilters.wifi = !this.activeFilters.wifi;
      if (type === 'laundry') this.activeFilters.laundry = !this.activeFilters.laundry;
    }
    this.filterResults(searchText);
  }

  resetAllFilters(filterInput: HTMLInputElement) {
    filterInput.value = '';
    this.minUnits = 0;
    this.maxPrice = 2500;
    this.minMetratura = 0;
    this.pianoSelezionato = 'Tutti';
    this.activeFilters.wifi = false;
    this.activeFilters.laundry = false;
    this.filterResults('');
  }

  // --- LOGICA MODALE ---
  async openGestione(house: HousingLocation) {
    this.selectedHouse = house;
    const tutte = await this.dbService.applications.toArray();
    this.candidatiPerCasa = tutte.filter(a => a.locationId === house.id);
    this.isModalOpen = true;
  }

  async approvaCandidatura(id: number) {
    await this.dbService.updateApplicationStatus(id, 'Approvata');
    await this.refreshModalData();
  }

  async rifiutaCandidatura(id: number) {
    await this.dbService.updateApplicationStatus(id, 'Rifiutata');
    await this.refreshModalData();
  }

  async eliminaCandidatura(id: number) {
    if (confirm('Sei sicuro?')) {
      await this.dbService.deleteApplication(id);
      await this.refreshModalData();
    }
  }

  private async refreshModalData() {
    if (this.selectedHouse) {
      const tutte = await this.dbService.applications.toArray();
      this.candidatiPerCasa = tutte.filter(a => a.locationId === this.selectedHouse!.id);
    }
  }

  closeModal() { this.isModalOpen = false; this.selectedHouse = null; }
  getStatusColor(status: string): string {
    if (status === 'Approvata') return '#2ecc71';
    if (status === 'Rifiutata') return '#e74c3c';
    return '#ff9800'; 
  }
}
