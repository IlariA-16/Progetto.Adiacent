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
  aboutContent!: Table<any, string>; // Tabella per i testi "Chi Siamo"
  
  // Observable reattivi
  locations$: Observable<HousingLocation[]>;
  applications$: Observable<any[]>; 
  aboutContent$: Observable<any[]>; // Flusso dati per la pagina About

  constructor() {
    super('HousingDatabase');

    // Versione 3: necessaria per aggiungere 'aboutContent' e l'indice 'isFavorite'
    this.version(3).stores({
      locations: '++id, name, city, isFavorite',
      applications: '++id, locationId, applicantName, status',
      aboutContent: 'id' 
    });

    this.locations = this.table('locations');
    this.applications = this.table('applications');
    this.aboutContent = this.table('aboutContent');

    // Trasformiamo le tabelle in flussi di dati reattivi con liveQuery
    this.locations$ = from(liveQuery(() => this.locations.toArray()));
    this.applications$ = from(liveQuery(() => this.applications.toArray()));
    this.aboutContent$ = from(liveQuery(() => this.aboutContent.toArray()));
  }

  // --- METODI PER LE PROPRIETÀ (LOCATIONS) ---
  async seedDatabase(data: HousingLocation[]): Promise<void> {
    const count = await this.locations.count();
    if (count === 0) {
      await this.locations.bulkPut(data);
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

  // --- METODI PER LE CANDIDATURE (APPLICATIONS) ---
  async getApplicationsByLocation(locationId: number) {
    return await this.applications.where('locationId').equals(locationId).toArray();
  }

  // --- METODI PER LA PAGINA ABOUT ---
  async updateAboutSection(id: string, title: string, body: string) {
    return await this.aboutContent.put({ id, title, body });
  }
}
