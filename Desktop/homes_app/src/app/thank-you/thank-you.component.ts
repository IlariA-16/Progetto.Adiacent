import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
// 1. Importa i moduli per la traduzione
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-thank-you',
  standalone: true,
  // 2. Aggiungi TranslateModule agli imports
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './thank-you.component.html',
  styleUrls: ['./thank-you.component.css']
})
export class ThankYouComponent {
  // Iniettiamo la rotta attiva
  private route: ActivatedRoute = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  
  // Variabile per il nome dell'utente
  userName: string | null = this.route.snapshot.queryParamMap.get('name');

  constructor() {
    // 3. Leggiamo il parametro 'name' dall'URL (?name=...)
    const nameParam = this.route.snapshot.queryParamMap.get('name');
    
    // 4. Se il nome esiste lo usiamo, altrimenti usiamo la traduzione di "Ospite"
    // Nota: 'THANK_YOU.GUEST' deve essere presente nei tuoi file JSON
    this.userName = nameParam ?? this.translate.instant('THANK_YOU.GUEST');
  }
}
