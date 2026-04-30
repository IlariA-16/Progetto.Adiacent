import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HousingService } from '../housing.service'; 
import { HousingLocation } from '../housing-location'; 
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
  <article>
    <!-- Contenitore per Foto + FAQ -->
    <div class="photo-side">
      <img class="listing-photo" [src]="housingLocation?.photo">
      
      <!-- SEZIONE FAQ SOTTO LA FOTO -->
      <section class="faq-section">
        <h2 class="section-heading">Domande Frequenti 💡</h2>
        
        <div *ngFor="let faq of faqs; let i = index" class="faq-item">
          <button (click)="toggleFaq(i)" class="faq-question">
            {{ faq.question }}
            <span class="icon">{{ faq.open ? '−' : '+' }}</span>
          </button>
          
          <div *ngIf="faq.open" class="faq-answer">
            {{ faq.answer }}
          </div>
        </div>
      </section>
    </div>

    <div class="listing-info-container"> 
      <section class="listing-description">
        <h2 class="listing-heading">{{housingLocation?.name}}</h2>
        <p class="listing-location"> {{housingLocation?.city}}, {{housingLocation?.state}}</p>
      </section>

      <section class="listing-features">
        <h2 class="section-heading">A proposito di questa posizione abitativa</h2>
        <ul>
          <li>Unità disponibili: {{ housingLocation?.availableUnits}}</li>
          <li>Metratura: {{ housingLocation?.metratura }} mq</li>
          <li>Piano: {{ housingLocation?.piano }}</li>
          <li>Questa struttura ha il wifi: {{housingLocation?.wifi ? 'Sì' : 'No'}}</li>
          <li>Questa struttura ha la lavanderia: {{housingLocation?.laundry ? 'Sì' : 'No'}}</li>
        </ul>

        <a [routerLink]="['/details', housingLocation?.id, 'description']" class="primary" style="text-decoration: none; display: inline-block; margin-top: 10px;">
          Leggi descrizione completa
        </a>
      </section>

      <section class="listing-apply">
        <h2 class="section-heading">Fai domanda ora per vivere qui </h2>
        <form [formGroup]="applyForm" (submit)="submitApplication()">
          
          <label for="first-name">NOME</label>
          <input id="first-name" type="text" formControlName="firstName">
          <p *ngIf="applyForm.get('firstName')?.invalid && applyForm.get('firstName')?.touched" class="error-msg">
            Il nome è obbligatorio
          </p>

          <label for="last-name">COGNOME</label>
          <input id="last-name" type="text" formControlName="lastName">
          <p *ngIf="applyForm.get('lastName')?.invalid && applyForm.get('lastName')?.touched" class="error-msg">
            Il cognome è obbligatorio
          </p>

          <label for="email">EMAIL</label>
          <input id="email" type="email" formControlName="email">
          <p *ngIf="applyForm.get('email')?.invalid && applyForm.get('email')?.touched" class="error-msg">
            Inserisci un'email valida
          </p>

          <button type="submit" class="primary" [disabled]="applyForm.invalid">Applica ora</button>
        </form>
      </section>
    </div>
  </article>
  `,
  styleUrls: ['./details.component.css']
})
export class DetailsComponent {
  route: ActivatedRoute = inject(ActivatedRoute);
  router: Router = inject(Router);
  housingService = inject(HousingService);
  housingLocation: HousingLocation | undefined;

  faqs = [
    { 
      question: "Tutte le strutture sono arredate?", 
      answer: "Sì, ogni nostra soluzione abitativa viene consegnata completa di arredi essenziali (letto, armadio, cucina e tavolo) per permettere un ingresso immediato.",
      open: false 
    },
    { 
      question: "Le utenze sono incluse?", 
      answer: "Sì, i costi di acqua, luce e riscaldamento.",
      open: false 
    },
    { 
      question: "Posso visitare la casa prima di decidere?", 
      answer: "Certamente. Una volta approvata la domanda preliminare, organizzeremo un sopralluogo guidato per permetterti di visionare gli spazi di persona.",
      open: false 
    },
    { 
      question: "Quali documenti sono necessari per la domanda?", 
      answer: "Sono richiesti un documento d'identità valido, il codice fiscale e, se disponibile, la documentazione rilasciata dai servizi sociali di riferimento.",
      open: false 
    },
    { 
      question: "Sono ammessi animali domestici?", 
      answer: "La politica varia a seconda della struttura.",
      open: false 
    },
    { 
      question: "C'è un limite di età per fare domanda?", 
      answer: "Le nostre strutture sono aperte a maggiorenni o a nuclei familiari. Per i minori non accompagnati esistono percorsi dedicati tramite i servizi locali.",
      open: false 
    }
  ];

  applyForm = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email])
  });

  constructor() {
    const housingLocationId = Number(this.route.snapshot.params['id']);
    this.housingService.getHousingLocationById(housingLocationId).then(housingLocation => {
      this.housingLocation = housingLocation;
    });
  }

  toggleFaq(index: number) {
    this.faqs[index].open = !this.faqs[index].open;
  }

  submitApplication() {
    if (this.applyForm.valid) {
      const firstName = this.applyForm.value.firstName ?? '';
      this.router.navigate(['/thank-you'], { queryParams: { name: firstName } });
    }
  }
}
