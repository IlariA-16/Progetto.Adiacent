import { Injectable } from '@angular/core';
import { HousingLocation } from './housing-location';

@Injectable({
  providedIn: 'root'
})
export class HousingService {
  // URL base per le chiamate API (se necessario)
  readonly url = 'http://localhost:3000/locations';

  // Carica i preferiti dal localStorage all'avvio
  private favoriteIds: number[] = JSON.parse(localStorage.getItem('favorites') || '[]');

  constructor() { }

  /**
   * Restituisce la lista degli ID preferiti
   * Usato da FavoritesComponent
   */
  getFavorites(): number[] {
    return this.favoriteIds;
  }

  /**
   * Recupera tutte le locazioni dal server (Metodo Legacy)
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
   * Recupera una singola locazione tramite ID (Metodo richiesto dai componenti Details)
   * Risolve l'errore TS2551
   */
  async getHousingLocationById(id: number): Promise<HousingLocation | undefined> {
    try {
      const data = await fetch(`${this.url}/${id}`);
      return (await data.json()) ?? undefined;
    } catch (error) {
      console.warn(`Impossibile trovare la locazione con ID ${id} sul server, potrebbe essere un nuovo inserimento locale.`);
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
    // Sincronizza con il localStorage
    localStorage.setItem('favorites', JSON.stringify(this.favoriteIds));
  }

  /**
   * Verifica se una locazione è tra i preferiti
   */
  isFavorite(id: number): boolean {
    return this.favoriteIds.includes(id);
  }

  /**
   * Logga i dati del modulo di contatto
   */
  submitApplication(firstName: string, lastName: string, email: string) {
    console.log('Candidatura ricevuta:', { firstName, lastName, email });
  }
}
