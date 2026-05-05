import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HousingLocationComponent } from '../housing-location/housing-location.component';
import { RouterModule } from '@angular/router';
import { DbService } from '../db.service';
import { HousingLocation } from '../housing-location'; 

// Importiamo i dati dal file db.json
import data from '../../../db.json';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HousingLocationComponent, RouterModule],
  template: `
    <section>
      <form>
        <input type="text" placeholder="Filtra per città" #filter id="city-filter" name="city-filter">
        <button class="primary" type="button" (click)="filterResults(filter.value)">Cerca</button>
      </form>
    </section>
    <section class="results">
      <!-- La lista si aggiornerà da sola grazie a liveQuery nel service -->
      <app-housing-location 
        *ngFor="let housingLocation of filteredLocationList" 
        [housingLocation]="housingLocation">
      </app-housing-location>
    </section>
  `,
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  housingLocationList: HousingLocation[] = [];
  filteredLocationList: HousingLocation[] = [];

  private dbService = inject(DbService);

  constructor() {}

  async ngOnInit() {
    // 1. Popoliamo il database Dexie con i dati del file JSON (se il DB è vuoto)
    if (data && data.locations) {
      await this.dbService.seedDatabase(data.locations);
    }

    // 2. Ci sottoscriviamo all'Observable reattivo. 
    // Ogni volta che aggiungerai o eliminerai una casa, la vista cambierà subito.
    this.dbService.locations$.subscribe((results: HousingLocation[]) => {
      this.housingLocationList = results;
      this.filteredLocationList = results;
    });
  }

  // Funzione di filtraggio (rimane invariata)
  filterResults(text: string) {
    if (!text) {
      this.filteredLocationList = this.housingLocationList;
      return;
    }

    this.filteredLocationList = this.housingLocationList.filter(
      housingLocation => housingLocation?.city.toLowerCase().includes(text.toLowerCase())
    );
  }
}
