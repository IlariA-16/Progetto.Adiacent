import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 
import { DbService } from '../db.service'; 

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  private db = inject(DbService);
  private router = inject(Router);

  mostraConferma = false;
  mostraPassword = false; 
  mostraConfermaPassword = false; 

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

  async ngOnInit() {
    const datiSalvati = await this.db.getUserProfile();
    if (datiSalvati) {
      // Carichiamo i dati ma teniamo i campi password vuoti per sicurezza
      this.profiloForm.patchValue({
        nome: datiSalvati.nome,
        cognome: datiSalvati.cognome,
        email: datiSalvati.email,
        password: '',
        confermaPassword: ''
      });
    }
  }

  async salvaProfilo() {
    if (this.profiloForm.valid) {
      try {
        const { confermaPassword, ...datiDaSalvare } = this.profiloForm.value;
        await this.db.saveUserProfile(datiDaSalvare as any);
        
        // Svuota il form dopo il salvataggio riuscito
        this.profiloForm.reset();
        
        this.mostraConferma = true;
        setTimeout(() => {
          this.mostraConferma = false;
        }, 3000);

      } catch (error) {
        console.error("Errore durante il salvataggio:", error);
      }
    }
  }

  logout() {
    localStorage.removeItem('statoLogin');
    this.router.navigate(['/']); 
  }
}
