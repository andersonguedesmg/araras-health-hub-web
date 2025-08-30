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
            icon: PrimeIcons.USERS,
            routerLink: '/funcionarios',
          },
          {
            label: 'Unidades',
            icon: PrimeIcons.BUILDING,
            routerLink: '/unidades',
          },
          {
            label: 'Contas',
            icon: PrimeIcons.ID_CARD,
            items: [
              {
                label: 'Gerenciar',
                icon: PrimeIcons.LIST,
                routerLink: '/contas',
              },
              {
                label: 'Registrar',
                icon: PrimeIcons.PLUS,
                routerLink: '/registrar',
              },
            ]
          },
          {
            label: 'Fornecedores',
            icon: PrimeIcons.TRUCK,
            routerLink: '/fornecedores',
          },
          {
            label: 'Produtos',
            icon: PrimeIcons.BOX,
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
            items: [
              {
                label: 'Estoque Geral',
                icon: PrimeIcons.BOX,
                routerLink: '/estoque',
              },
              {
                label: 'Estoque Crítico',
                icon: PrimeIcons.EXCLAMATION_TRIANGLE,
                routerLink: '/estoque/critico',
              }
            ]
          },
          {
            label: 'Movimentações',
            icon: PrimeIcons.HISTORY,
            items: [
              {
                label: 'Nova Entrada',
                icon: PrimeIcons.PLUS_CIRCLE,
                routerLink: '/entrada/nova',
              },
              {
                label: 'Ajuste Manual',
                icon: PrimeIcons.PENCIL,
                routerLink: '/estoque/ajuste',
              },
              {
                separator: true,
              },
              {
                label: 'Histórico',
                icon: PrimeIcons.LIST,
                routerLink: '/movimentacoes',
              },
              {
                separator: true,
              },
              {
                label: 'Entradas',
                icon: PrimeIcons.FILE_IMPORT,
                routerLink: '/entradas',
              },
              {
                label: 'Saídas',
                icon: PrimeIcons.FILE_EXPORT,
                routerLink: '/saidas',
              },
              {
                label: 'Ajustes',
                icon: PrimeIcons.TABLE,
                routerLink: '/estoque/ajustes',
              },
            ]
          },
          {
            label: 'Configurações',
            icon: PrimeIcons.COG,
            items: [
              {
                label: 'Estoque Mínimo',
                icon: PrimeIcons.SLIDERS_H,
                routerLink: '/configuracao/estoque-minimo',
              },
            ]
          },
        ]
      },
      {
        label: 'Pedidos',
        icon: PrimeIcons.SHOPPING_CART,
        items: [
          {
            label: 'Novo Pedido',
            icon: PrimeIcons.PLUS_CIRCLE,
            routerLink: '/pedido/novo',
          },
          {
            separator: true,
          },
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
            icon: PrimeIcons.CHECK_SQUARE,
            routerLink: '/pedido/finalizar',
          },
          {
            label: 'Finalizados',
            icon: PrimeIcons.CHECK_CIRCLE,
            routerLink: '/pedidos/finalizados',
          },
          {
            separator: true,
          },
          {
            label: 'Histórico',
            icon: PrimeIcons.LIST,
            routerLink: '/pedidos',
          },
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
        label: 'Sair',
        icon: PrimeIcons.POWER_OFF,
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
