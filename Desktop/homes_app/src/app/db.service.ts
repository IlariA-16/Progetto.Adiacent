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

    this.version(1).stores({
      locations: '++id, city'
    });

    this.locations = this.table('locations');

    // ✅ conversione corretta in Observable Angular-friendly
    this.locations$ = from(
      liveQuery(() => this.locations.toArray())
    );
  }

  // ✅ Popola il DB solo se vuoto
  async seedDatabase(data: HousingLocation[]): Promise<void> {
    const count = await this.locations.count();

    if (count === 0) {
      await this.locations.bulkAdd(data);
      console.log('Database Dexie popolato!');
    }
  }
  async addLocation(location: HousingLocation) {
  return await this.locations.add(location);
}

  // ✅ Cancella tutto (utile per test)
  async clearDatabase(): Promise<void> {
    await this.locations.clear();
    
  }
    async deleteLocation(id: number): Promise<void> {
    await this.locations.delete(id);
  }
}