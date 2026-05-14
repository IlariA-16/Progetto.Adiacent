import { Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { DetailsMicoComponent } from "./details-mico/details-mico.component";
import { DetailsComponent } from "./details/details.component";
import { ThankYouComponent } from "./thank-you/thank-you.component";
import { FavoritesComponent } from './favorites/favorites.component';
import { AboutComponent } from './about/about.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { DetailsDescriptionComponent } from './details/details-description/details-description.component';
import { AddHouseComponent } from './add-house/add-house.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { authGuard } from "./auth.guard";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from './register/register.component';


const routeConfig: Routes = [
  // --- ROTTE PUBBLICHE (Accessibili a tutti) ---
  {
    path: '',
    component: HomeComponent,
    title: 'Home page'
  },
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Accedi'
  },
  {
    path: 'about',
    component: AboutComponent,
    title: 'Chi siamo'
  },
  {
    path: 'details-mico/:id',
    component: DetailsMicoComponent,
    title: 'Details mico'
  },
  {
    path: 'details/:id',
    component: DetailsComponent,
    title: 'Dettagli Casa'
  },
  {
    path: 'details/:id/description',
    component: DetailsDescriptionComponent,
    title: 'Descrizione Completa'
  },
  {
    path: 'thank-you',
    component: ThankYouComponent,
    title: 'Grazie per averci contattato'
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Registrati',
  },

  // --- ROTTE PROTETTE PER RUOLO ---

  {
    path: 'favorites',
    component: FavoritesComponent,
    title: 'I miei Preferiti',
    canActivate: [authGuard],
    data: { expectedRoles: ['admin', 'editor', 'user'] } // Tutti i loggati
  },
  {
    path: 'user-profile',
    component: UserProfileComponent,
    title: 'Profilo Utente',
    canActivate: [authGuard],
    data: { expectedRoles: ['admin', 'editor', 'user'] } // Tutti i loggati (Editor può modificare qui)
  },
  {
    path: 'dashboard',
    component: UserDashboardComponent,
    title: 'La tua Dashboard',
    canActivate: [authGuard],
    data: { expectedRoles: ['admin', 'editor']}
  },
  {
    path: 'add',
    component: AddHouseComponent,
    title: 'Aggiungi Proprietà',
    canActivate: [authGuard],
    data: { expectedRoles: ['admin'] } // Solo Admin (Creazione immobili)
  },
  
];

export default routeConfig;
