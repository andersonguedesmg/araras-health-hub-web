import { Component, OnInit } from '@angular/core';
import { MenuItem, PrimeIcons } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-header',
  imports: [Menubar, AvatarModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  items: MenuItem[] | undefined;

  ngOnInit() {
    this.items = [
      {
        label: 'Home',
        icon: PrimeIcons.HOME,
        routerLink: '/',
      },
      {
        label: 'Usuários',
        icon: PrimeIcons.USER,
        routerLink: '/usuarios',
      },
      {
        label: 'Usuários F',
        icon: PrimeIcons.USER,
        routerLink: '/usuarios/form',
      },
      {
        label: 'Destinos',
        icon: PrimeIcons.ADDRESS_BOOK,
        routerLink: '/destinos',
      },
      {
        label: 'Clientes',
        icon: PrimeIcons.RECEIPT,
        routerLink: '/clientes',
      },
      {
        label: 'Fornecedores',
        icon: PrimeIcons.SHOP,
        routerLink: '/fornecedores',
      },
      {
        label: 'Produtos',
        icon: PrimeIcons.SHOPPING_BAG,
        routerLink: '/produtos',
      },
      {
        label: 'Estoque',
        icon: PrimeIcons.WAREHOUSE,
        routerLink: '/estoque',
      },
      {
        label: 'Pedidos',
        icon: PrimeIcons.SHOPPING_CART,
        items: [
          {
            label: 'Criado',
            icon: PrimeIcons.PAPERCLIP,
            routerLink: '/pedidos',
          },
          {
            label: 'Aguardando Aprovação',
            icon: PrimeIcons.CLOCK,
            routerLink: '/pedidos',
          },
          {
            label: 'Aprovado',
            icon: PrimeIcons.LIST_CHECK,
            routerLink: '/pedidos',
          },
          {
            label: 'Em Processamento',
            icon: PrimeIcons.CART_ARROW_DOWN,
            routerLink: '/pedidos',
          },
          {
            label: 'Separado',
            icon: PrimeIcons.HOURGLASS,
            routerLink: '/pedidos',
          },
          {
            label: 'Em Transito',
            icon: PrimeIcons.TRUCK,
            routerLink: '/pedidos',
          },
          {
            label: 'Finalizados',
            icon: PrimeIcons.TROPHY,
            items: [
              {
                label: 'Entregue',
                icon: PrimeIcons.CHECK_CIRCLE,
                routerLink: '/pedidos',
              },
              {
                label: 'Cancelado',
                icon: PrimeIcons.TIMES_CIRCLE,
                routerLink: '/pedidos',
              },
              {
                label: 'Devolvido',
                icon: PrimeIcons.UNDO,
                routerLink: '/pedidos',
              }
            ]
          }
        ]
      },
      {
        label: 'Sobre',
        icon: PrimeIcons.COMPASS,
        routerLink: '/sobre',
      }
    ];
  }
}
