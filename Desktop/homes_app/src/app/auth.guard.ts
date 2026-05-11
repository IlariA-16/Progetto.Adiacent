import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // Controlliamo se nel localStorage esiste la chiave 'statoLogin'
  const isLogged = localStorage.getItem('statoLogin');

  if (isLogged) {
    return true; // L'utente è loggato, può passare
  } else {
    // L'utente NON è loggato: lo rispediamo alla home
    router.navigate(['/home']);
    return false;
  }
};
