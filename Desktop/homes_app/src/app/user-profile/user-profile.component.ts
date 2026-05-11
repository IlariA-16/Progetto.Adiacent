import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Aggiunto RouterModule
import { DbService } from '../db.service'; 

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  private db = inject(DbService);
  private router = inject(Router);

  mostraConferma = false;
  // Variabili per la visibilità delle password
  passwordVisible = false; 
  confermaPasswordVisible = false; 

  profiloForm = new FormGroup({
    nome: new FormControl('', Validators.required),
    cognome: new FormControl('', Validators.required),
    email: new FormControl('', [
      Validators.required, 
      Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.(it|com)$")
    ]),
    password: new FormControl('', [
      Validators.required, 
      Validators.minLength(6),
      Validators.pattern("^(?=.*[0-9])(?=.*[!@#$%^&*]).*$")
    ]),
    confermaPassword: new FormControl('', Validators.required)
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const conferma = control.get('confermaPassword');
    return password && conferma && password.value !== conferma.value 
      ? { passwordsNotMatching: true } 
      : null;
  }

  // Funzioni per mostrare/nascondere password
  togglePassword() { this.passwordVisible = !this.passwordVisible; }
  toggleConfirmPassword() { this.confermaPasswordVisible = !this.confermaPasswordVisible; }

  async ngOnInit() {
    const datiSalvati = await this.db.getUserProfile();
    if (datiSalvati) {
      this.profiloForm.patchValue({
        nome: datiSalvati.nome,
        cognome: datiSalvati.cognome,
        email: datiSalvati.email
      });
    }
  }

  async salvaProfilo() {
    if (this.profiloForm.valid) {
      try {
        const { confermaPassword, ...datiDaSalvare } = this.profiloForm.value;
        await this.db.saveUserProfile(datiDaSalvare as any);
        this.mostraConferma = true;
        
        this.profiloForm.patchValue({ password: '', confermaPassword: '' });

        setTimeout(() => { this.mostraConferma = false; }, 3000);
      } catch (error) {
        console.error("Errore:", error);
      }
    }
  }

  logout() {
    localStorage.removeItem('statoLogin');
    this.router.navigate(['/login']).then(() => {
      window.location.reload(); // Forza l'aggiornamento dell'header
    });
  }
}
