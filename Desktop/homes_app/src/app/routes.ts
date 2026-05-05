import { Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { DetailsMicoComponent } from "./details-mico/details-mico.component";
import { DetailsComponent } from "./details/details.component";
import { ThankYouComponent } from "./thank-you/thank-you.component";
import { FavoritesComponent } from "./favorites/favorites.component";
import { AddHouseComponent } from "./add-house/add-house.component";

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
  }
 



  
];

export default routeConfig;