import { Routes } from '@angular/router';
import { NotFoundComponent } from './shared/pages/not-found/not-found.component';
import { AboutComponent } from './shared/pages/about/about.component';
import { HomeComponent } from './shared/pages/home/home.component';
import { DestinationListComponent } from './features/destination/components/destination-list/destination-list.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'destinos',
    component: DestinationListComponent,
  },
  {
    path: 'sobre',
    component: AboutComponent,
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
