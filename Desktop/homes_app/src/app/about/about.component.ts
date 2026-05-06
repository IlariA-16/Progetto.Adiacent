import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DbService } from '../db.service'; // Controlla che il percorso sia corretto
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  private dbService = inject(DbService);

  // Creiamo un Observable che organizza le sezioni della pagina
  aboutData$: Observable<any> = this.dbService.table('aboutContent').toArray().then(items => {
    return {
      missione: items.find(i => i.id === 'missione'),
      filosofia: items.find(i => i.id === 'filosofia'),
      valori: items.filter(i => ['etica', 'sartorialita', 'presenza'].includes(i.id))
    };
  }) as unknown as Observable<any>; 
  // Nota: ho usato un cast semplice, ma l'ideale è usare liveQuery nel DbService

  async ngOnInit() {
    // Popoliamo il DB se è la prima volta che apriamo la pagina
    await this.seedAboutData();
  }

  private async seedAboutData() {
    const count = await this.dbService.table('aboutContent').count();
    if (count === 0) {
      await this.dbService.table('aboutContent').bulkAdd([
        { 
          id: 'missione', 
          title: 'Oltre le mura: la nostra missione è la vostra serenità', 
          body: 'In un mercato veloce e spesso impersonale come quello immobiliare...' 
        },
        { 
          id: 'filosofia', 
          title: 'La nostra filosofia: il cliente prima dell\'immobile', 
          body: 'Per noi, la serietà è un impegno quotidiano che si traduce in trasparenza totale...' 
        },
        { id: 'etica', title: 'Etica e Trasparenza', body: 'Verifiche rigorose su ogni immobile.' },
        { id: 'sartorialita', title: 'Sartorialità', body: 'Analizziamo il vostro stile di vita per una ricerca mirata.' },
        { id: 'presenza', title: 'Presenza costante', body: 'Al vostro fianco fino al rogito e oltre.' }
      ]);
    }
  }
}
