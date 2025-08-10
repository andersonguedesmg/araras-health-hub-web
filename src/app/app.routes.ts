import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
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
import { FacilityProfileComponent } from './features/facility/components/facility-profile/facility-profile.component';
import { RegisterComponent } from './core/components/register/register.component';
import { ReceivingListComponent } from './features/receiving/components/receiving-list/receiving-list.component';
import { ReceivingCreateComponent } from './features/receiving/components/receiving-create/receiving-create.component';
import { OrderCreateComponent } from './features/order/components/order-create/order-create.component';
import { UnauthorizedComponent } from './shared/pages/unauthorized/unauthorized.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'A2H - Login',
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
    title: 'Araras Health Hub',
  },
  {
    path: 'registrar',
    component: RegisterComponent,
    title: 'A2H - Registro',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'Master'] },
  },

  {
    path: '',
    component: HomeComponent,
    title: 'Araras Health Hub',
    canActivate: [authGuard],
  },

  {
    path: '',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'Master', 'User'] },
    children: [
      {
        path: 'contas',
        component: AccountListComponent,
        title: 'A2H - Contas',
      },
      {
        path: 'unidades',
        component: FacilityListComponent,
        title: 'A2H - Unidades',
      },
      {
        path: 'perfil',
        component: FacilityProfileComponent,
        title: 'A2H - Perfil',
      },
      {
        path: 'estoque',
        component: StockListComponent,
        title: 'A2H - Estoque',
      },
      {
        path: 'fornecedores',
        component: SupplierListComponent,
        title: 'A2H - Fornecedores',
      },
      {
        path: 'pedidos',
        component: OrderListComponent,
        title: 'A2H - Pedidos',
      },
      {
        path: 'pedido/novo',
        component: OrderCreateComponent,
        title: 'A2H - Novo Pedido',
      },
      {
        path: 'produtos',
        component: ProductListComponent,
        title: 'A2H - Produtos',
      },
      {
        path: 'entradas',
        component: ReceivingListComponent,
        title: 'A2H - Entradas',
      },
      {
        path: 'entrada/nova',
        component: ReceivingCreateComponent,
        title: 'A2H - Nova Entrada',
      },
      {
        path: 'sobre',
        component: AboutComponent,
        title: 'A2H - Sobre',
      },
      {
        path: 'funcionarios',
        component: EmployeeListComponent,
        title: 'A2H - Funcionário',
      },
    ],
  },

  {
    path: '**',
    component: NotFoundComponent,
    title: 'Araras Health Hub',
  },
];
