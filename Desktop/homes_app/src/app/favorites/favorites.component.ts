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
      <div class="results">
        <!-- Ciclo che mostra solo le case preferite -->
        <app-housing-location 
          *ngFor="let housingLocation of favoriteList" 
          [housingLocation]="housingLocation">
        </app-housing-location>
        
        <!-- Messaggio se non ci sono preferiti -->
        <p *ngIf="favoriteList.length === 0">
          Non hai ancora aggiunto nessuna casa ai tuoi preferiti.
        </p>
      </div>
    </section>
  `,
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  favoriteList: HousingLocation[] = [];
  housingService: HousingService = inject(HousingService);

  constructor() {}

  async ngOnInit() {
    // 1. Recupera tutte le case dal database/server
    const allLocations = await this.housingService.getAllHousingLocation();
    
    // 2. Filtra la lista usando DIRETTAMENTE il metodo isFavorite del Service
    // In questo modo usiamo la stessa chiave 'favorites' che usa la Dashboard!
    this.favoriteList = allLocations.filter(location => 
      this.housingService.isFavorite(location.id)
    );
  }
}
