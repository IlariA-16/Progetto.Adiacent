import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HousingLocation } from '../housing-location';
import { RouterModule } from '@angular/router';
import { HousingService } from '../housing.service'; // Importante: importiamo il service

@Component({
  selector: 'app-housing-location',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="listing">
      <img class="listing-photo" [src]="housingLocation.photo" alt="Exterior photo of {{housingLocation.name}}">
      <h2 class="listing-heading">{{housingLocation.name}}</h2>

      <p class="listing-location" (click)="mapModal.showModal()" style="cursor: pointer;">
        {{housingLocation.city}}, {{housingLocation.state}}
      </p>

      <a [routerLink]="['/details', housingLocation.id]">Dettaglio Ilaria</a>
      <a [routerLink]="['/details-mico', housingLocation.id]">Dettaglio Mico</a>
    
      <!-- La stella ora chiede direttamente al Service se la casa è tra i preferiti -->
      <button class="star-btn" (click)="toggleFavorite($event)">
        {{ housingService.isFavorite(housingLocation.id) ? '★' : '☆' }}
      </button>

      <dialog #mapModal class="modal-container">
        <div class="modal-header">
          <h3>Posizione di {{housingLocation.name}}</h3>
          <button (click)="mapModal.close()">×</button>
        </div>
        <div class="modal-body">
          <p>Vuoi visualizzare la mappa per {{housingLocation.city}}?</p>
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
  @Input() housingLocation!: HousingLocation;

  // Iniezione del Service
  housingService = inject(HousingService);

  toggleFavorite(event: Event) {
    event.stopPropagation(); // Evita che il click si propaghi ad altri elementi
    
    // Usiamo il metodo del Service! 
    // Questo aggiornerà l'array centrale che la Dashboard legge.
    this.housingService.toggleFavorite(this.housingLocation.id);
  }
}
