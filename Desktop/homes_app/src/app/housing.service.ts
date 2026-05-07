import { Injectable, inject } from '@angular/core';
import { HousingLocation } from './housing-location';
import { DbService } from './db.service'; // ✅ Importiamo il DbService

@Injectable({
  providedIn: 'root'
})
export class HousingService {
  // URL base per le chiamate API
  readonly url = 'http://localhost:3000/locations';

  // ✅ Iniezione del database
  private dbService = inject(DbService);

  // Carica i preferiti dal localStorage all'avvio
  private favoriteIds: number[] = JSON.parse(localStorage.getItem('favorites') || '[]');

  constructor() { }

  /**
   * Restituisce la lista degli ID preferiti
   */
  getFavorites(): number[] {
    return this.favoriteIds;
  }

  /**
   * Restituisce il numero totale dei preferiti
   */
  getFavoritesCount(): number {
    return this.favoriteIds.length;
  }

  /**
   * Recupera tutte le locazioni dal server
   */
  async getAllHousingLocation(): Promise<HousingLocation[]> {
    try {
      const data = await fetch(this.url);
      return (await data.json()) ?? [];
    } catch (error) {
      console.error("Errore nel recupero delle locazioni:", error);
      return [];
    }
  }

  /**
   * Recupera una singola locazione tramite ID
   */
  async getHousingLocationById(id: number): Promise<HousingLocation | undefined> {
    try {
      const data = await fetch(`${this.url}/${id}`);
      return (await data.json()) ?? undefined;
    } catch (error) {
      console.warn(`Impossibile trovare la locazione con ID ${id} sul server.`);
      return undefined;
    }
  }

  /**
   * Gestisce l'aggiunta/rimozione di un ID dai preferiti
   */
  toggleFavorite(id: number) {
    const index = this.favoriteIds.indexOf(id);
    if (index === -1) {
      this.favoriteIds.push(id);
    } else {
      this.favoriteIds.splice(index, 1);
    }
    localStorage.setItem('favorites', JSON.stringify(this.favoriteIds));
  }

  /**
   * Verifica se una locazione è tra i preferiti
   */
  isFavorite(id: number): boolean {
    return this.favoriteIds.includes(id);
  }

  /**
   * ✅ METODO AGGIORNATO: Salva la candidatura su Dexie
   */
  submitApplication(firstName: string, lastName: string, email: string, locationId: number) {
    const nuovaCandidatura = {
      locationId: locationId,
      firstName: firstName,
      lastName: lastName,
      email: email,
      status: 'In Revisione', // Stato predefinito
      date: new Date().toLocaleDateString('it-IT') // Data odierna
    };

    // Salvataggio effettivo nel database
    this.dbService.addApplication(nuovaCandidatura).then(() => {
      console.log('Candidatura salvata con successo nel database!');
    }).catch(err => {
      console.error('Errore durante il salvataggio della candidatura:', err);
    });
  }
}
