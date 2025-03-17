import { Routes } from '@angular/router';
import { NotFoundComponent } from './shared/pages/not-found/not-found.component';
import { AboutComponent } from './shared/pages/about/about.component';
import { HomeComponent } from './shared/pages/home/home.component';
import { DestinationListComponent } from './features/destination/components/destination-list/destination-list.component';
import { UserListComponent } from './features/user/components/user-list/user-list.component';
import { SupplierListComponent } from './features/supplier/components/supplier-list/supplier-list.component';
import { ProductListComponent } from './features/product/components/product-list/product-list.component';
import { StockListComponent } from './features/stock/components/stock-list/stock-list.component';
import { OrderListComponent } from './features/order/components/order-list/order-list.component';
import { AccountListComponent } from './features/account/components/account-list/account-list.component';
import { AccountFormComponent } from './features/account/components/account-form/account-form.component';
import { LoginComponent } from './core/components/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { DestinationProfileComponent } from './features/destination/components/destination-profile/destination-profile.component';
import { RegisterComponent } from './core/components/register/register.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'clientes',
    component: AccountListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'clientes/form',
    component: AccountFormComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'destinos',
    component: DestinationListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'perfil',
    component: DestinationProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'estoque',
    component: StockListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'fornecedores',
    component: SupplierListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'pedidos',
    component: OrderListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'produtos',
    component: ProductListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'registrar',
    component: RegisterComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'sobre',
    component: AboutComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'usuarios',
    component: UserListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
