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
        <img class="listing-photo" [src]="housingLocation?.photo" 
          alt="Foto di {{housingLocation?.name}}">
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

  onSubmit() {
    if (this.applyForm.valid) {
      this.housingService.submitApplication(
        this.applyForm.value.firstName ?? '',
        this.applyForm.value.lastName ?? '',
        this.applyForm.value.email ?? ''
      );
      this.router.navigate(['/thank-you']);
    } else {
      alert('Per favore, compila tutti i campi correttamente.');
    }
  }
}