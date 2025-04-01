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
import { LoginComponent } from './core/components/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { DestinationProfileComponent } from './features/destination/components/destination-profile/destination-profile.component';
import { RegisterComponent } from './core/components/register/register.component';
import { ReceivingListComponent } from './features/receiving/components/receiving-list/receiving-list.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Araras Health Hub',
    canActivate: [AuthGuard]
  },
  {
    path: 'clientes',
    component: AccountListComponent,
    title: 'A2H - Clientes',
    canActivate: [AuthGuard]
  },
  {
    path: 'destinos',
    component: DestinationListComponent,
    title: 'A2H - Destinos',
    canActivate: [AuthGuard]
  },
  {
    path: 'perfil',
    component: DestinationProfileComponent,
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
    path: 'recebimentos',
    component: ReceivingListComponent,
    title: 'A2H - Recebimentos',
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
    path: 'usuarios',
    component: UserListComponent,
    title: 'A2H - Usuários',
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: 'Araras Health Hub',
  },
];
