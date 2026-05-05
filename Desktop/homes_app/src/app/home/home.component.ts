import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HousingLocationComponent } from '../housing-location/housing-location.component';
import { RouterModule } from '@angular/router';
import { DbService } from '../db.service';
import { HousingLocation } from '../housing-location'; 


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
      <!-- Mostra le case filtrate o tutte quelle caricate dal DB -->
      <app-housing-location 
        *ngFor="let housingLocation of filteredLocationList" 
        [housingLocation]="housingLocation">
      </app-housing-location>
    </section>
  `,
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  // Liste per gestire i dati originali e quelli filtrati
  housingLocationList: HousingLocation[] = [];
  filteredLocationList: HousingLocation[] = [];

  // Iniettiamo il DbService che usa Dexie
  private dbService = inject(DbService);

  constructor() {}

  ngOnInit() {
    // Sottoscrizione all'Observable locations$ definito nel tuo DbService.
    // Grazie a liveQuery, questo blocco si esegue da solo ogni volta che il DB cambia.
    this.dbService.locations$.subscribe((data: HousingLocation[]) => {
      this.housingLocationList = data;
      this.filteredLocationList = data;
    });
  }

  // Funzione per filtrare le case in base alla città inserita
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
