import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HousingLocation } from '../housing-location';
import { RouterModule } from '@angular/router';
import { HousingService } from '../housing.service';
import { DbService } from '../db.service';

@Component({
  selector: 'app-housing-location',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="listing">
      <div class="image-wrapper">
        <img class="listing-photo" [src]="housingLocation.photo" alt="Alloggio">

        <div class="card-actions">
          <button class="icon-btn delete-btn" (click)="deleteHouse($event)" title="Elimina alloggio">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>

          <button class="icon-btn fav-btn" 
            [class.active]="housingService.isFavorite(housingLocation.id)" 
            (click)="toggleFavorite($event)" 
            title="Aggiungi ai preferiti">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          </button>
        </div>

        <div class="price-badge">
          {{ housingLocation.price }}€<span>/mese</span>
        </div>
      </div>

      <div class="card-body">
        <p class="listing-location">
           <a [href]="getGoogleMapsLink()" target="_blank" (click)="$event.stopPropagation()">
              <span class="pin">📍</span> {{ housingLocation.city }}, {{ housingLocation.state }}
           </a>
        </p>

        <h2 class="listing-heading">{{housingLocation.name}}</h2>
        
        <div class="details-nav">
          <a [routerLink]="['/details-mico', housingLocation.id]" (click)="$event.stopPropagation()" class="btn-detail">Dettaglio Mico</a>
          <a [routerLink]="['/details', housingLocation.id]" (click)="$event.stopPropagation()" class="btn-detail secondary">Dettaglio Ilaria</a>
        </div>
      </div>

      <footer class="listing-footer">
        <div class="company-info">
          <span class="brand-name">Housing Homes S.r.l.</span>
          <p class="company-sub">P.IVA: 1234567890 | <a href="tel:+390123456" (click)="$event.stopPropagation()">📞 Chiama</a></p>
        </div>
      </footer>
    </section>
  `,
  styleUrls: ['./housing-location.component.css']
})
export class HousingLocationComponent {
  @Input() housingLocation!: HousingLocation;
  @Output() favChanged = new EventEmitter<void>();
  @Output() houseDeleted = new EventEmitter<void>();

  public housingService = inject(HousingService);
  private dbService = inject(DbService);

  toggleFavorite(event: Event) {
    event.stopPropagation();
    this.housingService.toggleFavorite(this.housingLocation.id);
    this.favChanged.emit();
  }

  async deleteHouse(event: Event) {
    event.stopPropagation();
    const confirmDelete = confirm(`Vuoi eliminare ${this.housingLocation.name}?`);
    
    if (confirmDelete) {
      try {
        await this.dbService.locations.delete(this.housingLocation.id);
        this.houseDeleted.emit(); 
      } catch (error) {
        console.error("Errore durante l'eliminazione:", error);
      }
    }
  }

  getGoogleMapsLink(): string {
    // URL standard per la ricerca su Google Maps
    const baseUrl = "https://www.google.com/maps/search/?api=1&query=";
    const address = `${this.housingLocation.name}, ${this.housingLocation.city}, ${this.housingLocation.state}`;
    return baseUrl + encodeURIComponent(address);
  }
}