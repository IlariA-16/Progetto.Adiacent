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

  userId: number | undefined; // Memorizza l'ID dell'utente loggato
  mostraConferma = false;
  passwordVisible = false; 
  confermaPasswordVisible = false; 
  
  fotoProfiloUrl: string | null = null;

  profiloForm = new FormGroup({
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
    // Recuperiamo il profilo dell'utente loggato
    const datiSalvati = await this.db.getUserProfile();
    if (datiSalvati) {
      this.userId = datiSalvati.id; // Salviamo l'ID per i futuri aggiornamenti
      this.profiloForm.patchValue(datiSalvati);
      if (datiSalvati.foto) {
        this.fotoProfiloUrl = datiSalvati.foto;
      }
    }
  }

  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        this.mostraErrore("L'immagine è troppo grande! Scegline una inferiore a 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e: any) => {
        const base64Image = e.target.result;
        this.fotoProfiloUrl = base64Image;
        try {
          // Passiamo l'ID per aggiornare la foto dell'utente corretto
          await this.db.saveUserProfile({ id: this.userId, foto: base64Image });
          this.notificaSuccesso('Immagine profilo salvata!');
        } catch (error) {
          this.mostraErrore("Impossibile salvare l'immagine.");
        }
      };
      reader.readAsDataURL(file);
    }
  }

  async rimuoviFoto() {
    const result = await Swal.fire({
      title: 'Eliminare la foto?',
      text: "Tornerai a visualizzare le tue iniziali.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#605dc8',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Sì, elimina',
      cancelButtonText: 'Annulla'
    });

    if (result.isConfirmed) {
      try {
        this.fotoProfiloUrl = null;
        await this.db.saveUserProfile({ id: this.userId, foto: null });
        this.notificaSuccesso('Foto rimossa correttamente!');
      } catch (error) {
        this.mostraErrore("Errore durante la rimozione.");
      }
    }
  }

  async salvaProfilo() {
    if (this.profiloForm.get('nome')?.valid && this.profiloForm.get('cognome')?.valid) {
      const formValue = this.profiloForm.value;
      // Includiamo l'ID per attivare la funzione .update() nel DB service
      const datiAnagrafici = { 
        ...formValue, 
        id: this.userId, 
        foto: this.fotoProfiloUrl 
      };
      
      delete (datiAnagrafici as any).password;
      delete (datiAnagrafici as any).confermaPassword;

      try {
        await this.db.saveUserProfile(datiAnagrafici);
        this.notificaSuccesso('Profilo aggiornato!');
      } catch (error) {
        this.mostraErrore("Errore nel salvataggio dei dati anagrafici.");
      }
    }
  }

  async salvaAccount() {
    const { email, password } = this.profiloForm.value;
    const datiDaSalvare: any = { 
      id: this.userId, // ID necessario per aggiornare email/password
      email 
    };
    
    if (password && password.trim() !== '') datiDaSalvare.password = password;

    if (this.profiloForm.get('email')?.valid && !this.profiloForm.hasError('passwordsNotMatching')) {
      try {
        await this.db.saveUserProfile(datiDaSalvare);
        this.profiloForm.patchValue({ password: '', confermaPassword: '' });
        this.notificaSuccesso('Dati account aggiornati!');
      } catch (error) {
        this.mostraErrore("Errore nell'aggiornamento dell'account.");
      }
    }
  }

  private notificaSuccesso(messaggio: string) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: messaggio,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true
    });
  }

  private mostraErrore(messaggio: string) {
    Swal.fire({ icon: 'error', title: 'Oops...', text: messaggio, confirmButtonColor: '#605dc8' });
  }

  logout() {
    localStorage.clear(); // Pulisce sessione e ID utente
    this.router.navigate(['/login']).then(() => { window.location.reload(); });
  }
}
