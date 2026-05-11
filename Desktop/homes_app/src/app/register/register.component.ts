import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  // Variabili per controllare se mostrare il testo o i pallini
  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;

  // Funzione per il primo campo password
  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  // Funzione per il campo conferma password
  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }
}
