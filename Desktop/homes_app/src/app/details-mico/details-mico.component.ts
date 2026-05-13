import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HousingService } from '../housing.service'; 
import { HousingLocation } from '../housing-location'; 
// 1. Importa il modulo per le traduzioni
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-details-mico',
  standalone: true,
  // 2. Aggiungi TranslateModule agli imports
  imports: [CommonModule, TranslateModule],
  template: `
    <section class="details-mico">
      <!-- 3. Traduzione dell'attributo alt della foto -->
      <img class="details-mico-photo" 
           [src]="housingLocation?.photo" 
           [alt]="('DETAILS.PHOTO_ALT' | translate) + ' ' + housingLocation?.name">
      
      <h2 class="details-mico-heading">{{housingLocation?.name}}</h2>
      
      <p class="details-mico-location">
        <!-- Se vuoi tradurre le etichette prima dei dati -->
        <strong>{{ 'DETAILS.CITY' | translate }}:</strong> {{housingLocation?.city}}, 
        <strong>{{ 'DETAILS.STATE' | translate }}:</strong> {{housingLocation?.state}}
      </p>
    </section>
  `,
  styleUrls: ['./details-mico.component.css']
})
export class DetailsMicoComponent {
  route: ActivatedRoute = inject(ActivatedRoute);
  housingService = inject(HousingService);
  housingLocation: HousingLocation | undefined;

  constructor() {
    const housingLocationId = Number(this.route.snapshot.params['id']);
    this.housingService.getHousingLocationById(housingLocationId).then(housingLocation => {
      this.housingLocation = housingLocation;
    });
  }
}
