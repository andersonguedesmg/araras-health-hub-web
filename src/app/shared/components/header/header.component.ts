import { Component, OnInit, ViewChild } from '@angular/core';
import { PrimeIcons, MenuItem } from 'primeng/api';
import { Menubar, MenubarModule } from 'primeng/menubar';
import { AvatarModule } from 'primeng/avatar';
import { Menu, MenuModule } from 'primeng/menu';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [
    MenubarModule,
    AvatarModule,
    MenuModule,
    CommonModule,
  ],
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
        label: 'Administração',
        icon: PrimeIcons.BRIEFCASE,
        items: [
          {
            label: 'Funcionários',
            icon: PrimeIcons.USER,
            routerLink: '/funcionarios',
          },
          {
            label: 'Unidades',
            icon: PrimeIcons.ADDRESS_BOOK,
            routerLink: '/unidades',
          },
          {
            label: 'Contas',
            icon: PrimeIcons.USERS,
            routerLink: '/contas',
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
        ]
      },
      {
        label: 'Almoxarifado',
        icon: PrimeIcons.WAREHOUSE,
        items: [
          {
            label: 'Estoque',
            icon: PrimeIcons.BOX,
            routerLink: '/estoque',
          },
          {
            label: 'Entradas',
            icon: PrimeIcons.PLUS_CIRCLE,
            routerLink: '/entradas',
          },
          {
            label: 'Saídas',
            icon: PrimeIcons.MINUS_CIRCLE,
            routerLink: '/saidas',
          },
        ]
      },
      {
        label: 'Pedidos',
        icon: PrimeIcons.SHOPPING_CART,
        items: [
          {
            label: 'Aguardando Aprovação',
            icon: PrimeIcons.CLOCK,
            routerLink: '/pedido/aprovar',
          },
          {
            label: 'Aguardando Separação',
            icon: PrimeIcons.LIST_CHECK,
            routerLink: '/pedido/separar',
          },
          {
            label: 'Aguardando Finalização',
            icon: PrimeIcons.CART_PLUS,
            routerLink: '/pedido/finalizar',
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
        label: 'Nova Entrada',
        icon: PrimeIcons.PLUS_CIRCLE,
        routerLink: '/entrada/nova',
      },
      {
        label: 'Novo Pedido',
        icon: PrimeIcons.PLUS_CIRCLE,
        routerLink: '/pedido/novo',
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
