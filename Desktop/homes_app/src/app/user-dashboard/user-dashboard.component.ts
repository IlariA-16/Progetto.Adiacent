import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';
import { HousingService } from '../housing.service'; 
import { DbService } from '../db.service'; 
import { Observable, map, combineLatest, startWith } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, TranslateModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  private housingService = inject(HousingService);
  private dbService = inject(DbService);
  private translate = inject(TranslateService); 
  
  saluto$!: Observable<string>;
  favoritesCount$!: Observable<number>;
  applicationsCount$!: Observable<number>;
  appliedHouses$!: Observable<any[]>;

  ngOnInit() {
    // 1. SALUTO DINAMICO (Reattivo al cambio lingua)
    this.saluto$ = combineLatest([
      this.dbService.applications$,
      this.translate.onLangChange.pipe(startWith({ lang: this.translate.currentLang }))
    ]).pipe(
      map(([apps]) => {
        if (apps && apps.length > 0) {
          const lastApp = apps[apps.length - 1];
          const nome = lastApp.firstName || this.translate.instant('DASHBOARD.GUEST');
          const isFemmina = nome.toLowerCase().endsWith('a');
          
          const prefisso = isFemmina 
            ? this.translate.instant('DASHBOARD.WELCOME_F') 
            : this.translate.instant('DASHBOARD.WELCOME_M');
          
          return `${prefisso}, ${nome}`;
        }
        return `${this.translate.instant('DASHBOARD.WELCOME_M')}, ${this.translate.instant('DASHBOARD.GUEST')}`;
      })
    );

    // 2. CONTEGGIO PREFERITI
    this.favoritesCount$ = this.housingService.getAllHousingLocation().pipe(
      map(locations => locations.filter(loc => loc.isFavorite).length)
    );

    // 3. CONTEGGIO CANDIDATURE
    this.applicationsCount$ = this.dbService.applications$.pipe(
      map(apps => apps.length)
    );

    // 4. LISTA CANDIDATURE (con testi tradotti)
    this.appliedHouses$ = combineLatest([
      this.dbService.applications$,
      this.dbService.locations$,
      this.translate.onLangChange.pipe(startWith(null))
    ]).pipe(
      map(([apps, locations]) => {
        return apps.map(app => {
          const house = locations.find(h => h.id === app.locationId);
          return {
            ...app,
            locationName: house ? house.name : this.translate.instant('DASHBOARD.REMOVED_HOUSE'),
            city: house ? house.city : 'N/A'
          };
        });
      })
    );
  }
}
