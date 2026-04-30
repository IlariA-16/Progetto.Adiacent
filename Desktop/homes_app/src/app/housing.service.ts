import { Injectable } from '@angular/core';
import { HousingLocation } from './housing-location';

@Injectable({
  providedIn: 'root'
})
export class HousingService {
  url = 'http://localhost:3000/locations';
  
  private favoriteIds: number[] = [];
  private applicationsCount: number = 0;
  
  // Array per memorizzare i dettagli delle domande (per la tabella)
  private applicationsList: any[] = [];

  constructor() {
    // 1. Carica Preferiti
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      this.favoriteIds = JSON.parse(savedFavorites);
    }

    // 2. Carica Conteggio Domande
    const savedCount = localStorage.getItem('applicationsCount');
    if (savedCount) {
      this.applicationsCount = parseInt(savedCount, 10);
    }

    // 3. Carica Lista Domande (per la tabella)
    const savedList = localStorage.getItem('applicationsList');
    if (savedList) {
      this.applicationsList = JSON.parse(savedList);
    }
  }

  // --- GESTIONE PREFERITI ---
  toggleFavorite(id: number) {
    const index = this.favoriteIds.indexOf(id);
    if (index === -1) {
      this.favoriteIds.push(id);
    } else {
      this.favoriteIds.splice(index, 1);
    }
    localStorage.setItem('favorites', JSON.stringify(this.favoriteIds));
  }

  getFavoritesCount(): number {
    return this.favoriteIds.length;
  }

  isFavorite(id: number): boolean {
    return this.favoriteIds.includes(id);
  }

  // --- GESTIONE DOMANDE ---
  getApplicationsCount(): number {
    return this.applicationsCount;
  }

  // Restituisce la lista per popolare la tabella nella Dashboard
  getApplicationsList() {
    return this.applicationsList;
  }

  submitApplication(firstName: string, lastName: string, email: string, housingName: string, city: string) {
    // Incrementa e salva il conteggio
    this.applicationsCount++;
    localStorage.setItem('userName', firstName);

    // Crea un oggetto con i dettagli della domanda
    const newApplication = {
      name: housingName,
      location: city,
      date: new Date().toLocaleDateString(),
      status: 'In Revisione'
    };

    // Aggiunge alla lista e salva
    this.applicationsList.push(newApplication);
    localStorage.setItem('applicationsList', JSON.stringify(this.applicationsList));

    console.log('Domanda salvata per:', housingName);
  }

  // --- LOGICA DATI ---
  async getAllHousingLocation(): Promise<HousingLocation[]> {
    const data = await fetch(this.url);
    return await data.json() ?? [];
  }

  async getHousingLocationById(id: number): Promise<HousingLocation | undefined> {
    const data = await fetch(`${this.url}/${id}`);
    return await data.json() ?? undefined;
  }
}
