import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { HousingLocation } from '../housing-location';
import { DbService } from '../db.service';


import { Router } from '@angular/router';

@Component({
  selector: 'app-add-house',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-house.component.html',
  styleUrls: ['./add-house.component.css']
})
export class AddHouseComponent {
  // Iniettiamo il servizio del database e il router per la navigazione
  private dbService = inject(DbService);
  private router = inject(Router);

  // Definizione del form con i nomi corretti per il tuo DB
  applyForm = new FormGroup({
    name: new FormControl('', Validators.required),
    city: new FormControl('', Validators.required),
    state: new FormControl('Italia'),
    photo: new FormControl(''),
    photos: new FormControl(''),
    availableUnits: new FormControl(1),
    metratura: new FormControl(0),
    piano: new FormControl(''),
    description: new FormControl(''),
    wifi: new FormControl(false),
    laundry: new FormControl(false),
    lati: new FormControl(0),
    long: new FormControl(0),
    price: new FormControl(0),
  });

  // Funzione chiamata al click sul tasto "Salva Proprietà"
  async submitApplication() {
    // Se il form non è valido (mancano nome o città), non fare nulla
    if (this.applyForm.invalid) {
      alert('Per favore, inserisci almeno il nome della casa e la città.');
      return;
    }

    // Mappiamo i valori del form nell'oggetto HousingLocation
    // Usiamo Number() e !! per assicurarci che i tipi siano corretti
    const newLocation: HousingLocation = {
      name: this.applyForm.value.name ?? '',
      city: this.applyForm.value.city ?? '',
      state: this.applyForm.value.state ?? 'Italia',
      photo: this.applyForm.value.photo ?? '',
      photos: [this.applyForm.value.photos ?? ''],
      availableUnits: Number(this.applyForm.value.availableUnits) ?? 1,
      metratura: Number(this.applyForm.value.metratura) ?? 0,
      piano: this.applyForm.value.piano ?? '',
      description: this.applyForm.value.description ?? '',
      wifi: !!this.applyForm.value.wifi,
      laundry: !!this.applyForm.value.laundry,
      lati: Number(this.applyForm.value.lati) ?? 0,
      long: Number(this.applyForm.value.long) ?? 0,
      price: Number(this.applyForm.value.price ?? 0),
    };
    

    try {
      // Salvataggio nel database locale Dexie
      await this.dbService.addLocation(newLocation);
      
      alert('Proprietà salvata con successo!');
      
      // Reset del form ai valori iniziali
      this.applyForm.reset({ 
        availableUnits: 1, 
        metratura: 0, 
        lati: 0, 
        long: 0, 
        state: 'Italia',
        wifi: false,
        laundry: false 
      });

      // Opzionale: Reindirizza l'utente alla Home per vedere la nuova casa
      this.router.navigate(['/']);

    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
      alert('Si è verificato un errore durante il salvataggio.');
    }
  }
}
