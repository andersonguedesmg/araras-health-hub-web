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
import { OrderApproveComponent } from './features/order/components/order-approve/order-approve.component';
import { OrderSeparateComponent } from './features/order/components/order-separate/order-separate.component';
import { OrderFinalizeComponent } from './features/order/components/order-finalize/order-finalize.component';
import { OrderCompletedComponent } from './features/order/components/order-completed/order-completed.component';
import { StockMovementComponent } from './features/stock/components/stock-movement/stock-movement.component';
import { StockCriticalComponent } from './features/stock/components/stock-critical/stock-critical.component';
import { StockShippingComponent } from './features/stock/components/stock-shipping/stock-shipping.component';
import { StockAdjustmentComponent } from './features/stock/components/stock-adjustment/stock-adjustment.component';

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
    path: 'administracao/contas/registrar',
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
      // ADMINISTRAÇÃO
      {
        path: 'administracao/contas',
        component: AccountListComponent,
        title: 'A2H - Contas',
      },
      {
        path: 'administracao/fornecedores',
        component: SupplierListComponent,
        title: 'A2H - Fornecedores',
      },
      {
        path: 'administracao/funcionarios',
        component: EmployeeListComponent,
        title: 'A2H - Funcionário',
      },
      {
        path: 'administracao/produtos',
        component: ProductListComponent,
        title: 'A2H - Produtos',
      },
      {
        path: 'administracao/unidades',
        component: FacilityListComponent,
        title: 'A2H - Unidades',
      },
      {
        path: 'administracao/unidades/perfil',
        component: FacilityProfileComponent,
        title: 'A2H - Perfil da Unidade',
      },

      // PEDIDOS
      {
        path: 'pedidos/aprovar',
        component: OrderApproveComponent,
        title: 'A2H - Pedidos para Aprovação',
      },
      {
        path: 'pedidos/finalizados',
        component: OrderCompletedComponent,
        title: 'A2H - Pedidos Finalizados',
      },
      {
        path: 'pedidos/finalizar',
        component: OrderFinalizeComponent,
        title: 'A2H - Pedidos para Finalização',
      },
      {
        path: 'pedidos/historico',
        component: OrderListComponent,
        title: 'A2H - Histórico de Pedidos',
      },
      {
        path: 'pedidos/novo',
        component: OrderCreateComponent,
        title: 'A2H - Novo Pedido',
      },
      {
        path: 'pedidos/separar',
        component: OrderSeparateComponent,
        title: 'A2H - Pedidos para Separação',
      },

      // ALMOXARIFADO
      {
        path: 'almoxarifado/estoque/geral',
        component: StockListComponent,
        title: 'A2H - Estoque Geral',
      },
      {
        path: 'almoxarifado/estoque/critico',
        component: StockCriticalComponent,
        title: 'A2H - Estoque Crítico',
      },
      {
        path: 'almoxarifado/movimentacoes/ajustes',
        component: StockAdjustmentComponent,
        title: 'A2H - Ajustes',
      },
      {
        path: 'almoxarifado/movimentacoes/entradas',
        component: ReceivingListComponent,
        title: 'A2H - Entradas',
      },
      {
        path: 'almoxarifado/movimentacoes/entradas/nova',
        component: ReceivingCreateComponent,
        title: 'A2H - Nova Entrada',
      },
      {
        path: 'almoxarifado/movimentacoes/historico',
        component: StockMovementComponent,
        title: 'A2H - Histórico de Movimentações',
      },
      {
        path: 'almoxarifado/movimentacoes/saidas',
        component: StockShippingComponent,
        title: 'A2H - Saídas',
      },

      {
        path: 'sobre',
        component: AboutComponent,
        title: 'A2H - Sobre',
      },

    ],
  },

  {
    path: '**',
    component: NotFoundComponent,
    title: 'Araras Health Hub',
  },
];
