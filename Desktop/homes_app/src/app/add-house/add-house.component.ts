import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DbService } from '../db.service';
import { HousingLocation } from '../housing-location'; // ✅ Importato dal file corretto

@Component({
  selector: 'app-add-house',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-house.component.html',
  styleUrls: ['./add-house.component.css']
})
export class AddHouseComponent {
  dbService = inject(DbService);
 
  applyForm = new FormGroup({
    name: new FormControl('', Validators.required),
    city: new FormControl('', Validators.required),
    state: new FormControl(''),
    photo: new FormControl(''),
    availableUnits: new FormControl(1),
    metratura: new FormControl(0),
    piano: new FormControl(''),
    description: new FormControl(''),
    wifi: new FormControl(false),
    laundry: new FormControl(false),
    lat: new FormControl(0),
    long: new FormControl(0)
  });
 
  async submitApplication() {
    if (this.applyForm.invalid) return;
 
    const newLocation: HousingLocation = this.applyForm.value as HousingLocation;
 
    try {
      await this.dbService.addLocation(newLocation);
      alert('Proprietà salvata con successo!');
      this.applyForm.reset({ 
        availableUnits: 1, 
        metratura: 0, 
        lat: 0, 
        long: 0,
        wifi: false,
        laundry: false 
      });
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
    }
  }
}
