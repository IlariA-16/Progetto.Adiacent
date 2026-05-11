import { Component, inject } from '@angular/core'; // Aggiungi inject qui
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-thank-you',
  standalone: true,
  imports: [CommonModule, RouterModule], // Aggiungi RouterModule se vuoi usare link per tornare alla home
  templateUrl: './thank-you.component.html',
  styleUrls: ['./thank-you.component.css']
})
export class ThankYouComponent {
  // Iniettiamo la rotta attiva
  route: ActivatedRoute = inject(ActivatedRoute);
  
  //Creiamo una variabile per il nome
  userName: string = '';

  constructor() {
    //Leggiamo il parametro 'name' dall'URL (?name=...)
    this.userName = this.route.snapshot.queryParamMap.get('name') ?? 'ospite';
  }
}
