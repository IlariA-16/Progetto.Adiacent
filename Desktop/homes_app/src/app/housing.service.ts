import { Injectable } from '@angular/core';
import { HousingLocation } from './housing-location';

@Injectable({
  providedIn: 'root'
})
export class HousingService {
  readonly url = 'http://localhost:3000/locations';

  // Inizializza l'array leggendo dal localStorage all'avvio
  private favoriteIds: number[] = JSON.parse(localStorage.getItem('favorites') || '[]');

  constructor() { }

  async getAllHousingLocation(): Promise<HousingLocation[]> {
    const data = await fetch(this.url);
    return (await data.json()) ?? [];
  }

  async getHousingLocationById(id: number): Promise<HousingLocation | undefined> {
    const data = await fetch(`${this.url}/${id}`);
    return (await data.json()) ?? undefined;
  }

  submitApplication(firstName: string, lastName: string, email: string) {
    console.log('Application received:', { firstName, lastName, email });
  }

  // --- GESTIONE PREFERITI ---

  toggleFavorite(id: number) {
    const index = this.favoriteIds.indexOf(id);
    if (index === -1) {
      this.favoriteIds.push(id);
    } else {
      this.favoriteIds.splice(index, 1);
    }
    // Salva l'array aggiornato nel browser
    localStorage.setItem('favorites', JSON.stringify(this.favoriteIds));
  }

  getFavoritesCount(): number {
    return this.favoriteIds.length;
  }

  isFavorite(id: number): boolean {
    return this.favoriteIds.includes(id);
  }
}


