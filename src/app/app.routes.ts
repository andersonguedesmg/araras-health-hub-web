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
import { StockMinimumQuantityComponent } from './features/stock/components/stock-minimum-quantity/stock-minimum-quantity.component';
import { scopeGuard } from './core/guards/scope.guard';
import { UserRoles, UserScopes } from './core/constants/auth.constants';
import { StockAdjustmentCreateComponent } from './features/stock/components/stock-adjustment-create/stock-adjustment-create.component';

const SCOPE_MANAGEMENT = [UserScopes.MANAGEMENT];
const SCOPE_ALL_OPS = [UserScopes.MANAGEMENT, UserScopes.OPERATIONAL];

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
    path: '',
    component: HomeComponent,
    title: 'Araras Health Hub',
    canActivate: [authGuard],
  },
  {
    path: 'sobre',
    component: AboutComponent,
    title: 'A2H - Sobre',
    canActivate: [authGuard],
  },

  {
    path: '',
    canActivate: [authGuard],
    children: [
      // ADMINISTRAÇÃO
      {
        path: 'administracao/contas',
        component: AccountListComponent,
        title: 'A2H - Contas',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_MANAGEMENT }
      },
      {
        path: 'administracao/contas/registrar',
        component: RegisterComponent,
        title: 'A2H - Registro',
        canActivate: [scopeGuard, roleGuard],
        data: { scopes: SCOPE_MANAGEMENT, roles: [UserRoles.ADMIN, UserRoles.MASTER] }
      },
      {
        path: 'administracao/fornecedores',
        component: SupplierListComponent,
        title: 'A2H - Fornecedores',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_MANAGEMENT }
      },
      {
        path: 'administracao/funcionarios',
        component: EmployeeListComponent,
        title: 'A2H - Funcionário',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_MANAGEMENT }
      },
      {
        path: 'administracao/produtos',
        component: ProductListComponent,
        title: 'A2H - Produtos',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_MANAGEMENT }
      },
      {
        path: 'administracao/unidades',
        component: FacilityListComponent,
        title: 'A2H - Unidades',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_MANAGEMENT }
      },
      {
        path: 'administracao/unidades/perfil',
        component: FacilityProfileComponent,
        title: 'A2H - Perfil da Unidade',
        canActivate: [scopeGuard],
      },

      // PEDIDOS
      {
        path: 'pedidos/aprovar',
        component: OrderApproveComponent,
        title: 'A2H - Pedidos para Aprovação',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_ALL_OPS }
      },
      {
        path: 'pedidos/finalizados',
        component: OrderCompletedComponent,
        title: 'A2H - Pedidos Finalizados',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_ALL_OPS }
      },
      {
        path: 'pedidos/finalizar',
        component: OrderFinalizeComponent,
        title: 'A2H - Pedidos para Finalização',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_ALL_OPS }
      },
      {
        path: 'pedidos/historico',
        component: OrderListComponent,
        title: 'A2H - Histórico de Pedidos',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_ALL_OPS }
      },
      {
        path: 'pedidos/novo',
        component: OrderCreateComponent,
        title: 'A2H - Novo Pedido',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_ALL_OPS }
      },
      {
        path: 'pedidos/separar',
        component: OrderSeparateComponent,
        title: 'A2H - Pedidos para Separação',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_ALL_OPS }
      },

      // ALMOXARIFADO
      {
        path: 'almoxarifado/estoque/geral',
        component: StockListComponent,
        title: 'A2H - Estoque Geral',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_MANAGEMENT }
      },
      {
        path: 'almoxarifado/estoque/critico',
        component: StockCriticalComponent,
        title: 'A2H - Estoque Crítico',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_MANAGEMENT }
      },
      {
        path: 'almoxarifado/configuracoes/estoque-minimo',
        component: StockMinimumQuantityComponent,
        title: 'A2H - Estoque Mínimo',
        canActivate: [scopeGuard, roleGuard],
        data: { scopes: SCOPE_MANAGEMENT, roles: [UserRoles.ADMIN, UserRoles.MASTER] }
      },
      {
        path: 'almoxarifado/movimentacoes/ajustes',
        component: StockAdjustmentComponent,
        title: 'A2H - Ajustes',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_MANAGEMENT }
      },
      {
        path: 'almoxarifado/movimentacoes/ajustes/novo',
        component: StockAdjustmentCreateComponent,
        title: 'A2H - Novo Ajuste Manual',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_MANAGEMENT }
      },
      {
        path: 'almoxarifado/movimentacoes/entradas',
        component: ReceivingListComponent,
        title: 'A2H - Entradas',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_MANAGEMENT }
      },
      {
        path: 'almoxarifado/movimentacoes/entradas/nova',
        component: ReceivingCreateComponent,
        title: 'A2H - Nova Entrada',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_MANAGEMENT }
      },
      {
        path: 'almoxarifado/movimentacoes/historico',
        component: StockMovementComponent,
        title: 'A2H - Histórico de Movimentações',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_MANAGEMENT }
      },
      {
        path: 'almoxarifado/movimentacoes/saidas',
        component: StockShippingComponent,
        title: 'A2H - Saídas',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_MANAGEMENT }
      },
    ],
  },

  {
    path: '**',
    component: NotFoundComponent,
    title: 'Araras Health Hub',
  },
];
