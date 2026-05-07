import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HousingLocationComponent } from '../housing-location/housing-location.component';
import { HousingLocation } from '../housing-location';
import { DbService } from '../db.service';
import { HousingService } from '../housing.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, HousingLocationComponent, FormsModule],
  template: `
    <div class="home-layout">
      <!-- 🛠 SIDEBAR IDENTICA ALLA HOME -->
      <aside class="sidebar">
        <div class="sidebar-section">
          <h3>Cerca tra i preferiti</h3>
          <div class="search-box">
            <input type="text" placeholder="Città, nome o stato..." #filter (keyup)="filterResults(filter.value)">
          </div>
        </div>

        <div class="sidebar-section">
          <h3>Budget massimo: <span>{{maxPrice}}€</span></h3>
          <div class="price-slider-container">
            <input type="range" min="0" max="2500" step="50" [(ngModel)]="maxPrice" (input)="filterResults(filter.value)" class="slider">
          </div>
        </div>

        <div class="sidebar-section">
          <h3>Superficie minima: <span>{{minMetratura}} m²</span></h3>
          <div class="price-slider-container">
            <input type="range" min="0" max="200" step="10" [(ngModel)]="minMetratura" (input)="filterResults(filter.value)" class="slider">
          </div>
        </div>

        <div class="sidebar-section">
          <h3>Piano</h3>
          <div class="unit-filter-group">
            <button [class.active]="pianoSelezionato === 'Tutti'" (click)="setPianoFilter('Tutti', filter.value)">Tutti</button>
            <button [class.active]="pianoSelezionato === 'Terra'" (click)="setPianoFilter('Terra', filter.value)">T</button>
            <button [class.active]="pianoSelezionato === '1'" (click)="setPianoFilter('1', filter.value)">1°</button>
            <button [class.active]="pianoSelezionato === '2'" (click)="setPianoFilter('2', filter.value)">2°</button>
          </div>
        </div>

        <div class="sidebar-section">
          <h3>Unità minime</h3>
          <div class="unit-filter-group">
            <button [class.active]="minUnits === 0" (click)="setUnitFilter(0, filter.value)">Tutte</button>
            <button [class.active]="minUnits === 1" (click)="setUnitFilter(1, filter.value)">1+</button>
            <button [class.active]="minUnits === 5" (click)="setUnitFilter(5, filter.value)">5+</button>
          </div>
        </div>
      </aside>

      <!-- 🏠 CONTENUTO RISULTATI -->
      <main class="main-content">
        <header class="results-header">
          <h2>Preferiti trovati: {{filteredFavoriteList.length}}</h2>
        </header>

        <section class="results-grid">
          <p *ngIf="filteredFavoriteList.length === 0" class="no-results-msg">Nessun preferito corrisponde ai filtri.</p>
          
          <app-housing-location 
            *ngFor="let location of filteredFavoriteList" 
            [housingLocation]="location"
            (favChanged)="updateFavorites()">
          </app-housing-location>
        </section>
      </main>
    </div>
  `,
  styleUrls: ['./favorites.component.css'] // Assicurati di copiare il CSS della Home qui
})
export class FavoritesComponent {
  allFavoriteList: HousingLocation[] = []; 
  filteredFavoriteList: HousingLocation[] = []; 
  
  // Stati filtri (identici alla Home)
  maxPrice: number = 2500;
  minMetratura: number = 0;
  pianoSelezionato: string = 'Tutti';
  minUnits: number = 0;

  private dbService = inject(DbService);
  private housingService = inject(HousingService);

  constructor() {
    this.updateFavorites();
  }

  updateFavorites() {
    this.dbService.locations$.subscribe((allLocations) => {
      const favIds = this.housingService.getFavorites();
      this.allFavoriteList = allLocations.filter(loc => favIds.includes(loc.id));
      this.filterResults(''); 
    });
  }

  filterResults(text: string) {
    const lowerText = text.toLowerCase();
    this.filteredFavoriteList = this.allFavoriteList.filter(location => {
      const matchesSearch = !text || 
        location.city.toLowerCase().includes(lowerText) ||
        location.name.toLowerCase().includes(lowerText);
      const matchesPrice = (location.price || 0) <= this.maxPrice;
      const matchesMetratura = (location.metratura || 0) >= this.minMetratura;
      const matchesPiano = this.pianoSelezionato === 'Tutti' || location.piano?.toString() === this.pianoSelezionato;
      const matchesUnits = location.availableUnits >= this.minUnits;

      return matchesSearch && matchesPrice && matchesMetratura && matchesPiano && matchesUnits;
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
}
