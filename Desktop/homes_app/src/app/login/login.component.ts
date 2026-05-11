import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Bentornato!</h2>
        <p>Inserisci le tue credenziali per accedere</p>
        <form>
          <div class="form-group">
            <label>EMAIL:</label>
            <input type="email" placeholder="esempio@testo.it">
          </div>
          
          <div class="form-group">
            <label>PASSWORD:</label>
            <div class="password-wrapper" style="position: relative;">
              <!-- [type] cambia dinamicamente grazie a passwordVisible -->
              <input [type]="passwordVisible ? 'text' : 'password'" placeholder="Inserisci la tua password" style="width: 100%;">
              <span class="toggle-password" (click)="togglePasswordVisibility()" 
                    style="position: absolute; right: 15px; top: 12px; font-size: 0.7rem; font-weight: bold; color: #605dc8; cursor: pointer;">
                {{ passwordVisible ? 'NASCONDI' : 'MOSTRA' }}
              </span>
            </div>
          </div>

          <button type="button" (click)="handleLogin()" class="btn-submit">Accedi ora</button>
        </form>
        <p class="register-link">Non hai un account? <a [routerLink]="['/register']">Iscriviti ora</a></p>
      </div>
    </div>
  `,
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private router = inject(Router);
  
  // Variabile per gestire la visibilità della password
  passwordVisible: boolean = false;

  // Funzione per cambiare la visibilità
  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  handleLogin() {
    localStorage.setItem('statoLogin', 'true');
    this.router.navigate(['/user-profile']).then(() => {
      window.location.reload();
    });
  }
}
 