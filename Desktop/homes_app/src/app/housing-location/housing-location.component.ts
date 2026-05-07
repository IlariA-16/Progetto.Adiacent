import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HousingLocation } from '../housing-location';
import { RouterModule } from '@angular/router';
import { HousingService } from '../housing.service'; 

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

      <div class="top-actions">

        <!-- ⭐ Preferiti -->
        <button class="star-btn" (click)="toggleFavorite($event)">
          {{ housingLocation.isFavorite ? '★' : '☆' }}
        </button>

        <!-- 🗑 Elimina -->
        <button class="btn-elimina" (click)="eliminaCasa()">
          Elimina
        </button>

        <div class="price-badge">€{{housingLocation.price}}</div>
      </div>

      <!-- MODALE MAPPA -->
      <dialog #mapModal class="modal-container">
        <div class="modal-header">
          <h3>Posizione di {{housingLocation.name}}</h3>
          <button (click)="mapModal.close()">×</button>
        </div>
        <div class="modal-body">
          <p>Vuoi visualizzare la mappa per {{housingLocation.city}}?</p>
          <a 
            [href]="'https://www.google.com/maps/search/?api=1&query=' + housingLocation.name + ' ' + housingLocation.city" 
            target="_blank" 
            class="btn-maps">
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

  housingService = inject(HousingService);

  async toggleFavorite(event: Event) {
    event.stopPropagation();
    await this.housingService.toggleFavorite(this.housingLocation);
  }

  async eliminaCasa() {
    if (this.housingLocation.id !== undefined && confirm("Sei sicuro di voler eliminare questa proprietà?")) {
      await this.housingService.deleteHousingLocation(this.housingLocation.id);
    }
  }
}