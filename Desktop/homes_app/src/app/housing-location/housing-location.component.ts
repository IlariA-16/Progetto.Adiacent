import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HousingLocation } from '../housing-location';
import { RouterModule } from '@angular/router';
import { HousingService } from '../housing.service';
@Component({
  selector: 'app-housing-location',
  standalone: true,
  imports: [CommonModule,RouterModule],
  template: `
    <section class="listing">
      <img class="listing-photo" [src]="housingLocation.photo" alt="Exterior photo of {{housingLocation.name}}">
      
        
      <p class="listing-location">
        <a [href]="getGoogleMapsLink()" target="_blank">
          {{ housingLocation.city }}, {{ housingLocation.state }}
        </a>
      </p>


      <h2 class="listing-heading">{{housingLocation.name}}</h2>
      <div class="details-container">
        <a [routerLink]="['/details-mico', housingLocation.id]">Dettaglio Mico</a>
        <a [routerLink]="['/details', housingLocation.id]">Dettaglio Ilaria</a>
      </div>

      <button class="star-btn" (click)="toggleFavorite($event)">
        {{ housingService.isFavorite(housingLocation.id) ? '★' : '☆' }}
      </button>

      <footer class="listing-footer">

        <div class="company-info">
          <p class="brand-name">Housing Homes S.r.l.</p>
          <p>P.IVA: 1234567890 | <a href="tel:+390123456">📞 Chiama ufficio</a></p>
        </div>

      </footer>
      

    </section>
  `,
  styleUrls: ['./housing-location.component.css']
})
export class HousingLocationComponent {
  @Input() housingLocation!:HousingLocation;

  // Inietta il servizio qui per renderlo disponibile nel template
  housingService = inject(HousingService);

  // Funzione per gestire il click sulla stella
  toggleFavorite(event: Event) {
    event.stopPropagation(); // Evita che il click attivi altri link sottostanti
    this.housingService.toggleFavorite(this.housingLocation.id);
  }

// FUNZIONE GOOGLE MAPS
  getGoogleMapsLink(): string {
    const query = encodeURIComponent(
      `${this.housingLocation.name}, ${this.housingLocation.city}, ${this.housingLocation.state}`
    );

    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }





}
