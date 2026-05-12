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
    confermaPassword: '',
    role: 'user' 
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
    const nome = this.userData.nome.trim();
    const cognome = this.userData.cognome.trim();
    const email = this.userData.email.trim();
    const role = this.userData.role; 
    const { password, confermaPassword } = this.userData;

    // 1. Controllo campi vuoti
    if (!nome || !cognome || !email || !password || !confermaPassword) {
      this.mostraMessaggio('Tutti i campi sono obbligatori!', 'warning');
      return;
    }

    // 2. Validazione Formato Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.mostraMessaggio('Inserisci un indirizzo email valido.', 'error');
      return;
    }

    // 3. Validazione Password (8 car, 1 num, 1 spec)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      this.mostraMessaggio(
        'La password deve contenere almeno 8 caratteri, un numero e un carattere speciale.', 
        'error'
      );
      return;
    }

    // 4. Controllo corrispondenza password
    if (password !== confermaPassword) {
      this.mostraMessaggio('Le password non corrispondono!', 'error');
      return;
    }

    try {
      // Chiamata al database per il salvataggio
      await this.dbService.saveUserProfile({ 
        nome, 
        cognome, 
        email, 
        password, 
        role 
      });
      
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });

      await Toast.fire({
        icon: 'success',
        title: `Utente registrato come ${role.toUpperCase()}!`
      });
      
      // Reindirizzamento alla dashboard dopo il successo
      this.router.navigate(['/dashboard']);

    } catch (error: any) {
      // Gestione specifica dell'errore email duplicata dal DbService
      if (error.message === "Email già registrata. Usa un altro indirizzo.") {
        this.mostraMessaggio('Attenzione: questa email è già registrata!', 'error');
      } else {
        console.error('Errore durante la registrazione:', error);
        this.mostraMessaggio('Si è verificato un errore durante il salvataggio.', 'error');
      }
    }
  }

  private mostraMessaggio(testo: string, icona: 'success' | 'error' | 'warning') {
    Swal.fire({
      text: testo,
      icon: icona,
      confirmButtonColor: '#605dc8', // Usiamo il viola del tuo tema
    });
  }
}
