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
  applications!: Table<any, number>;
  
  // Observable reattivi
  locations$: Observable<HousingLocation[]>;
  applications$: Observable<any[]>; 

  constructor() {
    super('HousingDatabase');

    this.version(2).stores({
      locations: '++id, name, city',
      applications: '++id, locationId, applicantName, status'
    });

    this.locations = this.table('locations');
    this.applications = this.table('applications');

    // Trasformiamo le tabelle in flussi di dati reattivi
    this.locations$ = from(liveQuery(() => this.locations.toArray()));
    this.applications$ = from(liveQuery(() => this.applications.toArray()));
  }

  async seedDatabase(data: HousingLocation[]): Promise<void> {
    const count = await this.locations.count();
    if (count === 0) {
      await this.locations.bulkAdd(data);
    }
  }

  async addLocation(location: HousingLocation) {
    const { id, ...locationWithoutId } = location; 
    return await this.locations.add(locationWithoutId as HousingLocation);
  }

  async deleteLocation(id: number): Promise<void> {
    await this.locations.delete(id);
  }

  async clearDatabase(): Promise<void> {
    await this.locations.clear();
  }

  async getApplicationsByLocation(locationId: number) {
    return await this.applications.where('locationId').equals(locationId).toArray();
  }
}
