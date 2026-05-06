import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HousingLocationComponent } from '../housing-location/housing-location.component';
import { HousingLocation } from '../housing-location';
import { HousingService } from '../housing.service';
import { RouterModule } from '@angular/router';
import { Observable, map } from 'rxjs'; // Importiamo gli strumenti per gestire i dati reattivi

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, HousingLocationComponent, RouterModule],
  template: `
    <section class="content">
      <h2 class="section-heading">I miei Preferiti ⭐</h2>
      <div class="results">
        <!-- Usiamo il pipe async per leggere i dati reattivi da Dexie -->
        <app-housing-location 
          *ngFor="let housingLocation of (favoriteList$ | async)" 
          [housingLocation]="housingLocation">
        </app-housing-location>
        
        <!-- Messaggio se non ci sono preferiti -->
        <p *ngIf="(favoriteList$ | async)?.length === 0">
          Non hai ancora aggiunto nessuna casa ai tuoi preferiti.
        </p>
      </div>
    </section>
  `,
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  // Definiamo un Observable invece di un semplice array
  favoriteList$: Observable<HousingLocation[]> | undefined;
  housingService: HousingService = inject(HousingService);

  ngOnInit() {
    // 1. Chiediamo al servizio tutte le case (che arrivano da Dexie come Observable)
    // 2. Usiamo 'map' per filtrare solo quelle che hanno isFavorite: true
    this.favoriteList$ = this.housingService.getAllHousingLocation().pipe(
      map(locations => locations.filter(location => location.isFavorite === true))
    );
  }
}
