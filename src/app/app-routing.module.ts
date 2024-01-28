import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MasterPageComponent } from './layout/pages/master-page/master-page.component';
import { NotFoundComponent } from './shared/pages/not-found/not-found.component';

const routes: Routes = [
  {
    path: '',
    component: MasterPageComponent,
    children: [
      // { path: 'dashboard', component: DashboardComponent },
      // { path: 'colaboradores', component: UserComponent },
      // { path: 'colaborador/novo', component: UserRegisterComponent },
      // { path: 'perfil', component: UserProfileComponent },
      // { path: 'pacientes', component: PatientComponent },
      // { path: 'paciente/novo', component: PatientRegisterComponent },
      // { path: 'atendimentos', component: AttendanceComponent },
      // { path: 'atendimento/novo', component: AttendanceRegisterComponent },
      // { path: 'sala-de-espera', component: WaitingRoomComponent },
      // { path: 'triagem', component: TriageComponent },
      // { path: 'triagem/nova/:id', component: TriageRegisterComponent },
      // { path: 'consulta', component: AppointmentComponent },
      // { path: 'consulta/nova/:id', component: AppointmentRegisterComponent },
    ],
    // canActivate: [AuthGuard],
  },
  // {
  //   path: '',
  //   component: AuthenticationComponent,
  //   children: [
  //     { path: '', redirectTo: 'login', pathMatch: 'full' },
  //     { path: 'login', component: LoginComponent },
  //   ],
  // },
  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '/404' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
