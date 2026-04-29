import { Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HousingLocation } from '../housing-location';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-housing-location',
  standalone: true,
  imports: [CommonModule,RouterModule],
  template: `
    <section class="listing">
      <img class="listing-photo" [src]="housingLocation.photo" alt="Exterior photo of {{housingLocation.name}}">
      <h2 class="listing-heading">{{housingLocation.name}}</h2>

      <p class="listing-location" (click)="mapModal.showModal()" style="cursor: pointer;">
      {{housingLocation.city}}, {{housingLocation.state}}
    </p>

      <a [routerLink]="['/details-mico', housingLocation.id]">Dettaglio Mico</a>
      <a [routerLink]="['/details', housingLocation.id]">Dettaglio Ilaria</a>
      <dialog #mapModal class="modal-container">
      <div class="modal-header">
        <h3>Posizione di {{housingLocation.name}}</h3>
        <button (click)="mapModal.close()">×</button>
      </div>
      <div class="modal-body">
        <p>Vuoi visualizzare la mappa per {{housingLocation.city}}?</p>
        <!-- Link a Google Maps all'interno della modale -->
        <a [href]="'https://www.google.com/maps/search/?api=1&query=' + housingLocation.name + ' ' + housingLocation.city" 
           target="_blank" class="btn-maps">
           Apri in Google Maps
        </a>
      </div>
    </dialog>

    </section>
  `,
  styleUrls: ['./housing-location.component.css']
})
export class HousingLocationComponent {
  @Input() housingLocation!:HousingLocation;

}
