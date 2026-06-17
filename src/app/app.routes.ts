import { Routes } from '@angular/router';
import { UserRoles, UserScopes } from './core/constants/auth.constants';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { scopeGuard } from './core/guards/scope.guard';

const SCOPE_MANAGEMENT = [UserScopes.MANAGEMENT];
const SCOPE_ALL_OPS = [UserScopes.MANAGEMENT, UserScopes.OPERATIONAL];

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./core/components/login/login.component').then(
        (m) => m.LoginComponent,
      ),
    title: 'A2H - Login',
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./features/errors/unauthorized/unauthorized.component').then(
        (m) => m.UnauthorizedComponent,
      ),
    title: 'Araras Health Hub - Não Autorizado',
  },
  {
    path: '',
    loadComponent: () =>
      import('./shared/pages/home/home.component').then((m) => m.HomeComponent),
    title: 'Araras Health Hub',
    canActivate: [authGuard],
  },
  {
    path: 'sobre',
    loadComponent: () =>
      import('./features/about/about/about.component').then(
        (m) => m.AboutComponent,
      ),
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
        loadComponent: () =>
          import('./features/account/components/account-list/account-list.component').then(
            (m) => m.AccountListComponent,
          ),
        title: 'A2H - Contas',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_MANAGEMENT },
      },
      {
        path: 'administracao/contas/registrar',
        loadComponent: () =>
          import('./core/components/register/register.component').then(
            (m) => m.RegisterComponent,
          ),
        title: 'A2H - Registro',
        canActivate: [scopeGuard, roleGuard],
        data: {
          scopes: SCOPE_MANAGEMENT,
          roles: [UserRoles.ADMIN, UserRoles.MASTER],
        },
      },
      {
        path: 'administracao/fornecedores',
        loadComponent: () =>
          import('./features/supplier/components/supplier-container/supplier-container.component').then(
            (m) => m.SupplierContainerComponent,
          ),
        title: 'A2H - Fornecedores',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_MANAGEMENT },
      },
      {
        path: 'administracao/funcionarios',
        loadComponent: () =>
          import('./features/employee/components/employee-list/employee-list.component').then(
            (m) => m.EmployeeListComponent,
          ),
        title: 'A2H - Funcionários',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_MANAGEMENT },
      },
      {
        path: 'administracao/produtos',
        loadComponent: () =>
          import('./features/product/components/product-list/product-list.component').then(
            (m) => m.ProductListComponent,
          ),
        title: 'A2H - Produtos',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_MANAGEMENT },
      },
      {
        path: 'administracao/unidades',
        loadComponent: () =>
          import('./features/facility/components/facility-list/facility-list.component').then(
            (m) => m.FacilityListComponent,
          ),
        title: 'A2H - Unidades',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_MANAGEMENT },
      },
      {
        path: 'administracao/unidades/perfil',
        loadComponent: () =>
          import('./features/facility/components/facility-profile/facility-profile.component').then(
            (m) => m.FacilityProfileComponent,
          ),
        title: 'A2H - Perfil da Unidade',
        canActivate: [scopeGuard],
      },

      // PEDIDOS
      {
        path: 'pedidos/aprovar',
        loadComponent: () =>
          import('./features/order/components/order-approve/order-approve.component').then(
            (m) => m.OrderApproveComponent,
          ),
        title: 'A2H - Pedidos para Aprovação',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_ALL_OPS },
      },
      {
        path: 'pedidos/cancelados',
        loadComponent: () =>
          import('./features/order/components/order-cancel/order-cancel.component').then(
            (m) => m.OrderCancelComponent,
          ),
        title: 'A2H - Pedidos Cancelados',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_ALL_OPS },
      },
      {
        path: 'pedidos/finalizados',
        loadComponent: () =>
          import('./features/order/components/order-completed/order-completed.component').then(
            (m) => m.OrderCompletedComponent,
          ),
        title: 'A2H - Pedidos Finalizados',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_ALL_OPS },
      },
      {
        path: 'pedidos/finalizar',
        loadComponent: () =>
          import('./features/order/components/order-finalize/order-finalize.component').then(
            (m) => m.OrderFinalizeComponent,
          ),
        title: 'A2H - Pedidos para Finalização',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_ALL_OPS },
      },
      {
        path: 'pedidos/historico',
        loadComponent: () =>
          import('./features/order/components/order-list/order-list.component').then(
            (m) => m.OrderListComponent,
          ),
        title: 'A2H - Histórico de Pedidos',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_ALL_OPS },
      },
      {
        path: 'pedidos/novo',
        loadComponent: () =>
          import('./features/order/components/order-create/order-create.component').then(
            (m) => m.OrderCreateComponent,
          ),
        title: 'A2H - Novo Pedido',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_ALL_OPS },
      },
      {
        path: 'pedidos/separar',
        loadComponent: () =>
          import('./features/order/components/order-separate/order-separate.component').then(
            (m) => m.OrderSeparateComponent,
          ),
        title: 'A2H - Pedidos para Separação',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_ALL_OPS },
      },

      // ALMOXARIFADO
      {
        path: 'almoxarifado/estoque/geral',
        loadComponent: () =>
          import('./features/stock/components/stock-list/stock-list.component').then(
            (m) => m.StockListComponent,
          ),
        title: 'A2H - Estoque Geral',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_MANAGEMENT },
      },
      {
        path: 'almoxarifado/estoque/critico',
        loadComponent: () =>
          import('./features/stock/components/stock-critical/stock-critical.component').then(
            (m) => m.StockCriticalComponent,
          ),
        title: 'A2H - Estoque Crítico',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_MANAGEMENT },
      },
      {
        path: 'almoxarifado/estoque/lotes-ativos',
        loadComponent: () =>
          import('./features/stock/components/stock-active-lots/stock-active-lots.component').then(
            (m) => m.StockActiveLotsComponent,
          ),
        title: 'A2H - Lotes Ativos',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_MANAGEMENT },
      },
      {
        path: 'almoxarifado/estoque/proximo-vencimento',
        loadComponent: () =>
          import('./features/stock/components/stock-near-expiry-lots/stock-near-expiry-lots.component').then(
            (m) => m.StockNearExpiryLotsComponent,
          ),
        title: 'A2H - Vencimento Próximo',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_MANAGEMENT },
      },
      {
        path: 'almoxarifado/configuracoes/estoque-minimo',
        loadComponent: () =>
          import('./features/stock/components/stock-minimum-quantity/stock-minimum-quantity.component').then(
            (m) => m.StockMinimumQuantityComponent,
          ),
        title: 'A2H - Estoque Mínimo',
        canActivate: [scopeGuard, roleGuard],
        data: {
          scopes: SCOPE_MANAGEMENT,
          roles: [UserRoles.ADMIN, UserRoles.MASTER],
        },
      },
      {
        path: 'almoxarifado/movimentacoes/ajustes',
        loadComponent: () =>
          import('./features/stock/components/stock-adjustment/stock-adjustment.component').then(
            (m) => m.StockAdjustmentComponent,
          ),
        title: 'A2H - Ajustes',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_MANAGEMENT },
      },
      {
        path: 'almoxarifado/movimentacoes/ajustes/novo',
        loadComponent: () =>
          import('./features/stock/components/stock-adjustment-create/stock-adjustment-create.component').then(
            (m) => m.StockAdjustmentCreateComponent,
          ),
        title: 'A2H - Novo Ajuste Manual',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_MANAGEMENT },
      },
      {
        path: 'almoxarifado/movimentacoes/entradas',
        loadComponent: () =>
          import('./features/receiving/components/receiving-list/receiving-list.component').then(
            (m) => m.ReceivingListComponent,
          ),
        title: 'A2H - Entradas',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_MANAGEMENT },
      },
      {
        path: 'almoxarifado/movimentacoes/entradas/nova',
        loadComponent: () =>
          import('./features/receiving/components/receiving-create/receiving-create.component').then(
            (m) => m.ReceivingCreateComponent,
          ),
        title: 'A2H - Nova Entrada',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_MANAGEMENT },
      },
      {
        path: 'almoxarifado/movimentacoes/historico',
        loadComponent: () =>
          import('./features/stock/components/stock-movement/stock-movement.component').then(
            (m) => m.StockMovementComponent,
          ),
        title: 'A2H - Histórico de Movimentações',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_MANAGEMENT },
      },
      {
        path: 'almoxarifado/movimentacoes/saidas',
        loadComponent: () =>
          import('./features/stock/components/stock-shipping/stock-shipping.component').then(
            (m) => m.StockShippingComponent,
          ),
        title: 'A2H - Saídas',
        canActivate: [scopeGuard],
        data: { scopes: SCOPE_MANAGEMENT },
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/errors/not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
    title: 'Araras Health Hub - 404',
  },
];
