import { Component,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HousingService } from '../housing.service'; 
import { HousingLocation } from '../housing-location'; 
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  template: `
  <article>
    <img class="listing-photo" [src] = "housingLocation?.photo">
    <div class="listing-info-container"> 
    <section class="listing-description">
      <h2 class="listing-heading">{{housingLocation?.name}}</h2>
      <p class="listing-location"> {{housingLocation?.city}},{{housingLocation?.state}}</p>
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
    </section>
    <section class="listing-apply">
      <h2 class="section-heading">Fai domanda ora per vivere qui </h2>
      <form [formGroup]="applyForm" (submit)="submitApplication()">
        <label for="first-name">Nome</label>
        <input id="first-name" type="text" formControlName="firstName">
        <p *ngIf="applyForm.get('firstName')?.invalid && applyForm.get('firstName')?.touched" class="error-text">
          Il nome è obbligatorio
        </p>

        <label  for="last-name">Cognome</label>
        <input id="last-name" type="text" formControlName="lastName">
        <p *ngIf="applyForm.get('lastName')?.invalid && applyForm.get('lastName')?.touched" class="error-text">
          Il cognome è obbligatorio
        </p>


        <label for="email">Email </label>
        <input id="email" type="email" formControlName="email">
        <p *ngIf="applyForm.get('email')?.invalid && applyForm.get('email')?.touched" class="error-text">
          Inserisci un'email valida
        </p>

        <button type="submit" class="primary">Applica ora</button>
      </form>
    </section>
  </div>
  </article>
  `,
  styleUrls: ['./details.component.css']
})

export class DetailsComponent {
  route:ActivatedRoute = inject (ActivatedRoute);
  router: Router = inject(Router);

  housingService = inject (HousingService);
  housingLocation:HousingLocation | undefined;
  applyForm = new FormGroup ({
    firstName:new FormControl ('', Validators.required),
    lastName: new FormControl ('', Validators.required),
    email: new FormControl ('', [Validators.required,Validators.email])
  });

  constructor() {
     const housingLocationId = Number(this.route.snapshot.params['id']);
     this.housingService.getHousingLocationById(housingLocationId).then(housingLocation => {
      this.housingLocation = housingLocation;
     });
  }
  submitApplication() {
    // AGGIUNTO: Se il form è invalido, non fare nulla e segna i campi come "toccati" per mostrare il rosso
    if (this.applyForm.invalid) {
      this.applyForm.markAllAsTouched();
      return;
    }
      // Salviamo il nome in una costante per poterlo riutilizzare sotto
      const firstName = this.applyForm.value.firstName ?? '';
      this.housingService.submitApplication(
      firstName,
      this.applyForm.value.lastName?? '',
      this.applyForm.value.email?? '',
    );
    
    // Passiamo il nome come parametro nell'URL (es: /thank-you?name=Ilaria)
    this.router.navigate(['/thank-you'], { queryParams: { name: firstName } });
  }

}