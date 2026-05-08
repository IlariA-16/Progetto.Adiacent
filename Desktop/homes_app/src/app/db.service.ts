import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { liveQuery } from 'dexie';
import { from, Observable } from 'rxjs';
import { HousingLocation } from './housing-location'; 
import * as CryptoJS from 'crypto-js';

export interface UserProfile {
  id?: number;
  nome: string;
  cognome: string;
  email: string;
  password: string
}

@Injectable({
  providedIn: 'root'
})
export class DbService extends Dexie {
  private readonly SECRET_KEY = 'chiave-segreta-progetto-adiacent';

  locations!: Table<HousingLocation, number>;
  applications!: Table<any, number>;
  aboutContent!: Table<any, string>; 
  userProfile!: Table<UserProfile, number>; 
  
  locations$: Observable<HousingLocation[]>;
  applications$: Observable<any[]>; 
  aboutContent$: Observable<any[]>;
  userProfile$: Observable<UserProfile[]>;

  constructor() {
    super('HousingDatabase');

    this.version(4).stores({
      locations: '++id, name, city, isFavorite',
      applications: '++id, locationId, applicantName, status',
      aboutContent: 'id',
      userProfile: '++id, email' 
    });

    this.locations = this.table('locations');
    this.applications = this.table('applications');
    this.aboutContent = this.table('aboutContent');
    this.userProfile = this.table('userProfile'); 

    this.locations$ = from(liveQuery(() => this.locations.toArray()));
    this.applications$ = from(liveQuery(() => this.applications.toArray()));
    this.aboutContent$ = from(liveQuery(() => this.aboutContent.toArray()));
    this.userProfile$ = from(liveQuery(() => this.userProfile.toArray()));
  }

  // --- FUNZIONI DI SICUREZZA ---
  private encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, this.SECRET_KEY).toString();
  }

  private decrypt(cipherText: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(cipherText, this.SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      return ''; // Ritorna stringa vuota se la decriptazione fallisce
    }
  }

  // --- METODI PER IL PROFILO UTENTE ---
  async saveUserProfile(user: UserProfile) {
    const secureUser: UserProfile = {
      ...user,
      email: this.encrypt(user.email),
      password: this.encrypt(user.password)
    };
    return await this.userProfile.put(secureUser, 1); 
  }

  async getUserProfile() {
    const user = await this.userProfile.get(1);
    if (user) {
      return {
        ...user,
        email: this.decrypt(user.email),
        password: '' // Non mostriamo la password nel form per sicurezza
      };
    }
    return undefined;
  }

  // --- NUOVO METODO LOGIN ---
  async login(emailInserita: string, passwordInserita: string): Promise<boolean> {
    const user = await this.userProfile.get(1);
    if (!user) return false;

    const emailDecriptata = this.decrypt(user.email);
    const passwordDecriptata = this.decrypt(user.password);

    if (emailInserita === emailDecriptata && passwordInserita === passwordDecriptata) {
      localStorage.setItem('statoLogin', 'true');
      return true;
    }
    return false;
  }

  // --- METODI ALTRI (LOCATIONS / APPLICATIONS) ---
  async seedDatabase(data: HousingLocation[]): Promise<void> {
    const count = await this.locations.count();
    if (count === 0) await this.locations.bulkPut(data);
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

  async updateAboutSection(id: string, title: string, body: string) {
    return await this.aboutContent.put({ id, title, body });
  }
}
