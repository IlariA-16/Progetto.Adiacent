import { Injectable, inject } from '@angular/core';
import { HousingLocation } from './housing-location';
import { DbService } from './db.service'; 

@Injectable({
  providedIn: 'root'
})
export class HousingService {
  url = 'http://localhost:3000/locations';
  
  // Iniezione del DbService (Dexie)
  private dbService = inject(DbService);

  private favoriteIds: number[] = [];
  private applicationsCount: number = 0;
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

    // 3. Carica Lista Domande
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

  getFavoritesCount(): number { return this.favoriteIds.length; }
  isFavorite(id: number): boolean { return this.favoriteIds.includes(id); }

  // --- GESTIONE DOMANDE ---
  getApplicationsCount(): number { return this.applicationsCount; }
  getApplicationsList() { return this.applicationsList; }

  submitApplication(firstName: string, lastName: string, email: string, housingName: string, city: string) {
    this.applicationsCount++;
    localStorage.setItem('userName', firstName);

    const newApplication = {
      name: housingName,
      location: city,
      date: new Date().toLocaleDateString(),
      status: 'In Revisione'
    };

    this.applicationsList.push(newApplication);
    localStorage.setItem('applicationsList', JSON.stringify(this.applicationsList));
    console.log('Domanda salvata per:', housingName);
  }

  // --- LOGICA DATI ---
  async getAllHousingLocation(): Promise<HousingLocation[]> {
    try {
      const data = await fetch(this.url);
      return await data.json() ?? [];
    } catch (error) {
      console.warn("Server non raggiungibile, caricamento dati fallito.");
      return [];
    }
  }

  async getHousingLocationById(id: number): Promise<HousingLocation | undefined> {
    try {
      const data = await fetch(`${this.url}/${id}`);
      return await data.json() ?? undefined;
    } catch (error) {
      return undefined;
    }
  }

  // --- NUOVO METODO DI ELIMINAZIONE (SERVER + DEXIE) ---
  async deleteHousingLocation(id: number): Promise<void> {
    // 1. Tenta la cancellazione sul server (json-server)
    try {
      await fetch(`${this.url}/${id}`, {
        method: 'DELETE',
      });
      console.log(`Proprietà ${id} eliminata dal server.`);
    } catch (error) {
      // Se il server è spento o dà errore, scriviamo solo un avviso in console
      console.warn("Impossibile comunicare col server, procedo con la rimozione locale.");
    }

    // 2. Cancella SEMPRE da Dexie (Database del browser)
    // Questo garantisce che la casa sparisca dalla tua vista
    try {
      await this.dbService.deleteLocation(id);
      console.log(`Proprietà ${id} eliminata da Dexie correttamente.`);
    } catch (dbError) {
      console.error("Errore critico durante la rimozione da Dexie:", dbError);
    }
  }
}
