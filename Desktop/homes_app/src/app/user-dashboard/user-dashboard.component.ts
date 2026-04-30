import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';
import { HousingService } from '../housing.service'; 

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  private housingService = inject(HousingService);
  
  userName: string = 'Ospite';
  applicationsCount: number = 0; 
  appliedHouses: any[] = [];    

  // Getter per i preferiti sempre aggiornati
  get favoritesCount(): number {
    return this.housingService.getFavoritesCount();
  }
  get saluto(): string {
  // Se il nome finisce per 'o', usa il maschile, altrimenti il femminile
  return this.userName.toLowerCase().endsWith('o') ? 'Bentornato' : 'Bentornata';
}


  ngOnInit() {
    this.applicationsCount = this.housingService.getApplicationsCount();
    this.appliedHouses = this.housingService.getApplicationsList();
    
    // Recupera il nome dell'ultima persona che si è candidata
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      this.userName = savedName;
    }
  }
}
