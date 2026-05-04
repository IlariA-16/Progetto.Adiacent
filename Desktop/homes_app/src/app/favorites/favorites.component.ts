import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HousingLocationComponent } from '../housing-location/housing-location.component';
import { HousingLocation } from '../housing-location';
import { HousingService } from '../housing.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, HousingLocationComponent, RouterModule],
  template: `
    <section class="content">
      <h2 class="section-heading">I miei Preferiti ⭐</h2>

      <section class="search-section">
        <form (submit)="filterResults(filter.value); $event.preventDefault()">
          <input type="text" placeholder="Cerca tra i preferiti..." #filter>
          <button class="primary" type="submit">Cerca</button>
        </form>
      </section>

      <div class="results">
        <app-housing-location
          *ngFor="let housingLocation of filteredFavoriteList"
          [housingLocation]="housingLocation"
          (favChanged)="updateFavoriteList()">
        </app-housing-location>
        
        <p *ngIf="filteredFavoriteList.length === 0" class="empty-message">
          Nessun risultato trovato nei tuoi preferiti.
        </p>
      </div>
    </section>
  `,
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  allLocations: HousingLocation[] = [];
  favoriteList: HousingLocation[] = [];
  filteredFavoriteList: HousingLocation[] = [];
  
  housingService: HousingService = inject(HousingService);

  async ngOnInit() {
    this.allLocations = await this.housingService.getAllHousingLocation();
    this.updateFavoriteList();
  }

  updateFavoriteList() {
    this.favoriteList = this.allLocations.filter(location =>
      this.housingService.isFavorite(location.id)
    );
    this.filteredFavoriteList = [...this.favoriteList];
  }

  filterResults(text: string) {
    if (!text) {
      this.filteredFavoriteList = this.favoriteList;
      return;
    }
    const searchTerm = text.toLowerCase();
    this.filteredFavoriteList = this.favoriteList.filter(location =>
      location?.city.toLowerCase().includes(searchTerm) ||
      location?.name.toLowerCase().includes(searchTerm) ||
      location?.state.toLowerCase().includes(searchTerm)
    );
  }
}