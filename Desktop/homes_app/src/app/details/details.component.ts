import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HousingService } from '../housing.service'; 
import { HousingLocation } from '../housing-location'; 
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { DbService } from '../db.service'; 
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslateModule],
  template: `
  <article>
    <div class="photo-side">
      <img class="listing-photo" [src]="housingLocation?.photo" [alt]="('HOUSING_DETAILS.PHOTO_ALT' | translate) + ' ' + housingLocation?.name">
      
      <section class="faq-section">
        <h2 class="section-heading">{{ 'HOUSING_DETAILS.FAQ_TITLE' | translate }}</h2>
        <div *ngFor="let faq of faqs; let i = index" class="faq-item">
          <button (click)="toggleFaq(i)" class="faq-question">
            {{ faq.question | translate }}
            <span class="icon">{{ faq.open ? '−' : '+' }}</span>
          </button>
          <div *ngIf="faq.open" class="faq-answer">{{ faq.answer | translate }}</div>
        </div>
      </section>
    </div>

    <div class="listing-info-container"> 
      <section class="listing-description">
        <h2 class="listing-heading">{{housingLocation?.name}}</h2>
        <p class="listing-location"> {{housingLocation?.city}}, {{housingLocation?.state}}</p>
      </section>

      <section class="listing-features">
        <h2 class="section-heading">{{ 'HOUSING_DETAILS.ABOUT_SECTION' | translate }}</h2>
        <ul>
          <li>{{ 'HOUSING_DETAILS.UNITS' | translate }}: {{ housingLocation?.availableUnits}}</li>
          <li>{{ 'HOUSING_DETAILS.SQUARE_METERS' | translate }}: {{ housingLocation?.metratura }} mq</li>
          <li>{{ 'HOUSING_DETAILS.FLOOR' | translate }}: {{ housingLocation?.piano }}</li>
          <li>{{ 'HOUSING_DETAILS.HAS_WIFI' | translate }}: {{ housingLocation?.wifi ? ('HOUSING_DETAILS.YES' | translate) : ('HOUSING_DETAILS.NO' | translate) }}</li>
          <li>{{ 'HOUSING_DETAILS.HAS_LAUNDRY' | translate }}: {{ housingLocation?.laundry ? ('HOUSING_DETAILS.YES' | translate) : ('HOUSING_DETAILS.NO' | translate) }}</li>
        </ul>
        <a [routerLink]="['/details', housingLocation?.id, 'description']" class="primary" style="text-decoration: none; display: inline-block; margin-top: 10px;">
          {{ 'HOUSING_DETAILS.FULL_DESCRIPTION' | translate }}
        </a>
      </section>

      <section class="listing-apply">
        <h2 class="section-heading">{{ 'HOUSING_DETAILS.APPLY_TITLE' | translate }}</h2>
        <form [formGroup]="applyForm" (submit)="submitApplication()">
          <label for="first-name">{{ 'HOUSING_DETAILS.FIRST_NAME' | translate }}</label>
          <input id="first-name" type="text" formControlName="firstName">
          
          <label for="last-name">{{ 'HOUSING_DETAILS.LAST_NAME' | translate }}</label>
          <input id="last-name" type="text" formControlName="lastName">

          <label for="email">{{ 'HOUSING_DETAILS.EMAIL' | translate }}</label>
          <input id="email" type="email" formControlName="email">

          <button type="submit" class="primary" [disabled]="applyForm.invalid">
            {{ 'HOUSING_DETAILS.APPLY_BTN' | translate }}
          </button>
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
  translate = inject(TranslateService);
  
  housingLocation: HousingLocation | undefined;

  // AGGIORNATO QUI: le chiavi ora puntano a HOUSING_DETAILS
  faqs = [
    { question: "HOUSING_DETAILS.FAQ_1_Q", answer: "HOUSING_DETAILS.FAQ_1_A", open: false },
    { question: "HOUSING_DETAILS.FAQ_2_Q", answer: "HOUSING_DETAILS.FAQ_2_A", open: false }
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
        const targetId = Number(this.housingLocation.id);

        // AGGIORNATO QUI: riferimento allo stato in HOUSING_DETAILS
        const translatedStatus = this.translate.instant('HOUSING_DETAILS.STATUS_PENDING');
        
        const currentLang = this.translate.getCurrentLang() || 'it';

        await this.dbService.table('applications').add({
          locationId: targetId,
          applicantName: `${firstName} ${lastName}`,
          email: email,
          date: new Date().toLocaleDateString(currentLang === 'it' ? 'it-IT' : 'en-US'),
          status: translatedStatus
        });

        setTimeout(() => {
          this.router.navigate(['/thank-you'], { queryParams: { name: firstName } });
        }, 100);

      } catch (error) {
        console.error("Errore nel salvataggio:", error);
      }
    }
  }
}