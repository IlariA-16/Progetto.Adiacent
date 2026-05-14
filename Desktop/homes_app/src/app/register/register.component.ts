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
    inviteCode: '', 
    role: 'user'    
  };

  private readonly ADMIN_CODE = 'ADMIN123';
  private readonly EDITOR_CODE = 'EDIT2026';

  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;
  inviteCodeVisible: boolean = false; // <-- Aggiunta per gestire il codice oscurato

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

  // Metodo per mostrare/nascondere il codice invito
  toggleInviteCodeVisibility() {
    this.inviteCodeVisible = !this.inviteCodeVisible;
  }

  async registrati() {
    const nome = this.userData.nome.trim();
    const cognome = this.userData.cognome.trim();
    const email = this.userData.email.trim();
    const inviteCode = this.userData.inviteCode.trim();
    const { password, confermaPassword } = this.userData;

    if (!nome || !cognome || !email || !password || !confermaPassword) {
      this.mostraMessaggio('Tutti i campi sono obbligatori!', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.mostraMessaggio('Inserisci un indirizzo email valido.', 'error');
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      this.mostraMessaggio(
        'La password deve contenere almeno 8 caratteri, un numero e un carattere speciale.', 
        'error'
      );
      return;
    }

    if (password !== confermaPassword) {
      this.mostraMessaggio('Le password non corrispondono!', 'error');
      return;
    }

    let finalRole = 'user'; 

    if (inviteCode !== '') {
      if (inviteCode === this.ADMIN_CODE) {
        finalRole = 'admin';
      } else if (inviteCode === this.EDITOR_CODE) {
        finalRole = 'editor';
      } else {
        this.mostraMessaggio('Codice invito non valido. Verrai registrato come utente semplice.', 'warning');
      }
    }

    try {
      await this.dbService.saveUserProfile({ 
        nome, 
        cognome, 
        email, 
        password, 
        role: finalRole 
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
        title: `Registrazione completata come ${finalRole.toUpperCase()}!`
      });
      
      this.router.navigate(['/dashboard']);

    } catch (error: any) {
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
      confirmButtonColor: '#605dc8',
    });
  }
}
