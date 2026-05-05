import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HousingLocationComponent } from '../housing-location/housing-location.component';
import { HousingLocation } from '../housing-location';
import { DbService } from '../db.service'; // ✅ Usa il DbService
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HousingLocationComponent, RouterModule],
  template: `
    <section>
      <form (submit)="filterResults(filter.value); $event.preventDefault()">
        <input type="text" placeholder="Cerca per città, nome o stato" #filter (keyup)="filterResults(filter.value)">
        <button class="primary" type="submit">Cerca</button>
      </form>
    </section>
    
    <section class="results">
      <app-housing-location 
        *ngFor="let housingLocation of filteredLocationList" 
        [housingLocation]="housingLocation">
      </app-housing-location>
    </section>
  `,
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  housingLocationList: HousingLocation[] = [];
  filteredLocationList: HousingLocation[] = [];
  
  // ✅ Inietta il DbService
  private dbService = inject(DbService);

  constructor() {
    // ✅ Ascolta i cambiamenti del database in tempo reale
    this.dbService.locations$.subscribe((locations: HousingLocation[]) => {
      this.housingLocationList = locations;
      this.filteredLocationList = locations;
    });
  }

  filterResults(text: string) {
    if (!text) {
      this.filteredLocationList = this.housingLocationList;
      return;
    }

    const lowerText = text.toLowerCase();
    this.filteredLocationList = this.housingLocationList.filter(
      housingLocation => 
        housingLocation?.city.toLowerCase().includes(lowerText) ||
        housingLocation?.name.toLowerCase().includes(lowerText) ||
        housingLocation?.state.toLowerCase().includes(lowerText)
    );
  }
}
