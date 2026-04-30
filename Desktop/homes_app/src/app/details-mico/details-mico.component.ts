import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HousingService } from '../housing.service'; 
import { HousingLocation } from '../housing-location'; 
import { FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';






@Component({
  selector: 'app-details-mico',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <article>
      <img class="listing-photo" [src]="housingLocation?.photo" 
      alt="Exterior photo of {{housingLocation?.name}}">
      <section class="listing-description">
      <h2 class="listing-heading">{{housingLocation?.name}}</h2>
      <p class="listing-location">{{housingLocation?.city}}, {{housingLocation?.state}}</p>
    </section>
    

    <section class="listing-features"> 
      <h2 class="section-heading">A proposito di questa posizione abitativa</h2>
      <ul>
        <li>case disponibili: {{housingLocation?.availableUnits}}</li>
        <li>questa casa ha il wifi: {{housingLocation?.wifi}}</li>
        <li>questa casa ha la lavanderia: {{housingLocation?.laundry}}</li>
        </ul>
      </section>
      <section class="listing-apply">
       <h2 class="section-heading">fai richiesta ora per vivere qui</h2>

       <form [formGroup]="applyForm" (ngSubmit)="onSubmit()">
        <label for="first-name">First Name</label>
        <input id="first-name" type="text" formControlName="firstName">

        <label for="last-name">Last Name</label>
        <input id="last-name" type="text" formControlName="lastName">

        <label for="email">Email</label>
        <input id="email" type="email" formControlName="email">
        <button type="submit" 
        class="primary" 
        [disabled]="!applyForm.valid"
        [style.opacity]="applyForm.valid ? '1' : '0.5'"
        [style.cursor]="applyForm.valid ? 'pointer' : 'not-allowed'">
        Applica ora
        </button>
        </form>
      </section>

        <!-- NUOVA SEZIONE: FAQ -->
      <hr class="divider">
      <section class="info-section">
        <h2 class="section-heading">Domande Frequenti</h2>
        <div class="faq-grid">
          <div class="faq-item">
            <h3>Come funziona il processo di affitto?</h3>
            <p>Una volta inviata la richiesta, verrai ricontattato entro 24 ore per una visita virtuale o in presenza.</p>
          </div>
          <div class="faq-item">
            <h3>Sono inclusi i costi delle utenze?</h3>
            <p>Dipende dalla posizione. Controlla la sezione "Caratteristiche" per vedere se i servizi sono inclusi nel canone.</p>
          </div>
        </div>
      </section>

      <!-- NUOVA SEZIONE: FOOTER AZIENDALE -->
      <footer class="company-footer">
        <div class="footer-content">
          <div class="brand-info">
            <h2 class="footer-logo">Homes</h2>
            <p>La piattaforma leader per trovare la tua prossima casa in modo semplice, veloce e sicuro.</p>
          </div>
          <div class="contact-info">
            <h3>Contatti</h3>
            <ul>
              <li>📍 Via Roma 123, Milano</li>
              <li>📞 +39 02 123 4567</li>
              <li>✉️ info@homes-rent.it</li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2024 Homes Inc. Progettato con cura per i nostri inquilini.</p>
        </div>
      </footer>
      
    </article>
        `,
  styleUrls: ['./details-mico.component.css']

})
export class DetailsMicoComponent {
   route:ActivatedRoute = inject (ActivatedRoute);
   router: Router = inject(Router);
    housingService = inject (HousingService);
    housingLocation:HousingLocation | undefined;

 // SOSTITUISCI DA QUI...
  applyForm = new FormGroup({
    firstName: new FormControl('', Validators.required), // Aggiunto Validators.required
    lastName: new FormControl('', Validators.required),  // Aggiunto Validators.required
    email: new FormControl('', [Validators.required, Validators.email]), // Aggiunto required e controllo email
  });
  // ...A QUI

    constructor() {
      const housingLocationId = Number(this.route.snapshot.params['id']);
     this.housingService.getHousingLocationById(housingLocationId).then(housingLocation => {
      this.housingLocation = housingLocation;
     });
    }

   // Il tuo onSubmit rimane uguale, ora funzionerà perfettamente con i nuovi controlli
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
