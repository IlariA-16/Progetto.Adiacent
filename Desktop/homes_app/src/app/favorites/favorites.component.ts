import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HousingLocationComponent } from '../housing-location/housing-location.component';
import { HousingLocation } from '../housing-location';
import { DbService } from '../db.service';
import { HousingService } from '../housing.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, HousingLocationComponent],
  template: `
    <section>
      <!-- Barra di ricerca aggiunta ai preferiti -->
      <form (submit)="filterResults(filter.value); $event.preventDefault()">
        <input type="text" placeholder="Cerca tra i tuoi preferiti..." #filter (keyup)="filterResults(filter.value)">
        <button class="primary" type="submit">Cerca</button>
      </form>
    </section>

    <h2 class="section-heading">I miei Preferiti</h2>
    
    <section class="results">
      <p *ngIf="filteredFavoriteList.length === 0">Nessun preferito trovato.</p>
      
      <app-housing-location 
        *ngFor="let location of filteredFavoriteList" 
        [housingLocation]="location"
        (favChanged)="updateFavorites()">
      </app-housing-location>
    </section>
  `,
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent {
  allFavoriteList: HousingLocation[] = []; // Lista completa dei preferiti
  filteredFavoriteList: HousingLocation[] = []; // Lista filtrata per la visualizzazione
  
  private dbService = inject(DbService);
  private housingService = inject(HousingService);

  constructor() {
    this.updateFavorites();
  }

  updateFavorites() {
    this.dbService.locations$.subscribe((allLocations) => {
      const favIds = this.housingService.getFavorites();
      // Prendiamo solo i preferiti dal DB
      this.allFavoriteList = allLocations.filter(loc => favIds.includes(loc.id));
      this.filteredFavoriteList = this.allFavoriteList;
    });
  }

  // Logica di ricerca identica alla Home
  filterResults(text: string) {
    if (!text) {
      this.filteredFavoriteList = this.allFavoriteList;
      return;
    }

    const lowerText = text.toLowerCase();
    this.filteredFavoriteList = this.allFavoriteList.filter(
      location => 
        location?.city.toLowerCase().includes(lowerText) ||
        location?.name.toLowerCase().includes(lowerText) ||
        location?.state.toLowerCase().includes(lowerText)
    );
  }
}
