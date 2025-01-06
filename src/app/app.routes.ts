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
    path: 'estoque',
    component: StockListComponent,
  },
  {
    path: 'fornecedores',
    component: SupplierListComponent,
  },
  {
    path: 'pedidos',
    component: OrderListComponent,
  },
  {
    path: 'produtos',
    component: ProductListComponent,
  },
  {
    path: 'sobre',
    component: AboutComponent,
  },
  {
    path: 'usuarios',
    component: UserListComponent,
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
