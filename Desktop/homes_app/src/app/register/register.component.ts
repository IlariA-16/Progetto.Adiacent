import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; 
import { FormsModule } from '@angular/forms'; 
import { DbService } from '../db.service';
import Swal from 'sweetalert2'; 

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
    const { nome, cognome, email, password, confermaPassword } = this.userData;

    // 1. Controllo campi vuoti
    if (!nome.trim() || !cognome.trim() || !email.trim() || !password || !confermaPassword) {
      this.mostraMessaggio('Tutti i campi sono obbligatori!', 'warning');
      return;
    }

    // 2. Validazione Formato Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.mostraMessaggio('Inserisci un indirizzo email valido.', 'error');
      return;
    }

    // 3. Validazione Password (min 8 caratteri, almeno una lettera e un numero)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      this.mostraMessaggio('La password deve contenere almeno 8 caratteri, inclusa una lettera e un numero.', 'error');
      return;
    }

    // 4. Controllo corrispondenza password
    if (password !== confermaPassword) {
      this.mostraMessaggio('Le password non corrispondono!', 'error');
      return;
    }

    // Se i controlli sono passati, procedo al salvataggio
    try {
      await this.dbService.saveUserProfile(this.userData);
      
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

  // Funzione di supporto per i messaggi SweetAlert2
  private mostraMessaggio(testo: string, icona: 'success' | 'error' | 'warning') {
    Swal.fire({
      text: testo,
      icon: icona,
      confirmButtonColor: '#5e5adb',
    });
  }
}
