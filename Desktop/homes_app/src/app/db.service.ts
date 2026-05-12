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
  role: 'admin' | 'editor' | 'user' | string;
  foto: string | null;
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

  /**
   * SALVATAGGIO UTENTE
   * Se user.id è presente -> AGGIORNA l'utente esistente.
   * Se user.id NON è presente -> Controlla duplicati e AGGIUNGE un nuovo utente.
   */
  async saveUserProfile(user: any) {
    if (user.id) {
      // MODIFICA PROFILO ESISTENTE
      const updates: any = {};
      if (user.nome !== undefined) updates.nome = user.nome;
      if (user.cognome !== undefined) updates.cognome = user.cognome;
      if (user.foto !== undefined) updates.foto = user.foto;
      if (user.role !== undefined) updates.role = user.role;
      if (user.email) updates.email = this.encrypt(user.email);
      if (user.password) updates.password = this.encrypt(user.password);
      
      return await this.userProfile.update(user.id, updates);
    } else {
      // NUOVA REGISTRAZIONE: Controllo se l'email esiste già
      const allUsers = await this.userProfile.toArray();
      const isDuplicate = allUsers.some(u => this.decrypt(u.email) === user.email);

      if (isDuplicate) {
        // Se l'email esiste già, lanciamo un errore che blocca l'operazione
        throw new Error("Email già registrata. Usa un altro indirizzo.");
      }

      const newUser: UserProfile = {
        nome: user.nome || '',
        cognome: user.cognome || '',
        email: this.encrypt(user.email || ''),
        password: this.encrypt(user.password || ''),
        role: user.role || 'user',
        foto: user.foto || null
      };
      return await this.userProfile.add(newUser);
    }
  }

  /**
   * RECUPERO PROFILO
   * Prende l'utente loggato in base all'ID salvato nella sessione.
   */
  async getUserProfile() {
    const loggedUserId = localStorage.getItem('userId');
    
    if (loggedUserId) {
      const user = await this.userProfile.get(Number(loggedUserId));
      if (user) {
        return {
          ...user,
          email: this.decrypt(user.email || ''),
          role: user.role || 'user',
          foto: user.foto || null,
          password: '' 
        };
      }
    }
    return await this.userProfile.toCollection().first();
  }

  /**
   * LOGIN
   * Cerca l'utente tra tutti quelli registrati confrontando le email decriptate.
   */
  async login(emailInserita: string, passwordInserita: string): Promise<any | null> {
    const users = await this.userProfile.toArray();
    for (const user of users) {
      const emailDecriptata = this.decrypt(user.email || '');
      const passwordDecriptata = this.decrypt(user.password || '');
      
      if (emailInserita === emailDecriptata && passwordInserita === passwordDecriptata) {
        if (user.id) localStorage.setItem('userId', user.id.toString());
        return { ...user, email: emailDecriptata, role: user.role || 'user' };
      }
    }
    return null;
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
