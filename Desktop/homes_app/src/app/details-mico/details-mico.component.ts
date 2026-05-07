import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HousingService } from '../housing.service'; 
import { HousingLocation } from '../housing-location'; 
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-details-mico',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <article class="details-container">
      <div class="hero-section">
        <button type="button" class="carousel-btn prev" (click)="prevPhoto()" *ngIf="getPhotos().length > 1">❮</button>
        
        <img class="listing-photo" [src]="getPhotos()[currentIndex]" 
          alt="Foto di {{housingLocation?.name}}">
        
        <button type="button" class="carousel-btn next" (click)="nextPhoto()" *ngIf="getPhotos().length > 1">❯</button>
        
        <div class="photo-overlay"></div>
      </div>
      
      <div class="content-grid">
        <section class="main-info">
          <header>
            <h2 class="listing-heading">{{housingLocation?.name}}</h2>
            <p class="listing-location">
              <span class="pin-icon">📍</span> {{housingLocation?.city}}, {{housingLocation?.state}}
            </p>
          </header>

          <div class="description-box">
            <h3 class="section-heading">Descrizione immobile</h3>
            <p class="text-content">
              Benvenuti a {{housingLocation?.name}}. Questa struttura offre un'esperienza abitativa 
              confortevole nel cuore di {{housingLocation?.city}}. Gli interni sono curati per 
              garantire il massimo relax e funzionalità.
            </p>
          </div>

          <div class="features-box">
            <h3 class="section-heading">Dettagli e Servizi</h3>
            <div class="features-grid">
              <div class="feature-item">
                <span class="label">Disponibilità</span>
                <span class="value">{{housingLocation?.availableUnits}} unità</span>
              </div>
              <div class="feature-item">
                <span class="label">Wi-Fi</span>
                <span class="value">{{housingLocation?.wifi ? 'Incluso' : 'Non disponibile'}}</span>
              </div>
              <div class="feature-item">
                <span class="label">Lavanderia</span>
                <span class="value">{{housingLocation?.laundry ? 'Presente' : 'Non presente'}}</span>
              </div>
            </div>
          </div>

          <section class="faq-section">
            <h3 class="section-heading">Domande Frequenti</h3>
            <div class="faq-container">
              <div *ngFor="let faq of faqs; let i = index" class="faq-item">
                <button type="button" class="faq-question" (click)="toggleFaq(i)">
                  {{ faq.q }}
                  <span class="faq-icon">{{ openedFaq === i ? '−' : '+' }}</span>
                </button>
                <div class="faq-answer" [class.open]="openedFaq === i">
                  <p>{{ faq.a }}</p>
                </div>
              </div>
            </div>
          </section>
        </section>

        <section class="apply-section">
          <div class="sticky-form">
            <h2 class="section-heading">Prenota una visita</h2>
            <p class="form-subtext">Compila i campi sottostanti per inviare la tua richiesta.</p>
            
            <form [formGroup]="applyForm" (ngSubmit)="onSubmit()">
              <div class="input-group">
                <label for="first-name">Nome</label>
                <input id="first-name" type="text" formControlName="firstName">
              </div>

              <div class="input-group">
                <label for="last-name">Cognome</label>
                <input id="last-name" type="text" formControlName="lastName">
              </div>

              <div class="input-group">
                <label for="email">Email</label>
                <input id="email" type="email" formControlName="email">
              </div>

              <button type="submit" class="primary-btn" [disabled]="!applyForm.valid">
                Invia Candidatura
              </button>
            </form>
          </div>
        </section>
      </div>
    </article>
  `,
  styleUrls: ['./details-mico.component.css']
})
export class DetailsMicoComponent {
  route: ActivatedRoute = inject(ActivatedRoute);
  router: Router = inject(Router);
  housingService = inject(HousingService);
  housingLocation: HousingLocation | undefined;

  // AGGIUNTO: Indice per il carosello
  currentIndex: number = 0;

  // Variabili per le FAQ
  openedFaq: number | null = null;
  faqs = [
    { q: "Sono ammessi animali domestici?", a: "Sì, accettiamo animali di piccola taglia previa comunicazione." },
    { q: "Le bollette sono incluse nel prezzo?", a: "Il canone include acqua e condominio; luce e gas sono a parte." },
    { q: "C'è un deposito cauzionale?", a: "Sì, è richiesta una cauzione pari a due mensilità." }
  ];

  applyForm = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  constructor() {
    const housingLocationId = Number(this.route.snapshot.params['id']);
    this.housingService.getHousingLocationById(housingLocationId).then(housingLocation => {
      this.housingLocation = housingLocation;
    });
  }

  // AGGIUNTO: Funzione helper per ottenere le foto in sicurezza
  getPhotos(): string[] {
    if (this.housingLocation?.photos && this.housingLocation.photos.length > 0) {
      return this.housingLocation.photos;
    }
    return this.housingLocation?.photo ? [this.housingLocation.photo] : [];
  }

  // AGGIUNTO: Metodi di navigazione carosello
  nextPhoto() {
    this.currentIndex = (this.currentIndex + 1) % this.getPhotos().length;
  }

  prevPhoto() {
    this.currentIndex = (this.currentIndex - 1 + this.getPhotos().length) % this.getPhotos().length;
  }

  toggleFaq(index: number) {
    this.openedFaq = this.openedFaq === index ? null : index;
  }

  onSubmit() {
    const fName = this.applyForm.value.firstName ?? '';
    const lName = this.applyForm.value.lastName ?? '';
    const email = this.applyForm.value.email ?? '';
    const idCasa = this.housingLocation?.id;

    if (this.applyForm.valid && idCasa !== undefined) {
      this.housingService.submitApplication(fName, lName, email, idCasa);
      this.router.navigate(['/thank-you']);
    } else {
      alert('Per favore, compila tutti i campi correttamente.');
    }
  }
}