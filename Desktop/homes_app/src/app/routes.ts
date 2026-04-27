import { Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { DetailsMicoComponent } from "./details-mico/details-mico.component";
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
  }
];

export default routeConfig;