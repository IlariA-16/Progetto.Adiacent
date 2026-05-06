import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';
import { HousingService } from '../housing.service'; 
import { DbService } from '../db.service'; 
import { Observable, map, combineLatest } from 'rxjs'; // Strumenti per la reattività

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
  
  userName: string = 'Ospite';
  
  // Trasformiamo i dati in Observable reattivi
  favoritesCount$: Observable<number>;
  applicationsCount$: Observable<number>;
  appliedHouses$: Observable<any[]>;

  constructor() {
    // 1. Conteggio Preferiti: filtra le case che hanno isFavorite: true
    this.favoritesCount$ = this.housingService.getAllHousingLocation().pipe(
      map(locations => locations.filter(loc => loc.isFavorite).length)
    );

    // 2. Conteggio Candidature
    this.applicationsCount$ = this.dbService.applications$.pipe(
      map(apps => apps.length)
    );

    // 3. Lista Candidature Arricchita (unisce tabelle locations e applications)
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

  get saluto(): string {
    return this.userName.toLowerCase().endsWith('o') ? 'Bentornato' : 'Bentornata';
  }

  ngOnInit() {
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      this.userName = savedName;
    }
  }

  getStatusColor(status: string): string {
    if (status === 'Approvata') return '#2ecc71';
    if (status === 'Rifiutata') return '#e74c3c';
    return '#ff9800'; 
  }
}
