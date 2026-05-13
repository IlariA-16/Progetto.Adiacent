import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HousingLocation } from '../housing-location';
import { RouterModule } from '@angular/router';
import { HousingService } from '../housing.service'; 
// Importa Translate
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-housing-location',
  standalone: true,
  // Aggiungi TranslateModule qui
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <section class="listing">
      <img class="listing-photo" [src]="housingLocation.photo" [alt]="('LISTING.PHOTO_ALT' | translate) + ' ' + housingLocation.name">
      <h2 class="listing-heading">{{housingLocation.name}}</h2>

      <p class="listing-location" (click)="apriMappa($event, mapModal)" style="cursor: pointer;">
        {{housingLocation.city}}, {{housingLocation.state}}
      </p>

      <div class="details-area">
        <a [routerLink]="['/details', housingLocation.id]">{{ 'LISTING.DETAILS_ILARIA' | translate }}</a>
        <a [routerLink]="['/details-mico', housingLocation.id]">{{ 'LISTING.DETAILS_MICO' | translate }}</a>
        
        <button class="btn-candidature" (click)="onApriCandidature($event)">
          📋 {{ 'LISTING.APPLICATIONS' | translate }}
        </button>
      </div>

      <div class="top-actions">
        <button class="star-btn" (click)="toggleFavorite($event)">
          {{ housingLocation.isFavorite ? '★' : '☆' }}
        </button>

        <button class="btn-foto" (click)="apriFoto($event, photoModal)">📷 {{ 'LISTING.PHOTOS_BTN' | translate }}</button>

        <button class="btn-elimina" (click)="eliminaCasa()">
          {{ 'LISTING.DELETE_BTN' | translate }}
        </button>

        <div class="price-badge">€{{housingLocation.price}}</div>
      </div>

      <!-- MODALE MAPPA -->
      <dialog #mapModal class="modal-container">
        <div class="modal-header">
          <h3>{{ 'LISTING.MODAL_MAP_TITLE' | translate }} {{housingLocation.name}}</h3>
          <button (click)="mapModal.close()">×</button>
        </div>
        <div class="modal-body">
          <p>{{ 'LISTING.MODAL_MAP_BODY' | translate }} {{housingLocation.city}}?</p>
          <a 
            [href]="'https://www.google.com/maps/search/?api=1&query=' + housingLocation.name + ' ' + housingLocation.city" 
            target="_blank" 
            class="btn-maps">
            {{ 'LISTING.OPEN_MAPS' | translate }}
          </a>
        </div>
      </dialog>

      <!-- MODALE SLIDER FOTO -->
      <dialog #photoModal class="modal-container">
        <div class="modal-header">
          <h3>{{ 'LISTING.MODAL_PHOTO_TITLE' | translate }} {{housingLocation.name}}</h3>
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
  translate = inject(TranslateService); // Inietta il servizio per i confirm
  currentIndex = 0;

  get currentPhotos(): string[] {
    return this.housingLocation.photos ?? []; 
  }

  // ... (altri metodi rimangono uguali)

  async eliminaCasa() {
    // Traduzione del messaggio di conferma
    const messaggio = this.translate.instant('LISTING.CONFIRM_DELETE');
    if (this.housingLocation.id !== undefined && confirm(messaggio)) {
      await this.housingService.deleteHousingLocation(this.housingLocation.id);
    }
  }

  // Aggiungi questi se non ci sono per le foto
  onApriCandidature(event: Event) { event.stopPropagation(); this.apriCandidatureRichiesto.emit(this.housingLocation); }
  apriMappa(event: Event, modal: HTMLDialogElement) { event.stopPropagation(); modal.showModal(); }
  apriFoto(event: Event, modal: HTMLDialogElement) { event.stopPropagation(); modal.showModal(); }
  nextPhoto() { this.currentIndex = (this.currentIndex + 1) % this.currentPhotos.length; }
  prevPhoto() { this.currentIndex = (this.currentIndex - 1 + this.currentPhotos.length) % this.currentPhotos.length; }
  async toggleFavorite(event: Event) { event.stopPropagation(); await this.housingService.toggleFavorite(this.housingLocation); }
}
