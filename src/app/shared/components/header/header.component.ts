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
            routerLink: '/administracao/funcionarios',
          },
          {
            label: 'Unidades',
            icon: PrimeIcons.BUILDING,
            routerLink: '/administracao/unidades',
          },
          {
            label: 'Contas',
            icon: PrimeIcons.ID_CARD,
            items: [
              {
                label: 'Gerenciar',
                icon: PrimeIcons.LIST,
                routerLink: '/administracao/contas',
              },
              {
                label: 'Registrar',
                icon: PrimeIcons.PLUS,
                routerLink: '/administracao/contas/registrar',
              },
            ]
          },
          {
            label: 'Fornecedores',
            icon: PrimeIcons.TRUCK,
            routerLink: '/administracao/fornecedores',
          },
          {
            label: 'Produtos',
            icon: PrimeIcons.BOX,
            routerLink: '/administracao/produtos',
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
                routerLink: '/almoxarifado/estoque/geral',
              },
              {
                label: 'Estoque Crítico',
                icon: PrimeIcons.EXCLAMATION_TRIANGLE,
                routerLink: '/almoxarifado/estoque/critico',
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
                routerLink: '/almoxarifado/movimentacoes/entradas/nova',
              },
              {
                label: 'Ajuste Manual',
                icon: PrimeIcons.PENCIL,
                routerLink: '/almoxarifado/movimentacoes/ajustes/novo',
              },
              {
                separator: true,
              },
              {
                label: 'Histórico',
                icon: PrimeIcons.LIST,
                routerLink: '/almoxarifado/movimentacoes/historico',
              },
              {
                separator: true,
              },
              {
                label: 'Entradas',
                icon: PrimeIcons.FILE_IMPORT,
                routerLink: '/almoxarifado/movimentacoes/entradas',
              },
              {
                label: 'Saídas',
                icon: PrimeIcons.FILE_EXPORT,
                routerLink: '/almoxarifado/movimentacoes/saidas',
              },
              {
                label: 'Ajustes',
                icon: PrimeIcons.TABLE,
                routerLink: '/almoxarifado/movimentacoes/ajustes',
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
                routerLink: '/almoxarifado/configuracoes/estoque-minimo',
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
            routerLink: '/pedidos/novo',
          },
          {
            separator: true,
          },
          {
            label: 'Aguardando Aprovação',
            icon: PrimeIcons.CLOCK,
            routerLink: '/pedidos/aprovar',
          },
          {
            label: 'Aguardando Separação',
            icon: PrimeIcons.LIST_CHECK,
            routerLink: '/pedidos/separar',
          },
          {
            label: 'Aguardando Finalização',
            icon: PrimeIcons.CHECK_SQUARE,
            routerLink: '/pedidos/finalizar',
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
            routerLink: '/pedidos/historico',
          },
        ]
      },
      {
        label: 'Nova Entrada',
        icon: PrimeIcons.PLUS_CIRCLE,
        routerLink: '/almoxarifado/movimentacoes/entradas/nova',
      },
      {
        label: 'Novo Pedido',
        icon: PrimeIcons.PLUS_CIRCLE,
        routerLink: '/pedidos/novo',
      },
    ];

    this.avatarItems = [
      {
        label: 'Perfil',
        icon: PrimeIcons.USER,
        routerLink: '/administracao/unidades/perfil',
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
