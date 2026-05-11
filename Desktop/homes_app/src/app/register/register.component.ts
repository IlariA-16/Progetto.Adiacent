import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; 
import { FormsModule } from '@angular/forms'; 
import { DbService } from '../db.service';
import Swal from 'sweetalert2'; // <--- Nuovo import per i messaggi Toast

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  userData = {
    nome: '',
    cognome: '',
    email: '',
    password: '',
    confermaPassword: ''
  };

  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;

  constructor(
    private dbService: DbService, 
    private router: Router
  ) {}

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  async registrati() {
    // Controllo password non corrispondenti
    if (this.userData.password !== this.userData.confermaPassword) {
      this.mostraMessaggio('Le password non corrispondono!', 'error');
      return;
    }

    // Controllo campi vuoti
    if (!this.userData.email || !this.userData.password) {
      this.mostraMessaggio('Per favore, compila tutti i campi.', 'warning');
      return;
    }

    try {
      await this.dbService.saveUserProfile(this.userData);
      
      // Messaggio di successo stile Toast
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });

      await Toast.fire({
        icon: 'success',
        title: 'Registrazione completata!'
      });
      
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Errore:', error);
      this.mostraMessaggio('Errore durante il salvataggio.', 'error');
    }
  }

  // Funzione di supporto per messaggi veloci
  private mostraMessaggio(testo: string, icona: 'success' | 'error' | 'warning') {
    Swal.fire({
      text: testo,
      icon: icona,
      confirmButtonColor: '#5e5adb', // Colore viola come il tuo bottone
    });
  }
}
