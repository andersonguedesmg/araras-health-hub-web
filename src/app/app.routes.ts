import { Routes } from '@angular/router';
import { NotFoundComponent } from './shared/pages/not-found/not-found.component';
import { AboutComponent } from './shared/pages/about/about.component';
import { HomeComponent } from './shared/pages/home/home.component';
import { FacilityListComponent } from './features/facility/components/facility-list/facility-list.component';
import { EmployeeListComponent } from './features/employee/components/employee-list/employee-list.component';
import { SupplierListComponent } from './features/supplier/components/supplier-list/supplier-list.component';
import { ProductListComponent } from './features/product/components/product-list/product-list.component';
import { StockListComponent } from './features/stock/components/stock-list/stock-list.component';
import { OrderListComponent } from './features/order/components/order-list/order-list.component';
import { AccountListComponent } from './features/account/components/account-list/account-list.component';
import { LoginComponent } from './core/components/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { FacilityProfileComponent } from './features/facility/components/facility-profile/facility-profile.component';
import { RegisterComponent } from './core/components/register/register.component';
import { ReceivingListComponent } from './features/receiving/components/receiving-list/receiving-list.component';
import { ReceivingCreateComponent } from './features/receiving/components/receiving-create/receiving-create.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Araras Health Hub',
    canActivate: [AuthGuard]
  },
  {
    path: 'contas',
    component: AccountListComponent,
    title: 'A2H - Contas',
    canActivate: [AuthGuard]
  },
  {
    path: 'unidades',
    component: FacilityListComponent,
    title: 'A2H - Unidades',
    canActivate: [AuthGuard]
  },
  {
    path: 'perfil',
    component: FacilityProfileComponent,
    title: 'A2H - Perfil',
    canActivate: [AuthGuard]
  },
  {
    path: 'estoque',
    component: StockListComponent,
    title: 'A2H - Estoque',
    canActivate: [AuthGuard]
  },
  {
    path: 'fornecedores',
    component: SupplierListComponent,
    title: 'A2H - Fornecedores',
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'A2H - Login',
  },
  {
    path: 'pedidos',
    component: OrderListComponent,
    title: 'A2H - Pedidos',
    canActivate: [AuthGuard]
  },
  {
    path: 'produtos',
    component: ProductListComponent,
    title: 'A2H - Produtos',
    canActivate: [AuthGuard]
  },
  {
    path: 'entradas',
    component: ReceivingListComponent,
    title: 'A2H - Entradas',
    canActivate: [AuthGuard]
  },
  {
    path: 'entrada/nova',
    component: ReceivingCreateComponent,
    title: 'A2H - Nova Entrada',
    canActivate: [AuthGuard]
  },
  {
    path: 'registrar',
    component: RegisterComponent,
    title: 'A2H - Registro',
    canActivate: [AuthGuard]
  },
  {
    path: 'sobre',
    component: AboutComponent,
    title: 'A2H - Sobre',
    canActivate: [AuthGuard]
  },
  {
    path: 'funcionarios',
    component: EmployeeListComponent,
    title: 'A2H - Funcionário',
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: 'Araras Health Hub',
  },
];
