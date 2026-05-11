import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { DbService } from '../db.service'; // Controlla che il percorso sia corretto
import Swal from 'sweetalert2'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Login</h2>
        <p>Inserisci le tue credenziali per accedere</p>
        <form (ngSubmit)="handleLogin()">
          <div class="form-group">
            <label>EMAIL:</label>
            <input type="email" name="email" [(ngModel)]="email" placeholder="esempio@testo.it">
          </div>
          
          <div class="form-group">
            <label>PASSWORD:</label>
            <div class="password-wrapper" style="position: relative;">
              <input [type]="passwordVisible ? 'text' : 'password'" name="password" [(ngModel)]="password" placeholder="Inserisci la tua password" style="width: 100%;">
              <span class="toggle-password" (click)="togglePasswordVisibility()" 
                    style="position: absolute; right: 15px; top: 12px; font-size: 0.7rem; font-weight: bold; color: #605dc8; cursor: pointer;">
                {{ passwordVisible ? 'NASCONDI' : 'MOSTRA' }}
              </span>
            </div>
          </div>

          <button type="submit" class="btn-submit">Accedi ora</button>
        </form>
        <p class="register-link">Non hai un account? <a [routerLink]="['/register']">Iscriviti ora</a></p>
      </div>
    </div>
  `,
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private router = inject(Router);
  private dbService = inject(DbService);
  
  email = '';
  password = '';
  passwordVisible: boolean = false;

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  async handleLogin() {
    // Controllo se i campi sono vuoti
    if (!this.email || !this.password) {
      Swal.fire({
        title: 'Attenzione',
        text: 'Per favore, inserisci sia email che password.',
        icon: 'warning',
        confirmButtonColor: '#605dc8'
      });
      return;
    }

    // Chiamata al database per la verifica
    const esito = await this.dbService.login(this.email, this.password);

    if (esito) {
      // Se il login è corretto, vai al profilo
      this.router.navigate(['/user-profile']).then(() => {
        window.location.reload();
      });
    } else {
      // Se i dati sono sbagliati
      Swal.fire({
        title: 'Errore',
        text: 'Email o password non corretti.',
        icon: 'error',
        confirmButtonColor: '#605dc8'
      });
    }
  }
}
