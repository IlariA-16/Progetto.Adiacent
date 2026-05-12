import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HousingService } from '../../housing.service';
import { HousingLocation } from '../../housing-location';

@Component({
  selector: 'app-details-description',
  standalone: true,
  imports: [CommonModule, RouterModule],
  // Questi due puntano ai file dove abbiamo messo il nuovo CSS e HTML
  templateUrl: './details-description.component.html',
  styleUrls: ['./details-description.component.css']
})
export class DetailsDescriptionComponent implements OnInit {
  housingLocation: HousingLocation | undefined;
  private route = inject(ActivatedRoute);
  private housingService = inject(HousingService);

  async ngOnInit() {
    // Prendiamo l'ID dall'URL (es: /details/1/description)
    const id = Number(this.route.snapshot.params['id']);
    
    // Recuperiamo i dati della casa dal tuo servizio
    this.housingLocation = await this.housingService.getHousingLocationById(id);
  }
}
