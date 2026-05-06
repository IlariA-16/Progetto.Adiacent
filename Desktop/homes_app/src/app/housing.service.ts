import { Injectable, inject } from '@angular/core';
import { HousingLocation } from './housing-location';
import { DbService } from './db.service'; 
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HousingService {
  private url = 'http://localhost:3000/locations';
  
  // Iniezione del DbService (Dexie)
  private dbService = inject(DbService);

  constructor() {
    // Inizializza il database caricando i dati dal server all'avvio
    this.initDatabase();
  }

  // --- SINCRONIZZAZIONE ---
  private async initDatabase() {
    try {
      const response = await fetch(this.url);
      const data: HousingLocation[] = await response.json();
      if (data) {
        await this.dbService.seedDatabase(data);
        console.log('Dexie sincronizzato con i dati del server');
      }
    } catch (error) {
      console.warn("Server non raggiungibile, utilizzo dati locali Dexie.");
    }
  }

  // --- GESTIONE DATI (REATTIVA) ---
  
  // Ritorna l'Observable del DbService: l'interfaccia si aggiornerà automaticamente
  getAllHousingLocation() {
    return this.dbService.locations$;
  }

  async getHousingLocationById(id: number): Promise<HousingLocation | undefined> {
    // Cerchiamo prima nel database locale Dexie
    return await this.dbService.locations.get(id);
  }

  // --- GESTIONE PREFERITI ---
  // Nota: Assicurati di aver aggiunto 'isFavorite?: boolean' nel file housing-location.ts
  async toggleFavorite(location: HousingLocation) {
    if (location.id !== undefined) {
      const currentStatus = location.isFavorite || false;
      await this.dbService.locations.update(location.id, { isFavorite: !currentStatus });
    }
  }

  // --- GESTIONE DOMANDE (Ora su Dexie!) ---
  
  getApplicationsList() {
    return this.dbService.applications$; // Ritorna Observable reattivo
  }

  async submitApplication(firstName: string, lastName: string, email: string, housingName: string, city: string, locationId: number) {
    const newApplication = {
      locationId,
      applicantName: `${firstName} ${lastName}`,
      email: email,
      housingName: housingName,
      city: city,
      date: new Date().toLocaleDateString(),
      status: 'In Revisione'
    };

    try {
      await this.dbService.applications.add(newApplication);
      console.log('Domanda salvata in Dexie per:', housingName);
    } catch (error) {
      console.error('Errore nel salvataggio della domanda:', error);
    }
  }

  // --- ELIMINAZIONE (SERVER + DEXIE) ---
  async deleteHousingLocation(id: number): Promise<void> {
    // 1. Tenta la cancellazione sul server
    try {
      await fetch(`${this.url}/${id}`, { method: 'DELETE' });
      console.log(`Proprietà ${id} eliminata dal server.`);
    } catch (error) {
      console.warn("Server offline, eliminazione solo locale su Dexie.");
    }

    // 2. Cancella da Dexie
    await this.dbService.deleteLocation(id);
  }
}
