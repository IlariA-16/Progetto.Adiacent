import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { HousingLocation } from '../housing-location';
import { DbService } from '../db.service';
import { Router } from '@angular/router';
// 1. Importa i moduli necessari per la traduzione
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-house',
  standalone: true,
  // 2. Aggiungi TranslateModule agli imports
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './add-house.component.html',
  styleUrls: ['./add-house.component.css']
})
export class AddHouseComponent {
  private dbService = inject(DbService);
  private router = inject(Router);
  // 3. Inietta il servizio di traduzione
  private translate = inject(TranslateService);

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

  async submitApplication() {
    if (this.applyForm.invalid) {
      // 4. Traduzione del messaggio di errore del form
      alert(this.translate.instant('ERRORS.INVALID_FORM'));
      return;
    }

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
      await this.dbService.addLocation(newLocation);
      
      // 5. Traduzione del messaggio di successo
      alert(this.translate.instant('SUCCESS.HOUSE_SAVED'));
      
      this.applyForm.reset({ 
        availableUnits: 1, 
        metratura: 0, 
        lati: 0, 
        long: 0, 
        state: 'Italia',
        wifi: false,
        laundry: false 
      });

      this.router.navigate(['/']);

    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
      // 6. Traduzione del messaggio di errore tecnico
      alert(this.translate.instant('ERRORS.SAVE_FAILED'));
    }
  }
}