import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { liveQuery } from 'dexie';
import { from, Observable } from 'rxjs';
import { HousingLocation } from './housing-location'; 

@Injectable({
  providedIn: 'root'
})
export class DbService extends Dexie {
  locations!: Table<HousingLocation, number>;
  locations$: Observable<HousingLocation[]>;

  constructor() {
    super('HousingDatabase');

    // Definiamo gli indici. 
    // AGGIUNGO 'name' così puoi filtrare velocemente anche per nome se vorrai.
    this.version(1).stores({
      locations: '++id, name, city'
    });

    this.locations = this.table('locations');

    // liveQuery trasforma Dexie in un database "reattivo"
    this.locations$ = from(
      liveQuery(() => this.locations.toArray())
    );
  }

  /**
   * ✅ Popola il DB dal tuo array di dati (che caricherai dal JSON)
   * Usiamo bulkAdd per performance migliori con molti dati.
   */
  async seedDatabase(data: HousingLocation[]): Promise<void> {
    const count = await this.locations.count();
    if (count === 0) {
      await this.locations.bulkAdd(data);
      console.log('Database Dexie popolato con i dati iniziali!');
    }
  }

  /**
   * ✅ Salva una nuova casa nel DB
   */
  async addLocation(location: HousingLocation) {
    // Rimuoviamo l'id se è nullo o 0, così Dexie lo autoincrementa correttamente
    const { id, ...locationWithoutId } = location; 
    return await this.locations.add(locationWithoutId as HousingLocation);
  }

  /**
   * ✅ Elimina una casa tramite ID
   */
  async deleteLocation(id: number): Promise<void> {
    await this.locations.delete(id);
  }

  /**
   * ✅ Svuota tutto (utile per resettare il progetto)
   */
  async clearDatabase(): Promise<void> {
    await this.locations.clear();
  }
}
