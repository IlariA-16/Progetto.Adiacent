import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HousingLocationComponent } from '../housing-location/housing-location.component';
import { HousingLocation } from '../housing-location';
import { HousingService } from '../housing.service';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,HousingLocationComponent,RouterModule],
  template: `
    <section>
      <form>
        <input type="text" placeholder="Filtra per città" #filter>
        <button class="primary" type="button" (click)="filterResults(filter.value)">Cerca</button>
      </form>
    </section>
    <section class="results">
      <app-housing-location *ngFor="let housingLocation of filteredLocationList" [housingLocation]="housingLocation"></app-housing-location>
    </section>
  `,
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  housingLocationList: HousingLocation[] = [];
  housingService :HousingService = inject(HousingService);
  filteredLocationList:HousingLocation [] = [];

  constructor(){
    this.housingService.getAllHousingLocation().then((housingLocationList : HousingLocation[]) => {
      this.housingLocationList = housingLocationList;
      this.filteredLocationList = housingLocationList; // Resetta il filtro assegnando alla lista visualizzata l'intero array dei dati originali
    });
  }

  filterResults (text: string) {
     //Se l'input è vuoto, resetta la lista mostrando tutti gli elementi originali
    if(!text) this.filteredLocationList = this.housingLocationList;
    this.filteredLocationList = this.housingLocationList.filter(housingLocation => housingLocation?.city.toLowerCase().includes(text.toLocaleLowerCase()));
    // Filtra la lista originale in base alla città
    // Trasforma tutto in minuscolo per rendere la ricerca "case-insensitive" (non distingue tra maiuscole e minuscole)

  }
}
