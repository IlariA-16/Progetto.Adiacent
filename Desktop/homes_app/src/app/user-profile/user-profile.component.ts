import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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
  passwordVisible = false; 
  confermaPasswordVisible = false; 

  // Ho rimosso Validators.required dalle password per permettere modifiche parziali
  profiloForm = new FormGroup({
    nome: new FormControl('', Validators.required),
    cognome: new FormControl('', Validators.required),
    email: new FormControl('', [
      Validators.required, 
      Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$") // Pattern email più flessibile
    ]),
    password: new FormControl('', [
      Validators.minLength(6),
      Validators.pattern("^(?=.*[0-9])(?=.*[!@#$%^&*]).*$")
    ]),
    confermaPassword: new FormControl('')
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const conferma = control.get('confermaPassword');
    // La validazione scatta solo se l'utente inizia a scrivere una password
    return password && conferma && password.value !== conferma.value && password.value !== ''
      ? { passwordsNotMatching: true } 
      : null;
  }

  togglePassword() { this.passwordVisible = !this.passwordVisible; }
  toggleConfirmPassword() { this.confermaPasswordVisible = !this.confermaPasswordVisible; }

  async ngOnInit() {
    const datiSalvati = await this.db.getUserProfile();
    if (datiSalvati) {
      // patchValue popola i campi esistenti e ignora quelli mancanti
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
        const formValues = { ...this.profiloForm.value };
        
        // Prepariamo l'oggetto da inviare eliminando i campi inutili
        const datiDaSalvare: any = {
          nome: formValues.nome,
          cognome: formValues.cognome,
          email: formValues.email
        };

        // Aggiungiamo la password solo se l'utente ne ha scritta una nuova
        if (formValues.password && formValues.password.trim() !== '') {
          datiDaSalvare.password = formValues.password;
        }

        await this.db.saveUserProfile(datiDaSalvare);
        
        this.mostraConferma = true;
        // Resettiamo solo i campi password dopo il salvataggio
        this.profiloForm.patchValue({ password: '', confermaPassword: '' });

        setTimeout(() => { this.mostraConferma = false; }, 3000);
      } catch (error) {
        console.error("Errore durante il salvataggio:", error);
      }
    }
  }

  logout() {
    localStorage.removeItem('statoLogin');
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }
}
