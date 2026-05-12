import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { DbService } from '../db.service'; 
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
    if (!this.email || !this.password) {
      Swal.fire({
        title: 'Attenzione',
        text: 'Per favore, inserisci sia email che password.',
        icon: 'warning',
        confirmButtonColor: '#605dc8'
      });
      return;
    }

    // Qui chiamiamo il dbService. 
    // Nota: Il tuo dbService deve restituire l'oggetto utente o null.
    const utente = await this.dbService.login(this.email, this.password);

    if (utente) {
      // SALVIAMO I DATI NEL LOCALSTORAGE
      localStorage.setItem('statoLogin', 'true');
      
      // Salviamo il ruolo che arriva dal database (es. 'admin', 'editor' o 'user')
      // Se il tuo dbService restituisce solo true/false, dovrai modificarlo per restituire il ruolo.
      localStorage.setItem('userRole', utente.role || 'user'); 
      localStorage.setItem('userEmail', utente.email);

      Swal.fire({
        title: 'Successo',
        text: `Benvenuto ${utente.role}!`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        // Se è admin, portalo alla dashboard, altrimenti al profilo
        if (utente.role === 'admin') {
          this.router.navigate(['/dashboard']).then(() => window.location.reload());
        } else {
          this.router.navigate(['/user-profile']).then(() => window.location.reload());
        }
      });

    } else {
      Swal.fire({
        title: 'Errore',
        text: 'Email o password non corretti.',
        icon: 'error',
        confirmButtonColor: '#605dc8'
      });
    }
  }
}
