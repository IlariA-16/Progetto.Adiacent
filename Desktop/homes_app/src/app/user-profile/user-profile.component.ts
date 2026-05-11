import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DbService } from '../db.service'; 
import Swal from 'sweetalert2';

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
  
  // Variabile per gestire l'immagine profilo (Base64 o URL)
  fotoProfiloUrl: string | null = null;

  profiloForm = new FormGroup({
    // --- DATI ANAGRAFICI ---
    nome: new FormControl('', Validators.required),
    cognome: new FormControl('', Validators.required),
    dataNascita: new FormControl(''),
    luogoNascita: new FormControl(''),
    genere: new FormControl(''),
    indirizzo: new FormControl(''),
    civico: new FormControl(''),
    cap: new FormControl('', Validators.pattern("^[0-9]{5}$")),
    citta: new FormControl(''),
    provincia: new FormControl(''),
    stato: new FormControl('Italia'),
    telefono: new FormControl('', Validators.pattern("^[0-9+ ]*$")),

    // --- DATI ACCOUNT ---
    email: new FormControl('', [
      Validators.required, 
      Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$") 
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
    return password && conferma && password.value !== conferma.value && password.value !== ''
      ? { passwordsNotMatching: true } 
      : null;
  }

  togglePassword() { this.passwordVisible = !this.passwordVisible; }
  toggleConfirmPassword() { this.confermaPasswordVisible = !this.confermaPasswordVisible; }

  async ngOnInit() {
    const datiSalvati = await this.db.getUserProfile();
    if (datiSalvati) {
      this.profiloForm.patchValue(datiSalvati);
      // Caricamento foto dal DB
      if (datiSalvati.foto) {
        this.fotoProfiloUrl = datiSalvati.foto;
      }
    }
  }

  /**
   * GESTIONE SELEZIONE E SALVATAGGIO AUTOMATICO FOTO
   */
  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      // Controllo dimensione file (max 2MB per performance IndexedDB)
      if (file.size > 2 * 1024 * 1024) {
        this.mostraErrore("L'immagine è troppo grande! Scegline una inferiore a 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e: any) => {
        const base64Image = e.target.result;
        
        // 1. Aggiorna anteprima locale
        this.fotoProfiloUrl = base64Image;

        // 2. SALVATAGGIO AUTOMATICO nel DB (grazie allo spread nel DbService non perdiamo altri dati)
        try {
          await this.db.saveUserProfile({ foto: base64Image });
          this.notificaSuccesso('Immagine profilo salvata correttamente!');
        } catch (error) {
          console.error("Errore salvataggio automatico foto:", error);
          this.mostraErrore("Impossibile salvare l'immagine nel database.");
        }
      };
      reader.readAsDataURL(file);
    }
  }

  // AZIONE 1: Salva la parte Anagrafica (nome, cognome, etc.)
  async salvaProfilo() {
    if (this.profiloForm.get('nome')?.valid && this.profiloForm.get('cognome')?.valid) {
      const formValue = this.profiloForm.value;
      
      const datiAnagrafici = { 
        ...formValue,
        foto: this.fotoProfiloUrl 
      };

      delete (datiAnagrafici as any).password;
      delete (datiAnagrafici as any).confermaPassword;

      try {
        await this.db.saveUserProfile(datiAnagrafici);
        this.notificaSuccesso('Profilo aggiornato con successo!');
      } catch (error) {
        console.error("Errore profilo:", error);
        this.mostraErrore("Errore nel salvataggio dell'anagrafica.");
      }
    }
  }

  // AZIONE 2: Salva Email e/o Nuova Password
  async salvaAccount() {
    const { email, password } = this.profiloForm.value;
    const datiDaSalvare: any = { email };

    if (password && password.trim() !== '') {
      datiDaSalvare.password = password;
    }

    if (this.profiloForm.get('email')?.valid && !this.profiloForm.hasError('passwordsNotMatching')) {
      try {
        await this.db.saveUserProfile(datiDaSalvare);
        this.profiloForm.patchValue({ password: '', confermaPassword: '' });
        this.notificaSuccesso('Dati di accesso aggiornati!');
      } catch (error) {
        console.error("Errore account:", error);
        this.mostraErrore("Errore durante l'aggiornamento dell'account.");
      }
    }
  }

  private notificaSuccesso(messaggio: string) {
    this.mostraConferma = true;
    setTimeout(() => { this.mostraConferma = false; }, 3000);
    
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: messaggio,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }

  private mostraErrore(messaggio: string) {
    Swal.fire({
      icon: 'error',
      title: 'Attenzione',
      text: messaggio,
      confirmButtonColor: '#605dc8'
    });
  }

  logout() {
    localStorage.removeItem('statoLogin');
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }
}
