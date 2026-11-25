import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { VehiculeListComponent } from './features/vehicules/vehicule-list.component';
import { VehiculeFormComponent } from './features/vehicules/vehicule-form.component';
import { ClientListComponent } from './features/clients/client-list.component';
import { ClientDetailComponent } from './features/clients/client-detail.component';
import { LocationListComponent } from './features/locations/location-list.component';
import { LocationNewWizardComponent } from './features/locations/location-new-wizard.component';
import { LocationRetourComponent } from './features/locations/location-retour.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'vehicules', component: VehiculeListComponent },
      { path: 'vehicules/new', component: VehiculeFormComponent },
      { path: 'vehicules/:id/edit', component: VehiculeFormComponent },
      { path: 'clients', component: ClientListComponent },
      { path: 'clients/:id', component: ClientDetailComponent },
      { path: 'locations', component: LocationListComponent },
      { path: 'locations/new', component: LocationNewWizardComponent },
      { path: 'locations/:id/retour', component: LocationRetourComponent }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
