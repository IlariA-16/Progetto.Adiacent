import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { liveQuery } from 'dexie';
import { from, Observable } from 'rxjs';
import { HousingLocation } from './housing-location';

@Injectable({
  providedIn: 'root'
})
export class DbService extends Dexie {
  // Definiamo la tabella sincronizzata con l'interfaccia HousingLocation
  locations!: Table<HousingLocation, number>;
  
  // Observable per i componenti Angular
  locations$: Observable<HousingLocation[]>;

  constructor() {
    super('HousingDatabase');

    // Definiamo lo schema del database
    // ++id significa auto-incrementale
    this.version(1).stores({
      locations: '++id, name, city, state' // Indici per ricerche più veloci'
    });

    this.locations = this.table('locations');

    // Trasformiamo la liveQuery di Dexie in un Observable di RxJS
    this.locations$ = from(
      liveQuery(() => this.locations.toArray())
    );
  }

  /**
   * Popola il database Dexie solo se è attualmente vuoto
   * @param data Array di HousingLocation dal file JSON o sorgente dati
   */
  async seedDatabase(data: HousingLocation[]): Promise<void> {
    const count = await this.locations.count();
    if (count === 0) {
      await this.locations.bulkAdd(data);
      console.log('Database Dexie popolato con successo!');
    }
  }

  /**
   * Aggiunge una singola locazione al database
   */
  async addLocation(location: HousingLocation): Promise<number> {
    return await this.locations.add(location);
  }

  /**
   * Cancella tutto il contenuto della tabella (utile per reset/debug)
   */
  async clearDatabase(): Promise<void> {
    await this.locations.clear();
    console.log('Database svuotato.');
  }

  /**
   * Ottiene una singola locazione tramite ID
   */
  async getLocationById(id: number): Promise<HousingLocation | undefined> {
    return await this.locations.get(id);
  }
}
