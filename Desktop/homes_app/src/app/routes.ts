import { Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { DetailsMicoComponent } from "./details-mico/details-mico.component";
import { DetailsComponent } from "./details/details.component";
import { ThankYouComponent } from "./thank-you/thank-you.component";
import { FavoritesComponent } from "./favorites/favorites.component";
import { AddHouseComponent } from "./add-house/add-house.component";
import { UserDashboardComponent } from "./user-dashboard/user-dashboard.component";
import { AboutComponent } from "./about/about.component";

const routeConfig: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Home page'
  },

  {
    path: 'details-mico/:id',
    component: DetailsMicoComponent,
    title:'Details mico'
  },

  {
    path: 'details/:id',
    component: DetailsComponent,
    title:'Details '
  },

    {
    path: 'thank-you',
    component: ThankYouComponent,
    title: 'Thank You'
  },

  {
    path: 'favorites',
    component: FavoritesComponent,
    title: 'I miei Preferiti'  },

  {
    path: 'add',
    component: AddHouseComponent,
    title: 'Aggiungi una casa'
  },

  {
    path: 'dashboard',
    component: UserDashboardComponent,
    title: 'Dashboard Utente'

  },
  
  {
    path: 'about',
    component: AboutComponent,
    title: 'Chi Siamo'

  },
 



  
];

export default routeConfig;