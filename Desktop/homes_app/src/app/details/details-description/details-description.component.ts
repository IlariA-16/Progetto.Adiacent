import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HousingService } from '../../housing.service';
import { HousingLocation } from '../../housing-location';

// IMPORTANTE: Modulo per abilitare le traduzioni nel template
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-details-description',
  standalone: true,
  // Aggiungiamo TranslateModule agli imports per far funzionare la pipe | translate nell'HTML
  imports: [
    CommonModule, 
    RouterModule, 
    TranslateModule
  ],
  templateUrl: './details-description.component.html',
  styleUrls: ['./details-description.component.css']
})
export class DetailsDescriptionComponent implements OnInit {
  housingLocation: HousingLocation | undefined;
  
  private route = inject(ActivatedRoute);
  private housingService = inject(HousingService);

  async ngOnInit() {
    // 1. Recuperiamo l'ID dai parametri dell'URL
    const id = Number(this.route.snapshot.params['id']);
    
    // 2. Chiamiamo il servizio per ottenere i dettagli della casa specifica
    // Usiamo await perché getHousingLocationById restituisce una Promise
    this.housingLocation = await this.housingService.getHousingLocationById(id);
  }
}