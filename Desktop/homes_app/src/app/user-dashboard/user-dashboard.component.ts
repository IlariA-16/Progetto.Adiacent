import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';
import { HousingService } from '../housing.service'; 
import { DbService } from '../db.service'; 
import { Observable, map, combineLatest } from 'rxjs';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  private housingService = inject(HousingService);
  private dbService = inject(DbService); 
  
  // Observable per la UI
  saluto$!: Observable<string>;
  favoritesCount$!: Observable<number>;
  applicationsCount$!: Observable<number>;
  appliedHouses$!: Observable<any[]>;

  ngOnInit() {
    // 1. LOGICA PER IL SALUTO DINAMICO
    this.saluto$ = this.dbService.applications$.pipe(
      map(apps => {
        if (apps && apps.length > 0) {
          const lastApp = apps[apps.length - 1];
          const nomeCandidato = lastApp.firstName || 'Ospite';
          
          // Logica genere semplificata
          const isFemmina = nomeCandidato.toLowerCase().endsWith('a');
          const prefisso = isFemmina ? 'Bentornata' : 'Bentornato';
          
          return `${prefisso}, ${nomeCandidato}`;
        }
        return 'Bentornato, Ospite';
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

    // 4. LISTA CANDIDATURE ARRICCHITA
    this.appliedHouses$ = combineLatest([
      this.dbService.applications$,
      this.dbService.locations$
    ]).pipe(
      map(([apps, locations]) => {
        return apps.map(app => {
          const house = locations.find(h => h.id === app.locationId);
          return {
            ...app,
            locationName: house ? house.name : 'Alloggio rimosso',
            city: house ? house.city : 'N/A'
          };
        });
      })
    );
  }
}
