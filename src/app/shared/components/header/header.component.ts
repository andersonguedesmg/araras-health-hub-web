import { Component, OnInit, ViewChild } from '@angular/core';
import { PrimeIcons, MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { AvatarModule } from 'primeng/avatar';
import { Menu, MenuModule } from 'primeng/menu';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [Menubar, AvatarModule, MenuModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  @ViewChild('menu') menu!: Menu;

  items: MenuItem[] | undefined;
  avatarItems: MenuItem[] | undefined;

  isAvatarClickable = true;

  constructor(private authService: AuthService, private router: Router) { }

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
        label: 'Destinos',
        icon: PrimeIcons.ADDRESS_BOOK,
        routerLink: '/destinos',
      },
      {
        label: 'Clientes',
        icon: PrimeIcons.USERS,
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
        label: 'Recebimento',
        icon: PrimeIcons.WAREHOUSE,
        routerLink: '/recebimentos',
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
    ];

    this.avatarItems = [
      {
        label: 'Perfil',
        icon: PrimeIcons.USER,
        routerLink: '/perfil',
      },
      {
        label: 'Sobre',
        icon: PrimeIcons.INFO_CIRCLE,
        routerLink: '/sobre',
      },
      {
        label: 'Registrar',
        icon: PrimeIcons.PLUS_CIRCLE,
        routerLink: '/registrar',
      },
      {
        label: 'Logout',
        icon: PrimeIcons.SIGN_OUT,
        command: () => this.logout(),
      },
    ];
  }

  toggleMenu(event: MouseEvent) {
    this.menu.toggle(event);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
