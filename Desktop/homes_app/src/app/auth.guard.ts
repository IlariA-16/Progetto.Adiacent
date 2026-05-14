import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // Recuperiamo lo stato del login e il ruolo salvato (es. 'admin', 'editor', 'user')
  const isLogged = localStorage.getItem('statoLogin');
  const userRole = localStorage.getItem('userRole'); 

  // 1. Controllo base: se non è loggato, va alla home
  if (!isLogged) {
    router.navigate(['/home']);
    return false;
  }

  // 2. Controllo Ruoli: leggiamo quali ruoli sono ammessi per questa rotta
  // Se nella rotta non abbiamo definito 'expectedRoles', allora tutti i loggati possono passare
  const expectedRoles = route.data['expectedRoles'] as Array<string>;

  if (expectedRoles && !expectedRoles.includes(userRole || '')) {
    // Se l'utente non ha il ruolo giusto, lo rimandiamo alla home
    alert("Accesso negato: non hai i permessi necessari.");
    router.navigate(['/home']);
    return false;
  }

  return true; // Se passa i controlli, può accedere
};
