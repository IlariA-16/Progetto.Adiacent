import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HousingLocationComponent } from '../housing-location/housing-location.component';
import { RouterModule } from '@angular/router';
import { DbService } from '../db.service';
import { HousingLocation } from '../housing-location'; 
import { Observable, map } from 'rxjs';
import data from '../../../db.json';

// IMPORTA IL MODULO DI TRADUZIONE
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HousingLocationComponent, RouterModule, TranslateModule],
  template: `
    <div class="main-layout">
      <aside class="sidebar">
          <form (submit)="$event.preventDefault()">
            <section class="search-box">
              <h3>{{ 'HOME.SEARCH_TITLE' | translate }}</h3>
              <input type="text" [placeholder]="'HOME.PLACEHOLDER' | translate" #filter id="city-filter" name="city-filter">
              
              <div class="price-range-container">
                <label for="priceRange">{{ 'HOME.MAX_PRICE' | translate }}: <b>€{{maxPriceValue}}</b></label>
                <input type="range" #maxPrice id="priceRange" min="0" max="5000" step="100" [value]="maxPriceValue"
                (input)="maxPriceValue = +maxPrice.value; applyFilters(filter.value, wifi.checked, laundry.checked, '0', maxPrice.value)">
              </div>

              <div class="sort-box">
                <label for="sortSelect">{{ 'HOME.SORT_BY' | translate }}:</label>
                <select id="sortSelect" #sortOption (change)="sortResults(sortOption.value)">
                  <option value="none">{{ 'HOME.SELECT' | translate }}</option>
                  <option value="cheap">{{ 'HOME.CHEAP' | translate }}</option>
                  <option value="expensive">{{ 'HOME.EXPENSIVE' | translate }}</option>
                  <option value="name">{{ 'HOME.NAME' | translate }}</option>
                </select>
              </div>
            </section>

            <section class="filters-box">
              <h3>{{ 'HOME.FILTER_SERVICES' | translate }}</h3>
              <div class="filter-group">
                <label>
                  <input type="checkbox" #wifi (change)="applyFilters(filter.value, wifi.checked, laundry.checked, '0', maxPrice.value)"> 
                  <span>📶 {{ 'HOME.WIFI' | translate }}</span>
                </label>
                <label>
                  <input type="checkbox" #laundry (change)="applyFilters(filter.value, wifi.checked, laundry.checked, '0', maxPrice.value)"> 
                  <span>🧺 {{ 'HOME.LAUNDRY' | translate }}</span>
                </label>
              </div>
              
              <button class="primary" type="button" (click)="applyFilters(filter.value, wifi.checked, laundry.checked, '0', maxPrice.value)">
                {{ 'HOME.SEARCH_BTN' | translate }}
              </button>
              
              <button class="btn-clear" (click)="filter.value=''; maxPrice.value='5000'; maxPriceValue=5000; wifi.checked=false; laundry.checked=false; applyFilters('', false, false, '0', '5000')">
                {{ 'HOME.CLEAR_FILTERS' | translate }}
              </button>
            </section>
          </form>
      </aside>

      <section class="results-container">
        <div class="results-grid">
          <div *ngFor="let housingLocation of (filteredLocationList$ | async)">
            <app-housing-location 
              [housingLocation]="housingLocation"
              (apriCandidatureRichiesto)="openApplicationsModal($event)">
            </app-housing-location>
          </div>
        </div>
      </section>
    </div>

    <div class="modal-overlay" *ngIf="showModal && userRole === 'admin'" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h3>{{ 'HOME.MODAL_TITLE' | translate }}: {{ selectedLocation?.name }}</h3>
        <hr>
        
        <div *ngIf="currentApplications.length > 0; else noApps">
          <table class="app-table">
            <thead>
              <tr>
                <th>{{ 'HOME.CANDIDATE' | translate }}</th>
                <th>{{ 'HOME.DATE' | translate }}</th>
                <th>{{ 'HOME.STATUS' | translate }}</th>
                <th>{{ 'HOME.ACTIONS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let app of currentApplications">
                <td>{{ app.applicantName }}</td>
                <td>{{ app.date }}</td>
                <td [style.color]="getStatusColor(app.status)" style="font-weight: bold;">
                  {{ app.status }}
                </td>
                <td class="action-cell">
                  <button *ngIf="app.status !== 'Approvata'" (click)="updateStatus(app.id, 'Approvata')" class="btn-icon approve">✔</button>
                  <button *ngIf="app.status !== 'Rifiutata'" (click)="updateStatus(app.id, 'Rifiutata')" class="btn-icon reject">✖</button>
                  <button (click)="deleteApplication(app.id)" class="btn-icon delete">🗑</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template #noApps>
          <div class="empty-state">
            <p>{{ 'HOME.NO_APPS' | translate }}</p>
          </div>
        </ng-template>

        <button class="primary close-btn" (click)="closeModal()">{{ 'HOME.CLOSE' | translate }}</button>
      </div>
    </div>
  `,
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  housingLocationList$: Observable<HousingLocation[]>;
  filteredLocationList$: Observable<HousingLocation[]>;
  
  showModal = false;
  selectedLocation: HousingLocation | null = null;
  currentApplications: any[] = [];
  maxPriceValue = 5000;
  userRole: string | null = localStorage.getItem('userRole');

  private dbService = inject(DbService);
  private translate = inject(TranslateService);

  constructor() {
    this.housingLocationList$ = this.dbService.locations$;
    this.filteredLocationList$ = this.housingLocationList$;
  }

  async ngOnInit() {
    if (data && data.locations) {
      await this.dbService.seedDatabase(
        data.locations.map((location: any) => ({
          ...location,
          photos: location.photos ?? []
        }))
      );
    }
  }

  closeModal() {
    this.showModal = false;
    this.selectedLocation = null;
  }

  async openApplicationsModal(location: HousingLocation) {
    if (this.userRole !== 'admin' || !location.id) return;
    
    this.selectedLocation = location;
    this.showModal = true;
    
    try {
      this.currentApplications = await this.dbService.table('applications')
        .where('locationId').equals(location.id).toArray();
    } catch (error) {
      this.currentApplications = [];
    }
  }

  async updateStatus(id: number, newStatus: string) {
    await this.dbService.table('applications').update(id, { status: newStatus });
    if (this.selectedLocation) this.openApplicationsModal(this.selectedLocation);
  }

  async deleteApplication(id: number) {
    const confirmMsg = this.translate.instant('HOME.CONFIRM_DELETE');
    if (confirm(confirmMsg)) {
      await this.dbService.table('applications').delete(id);
      if (this.selectedLocation) this.openApplicationsModal(this.selectedLocation);
    }
  }

  getStatusColor(status: string): string {
    if (status === 'Approvata' || status === 'Approved') return 'green';
    if (status === 'Rifiutata' || status === 'Rejected') return 'red';
    return 'orange';
  }

  applyFilters(city: string, hasWifi: boolean, hasLaundry: boolean, minP: string, maxP: string) {
    this.filteredLocationList$ = this.housingLocationList$.pipe(
      map(locations => locations.filter(loc => {
        const matchCity = loc.city.toLowerCase().includes(city.toLowerCase()) || 
                          loc.name.toLowerCase().includes(city.toLowerCase());
        const matchWifi = hasWifi ? loc.wifi === true : true;
        const matchLaundry = hasLaundry ? loc.laundry === true : true;
        const matchPrice = loc.price >= Number(minP) && loc.price <= Number(maxP);
        return matchCity && matchWifi && matchLaundry && matchPrice;
      }))
    );
  }

  sortResults(option: string) {
    this.filteredLocationList$ = this.filteredLocationList$.pipe(
      map(locations => {
        const sorted = [...locations];
        if (option === 'cheap') sorted.sort((a, b) => a.price - b.price);
        if (option === 'expensive') sorted.sort((a, b) => b.price - a.price);
        if (option === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
        return sorted;
      })
    );
  }
}