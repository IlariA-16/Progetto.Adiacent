import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DbService } from '../db.service';
import { Observable, from } from 'rxjs';
// 1. Importa il modulo di traduzione
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-about',
  standalone: true,
  // 2. Aggiungi TranslateModule
  imports: [CommonModule, TranslateModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  private dbService = inject(DbService);
  private translate = inject(TranslateService);

  // Observable che recupera i dati dal DB
  aboutData$: Observable<any> = from(this.dbService.table('aboutContent').toArray().then(items => {
    return {
      missione: items.find(i => i.id === 'missione'),
      filosofia: items.find(i => i.id === 'filosofia'),
      valori: items.filter(i => ['etica', 'sartorialita', 'presenza'].includes(i.id))
    };
  }));

  async ngOnInit() {
    await this.seedAboutData();
  }

  private async seedAboutData() {
    const count = await this.dbService.table('aboutContent').count();
    if (count === 0) {
      // Nel DB salviamo solo gli ID. I testi effettivi li mettiamo nei file JSON
      await this.dbService.table('aboutContent').bulkAdd([
        { id: 'missione' },
        { id: 'filosofia' },
        { id: 'etica' },
        { id: 'sartorialita' },
        { id: 'presenza' }
      ]);
    }
  }
}