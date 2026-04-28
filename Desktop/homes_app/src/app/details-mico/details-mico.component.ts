import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HousingService } from '../housing.service'; 
import { HousingLocation } from '../housing-location'; 




@Component({
  selector: 'app-details-mico',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="details-mico">
      <img class="details-mico-photo" [src]="housingLocation?.photo" 
      alt="Exterior photo of {{housingLocation?.name}}">
      <h2 class="details-mico-heading">{{housingLocation?.name}}</h2>
      <p class="details-mico-location">{{housingLocation?.city}}, {{housingLocation?.state}}</p>
    </section>
  `,
  styleUrls: ['./details-mico.component.css']

})
export class DetailsMicoComponent {
   route:ActivatedRoute = inject (ActivatedRoute);

    housingService = inject (HousingService);
    housingLocation:HousingLocation | undefined;

    constructor() {
      const housingLocationId = Number(this.route.snapshot.params['id']);
     this.housingService.getHousingLocationById(housingLocationId).then(housingLocation => {
      this.housingLocation = housingLocation;
     });
    }

}