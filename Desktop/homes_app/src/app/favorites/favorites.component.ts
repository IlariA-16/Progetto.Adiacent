import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HousingLocationComponent } from '../housing-location/housing-location.component';
import { HousingLocation } from '../housing-location';
import { HousingService } from '../housing.service';
import { RouterModule } from '@angular/router';
import { Observable, map } from 'rxjs';

// IMPORTA IL MODULO DI TRADUZIONE
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-favorites',
  standalone: true,
  // AGGIUNGI TranslateModule NEGLI IMPORTS
  imports: [CommonModule, HousingLocationComponent, RouterModule, TranslateModule],
  template: `
    <section class="content">
      <h2 class="section-heading">{{ 'FAVORITES.TITLE' | translate }}</h2>
      
      <div class="results">
        <app-housing-location 
          *ngFor="let housingLocation of (favoriteList$ | async)" 
          [housingLocation]="housingLocation">
        </app-housing-location>
        
        <p *ngIf="(favoriteList$ | async)?.length === 0">
          {{ 'FAVORITES.EMPTY_MESSAGE' | translate }}
        </p>
      </div>
    </section>
  `,
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  favoriteList$: Observable<HousingLocation[]> | undefined;
  housingService: HousingService = inject(HousingService);

  ngOnInit() {
    this.favoriteList$ = this.housingService.getAllHousingLocation().pipe(
      map(locations => locations.filter(location => location.isFavorite === true))
    );
  }
}