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
  password: string;
  foto?: string | null; // Aggiunto per gestire l'immagine profilo
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
    if (!text) return '';
    return CryptoJS.AES.encrypt(text, this.SECRET_KEY).toString();
  }

  private decrypt(cipherText: string): string {
    try {
      if (!cipherText) return '';
      const bytes = CryptoJS.AES.decrypt(cipherText, this.SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      return ''; 
    }
  }

  // --- METODI PER IL PROFILO UTENTE ---
  
  async saveUserProfile(user: any) {
    // Recuperiamo l'utente attuale per non perdere i dati non inviati (es. foto o password)
    const existingUser = await this.userProfile.get(1);

    const secureUser: any = {
      // Manteniamo i valori esistenti come base
      ...existingUser,
      
      // Aggiorniamo solo se i nuovi dati sono definiti
      nome: user.nome !== undefined ? user.nome : existingUser?.nome,
      cognome: user.cognome !== undefined ? user.cognome : existingUser?.cognome,
      foto: user.foto !== undefined ? user.foto : existingUser?.foto,
      
      // Email e Password richiedono la criptazione se fornite
      email: user.email ? this.encrypt(user.email) : existingUser?.email,
    };

    if (user.password && user.password.trim() !== '') {
      secureUser.password = this.encrypt(user.password);
    }

    // Salviamo all'ID 1 (profilo locale unico)
    return await this.userProfile.put(secureUser, 1); 
  }

  async getUserProfile() {
    const user = await this.userProfile.get(1);
    if (user) {
      return {
        ...user,
        nome: user.nome || '',
        cognome: user.cognome || '',
        email: this.decrypt(user.email),
        foto: user.foto || null,
        password: '' // Non restituiamo la password decriptata per sicurezza
      };
    }
    return undefined;
  }

  // --- METODO LOGIN ---
  async login(emailInserita: string, passwordInserita: string): Promise<boolean> {
    const user = await this.userProfile.get(1);
    
    if (!user) {
      console.warn("Nessun profilo trovato. Registrati prima.");
      return false;
    }

    const emailDecriptata = this.decrypt(user.email);
    const passwordDecriptata = this.decrypt(user.password);

    if (emailInserita === emailDecriptata && passwordInserita === passwordDecriptata) {
      localStorage.setItem('statoLogin', 'true');
      return true;
    }
    
    return false;
  }

  // --- ALTRI METODI ---
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

  async updateAboutSection(id: string, title: string, body: string) {
    return await this.aboutContent.put({ id, title, body });
  }
}
