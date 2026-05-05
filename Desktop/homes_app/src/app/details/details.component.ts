import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HousingService } from '../housing.service'; 
import { HousingLocation } from '../housing-location'; 
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { DbService } from '../db.service'; 

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
  <article>
    <div class="photo-side">
      <img class="listing-photo" [src]="housingLocation?.photo" alt="Foto di {{housingLocation?.name}}">
      <section class="faq-section">
        <h2 class="section-heading">Domande Frequenti 💡</h2>
        <div *ngFor="let faq of faqs; let i = index" class="faq-item">
          <button (click)="toggleFaq(i)" class="faq-question">
            {{ faq.question }}
            <span class="icon">{{ faq.open ? '−' : '+' }}</span>
          </button>
          <div *ngIf="faq.open" class="faq-answer">{{ faq.answer }}</div>
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
          
          <label for="last-name">COGNOME</label>
          <input id="last-name" type="text" formControlName="lastName">

          <label for="email">EMAIL</label>
          <input id="email" type="email" formControlName="email">

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
  dbService = inject(DbService); 
  housingLocation: HousingLocation | undefined;

  faqs = [
    { question: "Tutte le strutture sono arredate?", answer: "Sì, ogni nostra soluzione abitativa viene consegnata completa di arredi essenziali.", open: false },
    { question: "Le utenze sono incluse?", answer: "Sì, i costi di acqua, luce e riscaldamento sono inclusi.", open: false }
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

  async submitApplication() {
    if (this.applyForm.valid && this.housingLocation) {
      try {
        const firstName = this.applyForm.value.firstName ?? '';
        const lastName = this.applyForm.value.lastName ?? '';
        const email = this.applyForm.value.email ?? '';
        
        // Convertiamo l'ID in numero per garantire la corrispondenza nel DB
        const targetId = Number(this.housingLocation.id);

        // Salvataggio nel database Dexie
        await this.dbService.table('applications').add({
          locationId: targetId,
          applicantName: `${firstName} ${lastName}`,
          email: email,
          date: new Date().toLocaleDateString('it-IT'),
          status: 'In Revisione'
        });

        // Piccola attesa per sicurezza prima del redirect
        setTimeout(() => {
          this.router.navigate(['/thank-you'], { queryParams: { name: firstName } });
        }, 100);

      } catch (error) {
        console.error("Errore nel salvataggio:", error);
      }
    }
  }
}
