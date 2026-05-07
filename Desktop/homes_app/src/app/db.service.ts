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
  
  locations$: Observable<HousingLocation[]>;
  applications$: Observable<any[]>; 

  constructor() {
    super('HousingDatabase');

    this.version(2).stores({
      locations: '++id, name, city, state',
      applications: '++id, firstName, lastName, email, status, locationId' 
    });

    this.locations = this.table('locations');
    this.applications = this.table('applications');

    this.locations$ = from(liveQuery(() => this.locations.toArray()));
    this.applications$ = from(liveQuery(() => this.applications.toArray()));
  }

  async seedDatabase(data: HousingLocation[]): Promise<void> {
    const count = await this.locations.count();
    if (count === 0) {
      await this.locations.bulkAdd(data);
      console.log('Database Dexie popolato con successo!');
    }
  }

  async addApplication(application: any): Promise<number> {
    return await this.applications.add(application);
  }

  async addLocation(location: HousingLocation): Promise<number> {
    return await this.locations.add(location);
  }

  async clearDatabase(): Promise<void> {
    await this.locations.clear();
    await this.applications.clear();
    console.log('Database svuotato.');
  }

  async getLocationById(id: number): Promise<HousingLocation | undefined> {
    return await this.locations.get(id);
  }

  // Aggiorna lo stato (es. da 'In Revisione' a 'Rifiutata')
  async updateApplicationStatus(id: number, newStatus: string) {
    await this.applications.update(id, { status: newStatus });
  }

  // ✅ AGGIUNTO: Cancella definitivamente una candidatura
  async deleteApplication(id: number) {
    await this.applications.delete(id);
  }
}
