import { Component, Input, Output, EventEmitter, inject } from '@angular/core'; 
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

      <p class="listing-location" (click)="apriMappa($event, mapModal)" style="cursor: pointer;">
        {{housingLocation.city}}, {{housingLocation.state}}
      </p>

      <div class="details-area">
        <a [routerLink]="['/details', housingLocation.id]">Dettaglio Ilaria</a>
        <a [routerLink]="['/details-mico', housingLocation.id]">Dettaglio Mico</a>
        
        <!-- VISIBILE SOLO ADMIN: gestione candidature -->
        <button *ngIf="userRole === 'admin'" class="btn-candidature" (click)="onApriCandidature($event)">
          📋 Candidature
        </button>
      </div>

      <div class="top-actions">
        <!-- ⭐ Preferiti: Visibile a tutti i loggati -->
        <button *ngIf="userRole" class="star-btn" (click)="toggleFavorite($event)">
          {{ housingLocation.isFavorite ? '★' : '☆' }}
        </button>

        <!-- 📷 Foto -->
        <button class="btn-foto" (click)="apriFoto($event, photoModal)">📷 Foto</button>

        <!-- 🗑 Elimina: VISIBILE SOLO ADMIN -->
        <button *ngIf="userRole === 'admin'" class="btn-elimina" (click)="eliminaCasa()">
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

      <!-- MODALE SLIDER FOTO -->
      <dialog #photoModal class="modal-container">
        <div class="modal-header">
          <h3>Galleria di {{housingLocation.name}}</h3>
          <button (click)="photoModal.close()">×</button>
        </div>
        <div class="modal-body">
          <div class="slider-wrapper">
            <button class="slider-nav prev" (click)="prevPhoto()">‹</button>
            <img [src]="currentPhotos[currentIndex]" class="slider-img">
            <button class="slider-nav next" (click)="nextPhoto()">›</button>
          </div>
          <p class="counter">{{currentIndex + 1}} / {{currentPhotos.length}}</p>
        </div>
      </dialog>
    </section>
  `,
  styleUrls: ['./housing-location.component.css']
})
export class HousingLocationComponent {
  @Input() housingLocation!: HousingLocation;
  @Output() apriCandidatureRichiesto = new EventEmitter<HousingLocation>();

  housingService = inject(HousingService);
  
  // RECUPERO IL RUOLO DALLO STORAGE
  userRole: string | null = localStorage.getItem('userRole');
  
  currentIndex = 0;

  get currentPhotos(): string[] {
    return this.housingLocation.photos ?? []; 
  }

  onApriCandidature(event: Event) {
    event.stopPropagation();
    if (this.userRole === 'admin') {
      this.apriCandidatureRichiesto.emit(this.housingLocation);
    }
  }

  apriMappa(event: Event, modal: HTMLDialogElement) {
    event.stopPropagation();
    modal.showModal();
  }

  apriFoto(event: Event, modal: HTMLDialogElement) {
    event.stopPropagation();
    modal.showModal();
  }

  nextPhoto() {
    if (this.currentIndex < this.currentPhotos.length - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0;
    }
  }

  prevPhoto() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.currentPhotos.length - 1;
    }
  }

  async toggleFavorite(event: Event) {
    event.stopPropagation();
    await this.housingService.toggleFavorite(this.housingLocation);
  }

  async eliminaCasa() {
    // Controllo extra di sicurezza prima di procedere
    if (this.userRole !== 'admin') return;

    if (this.housingLocation.id !== undefined && confirm("Sei sicuro di voler eliminare questa proprietà?")) {
      await this.housingService.deleteHousingLocation(this.housingLocation.id);
    }
  }
}
