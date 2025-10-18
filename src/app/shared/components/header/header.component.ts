import { Component, OnInit, ViewChild } from '@angular/core';
import { PrimeIcons, MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { AvatarModule } from 'primeng/avatar';
import { Menu, MenuModule } from 'primeng/menu';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AccountInfo } from '../../../core/interfaces/account-info';
import { UserScopes } from '../../../core/constants/auth.constants';

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

  currentUser: AccountInfo | null = null;
  private userSubscription!: Subscription;

  isManagementScope = false;
  isOperationalScope = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isManagementScope = this.authService.hasScope([UserScopes.MANAGEMENT]);
      this.isOperationalScope = this.authService.hasScope([UserScopes.OPERATIONAL]);
      this.initializeMenuItems();
      this.updateAvatarMenu();
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  private initializeMenuItems(): void {
    const canAccessOrders = this.isManagementScope || this.isOperationalScope;
    const canAccessManagement = this.isManagementScope;

    const baseItems: MenuItem[] = [
      {
        label: 'Home',
        icon: PrimeIcons.HOME,
        routerLink: '/',
      },
    ];

    if (canAccessManagement) {
      baseItems.push({
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
      });
    }

    if (canAccessManagement) {
      baseItems.push({
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
              { separator: true },
              {
                label: 'Histórico',
                icon: PrimeIcons.LIST,
                routerLink: '/almoxarifado/movimentacoes/historico',
              },
              { separator: true },
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
      });
    }

    if (canAccessOrders) {
      baseItems.push({
        label: 'Pedidos',
        icon: PrimeIcons.SHOPPING_CART,
        items: [
          {
            label: 'Novo Pedido',
            icon: PrimeIcons.PLUS_CIRCLE,
            routerLink: '/pedidos/novo',
          },
          { separator: true },
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
          { separator: true },
          {
            label: 'Histórico',
            icon: PrimeIcons.LIST,
            routerLink: '/pedidos/historico',
          },
        ]
      });
    }

    if (canAccessManagement) {
      baseItems.push({
        label: 'Nova Entrada',
        icon: PrimeIcons.PLUS_CIRCLE,
        routerLink: '/almoxarifado/movimentacoes/entradas/nova',
      });
    }

    if (canAccessOrders) {
      baseItems.push({
        label: 'Novo Pedido',
        icon: PrimeIcons.PLUS_CIRCLE,
        routerLink: '/pedidos/novo',
      });
    }

    this.items = baseItems;
  }

  private updateAvatarMenu(): void {
    const userInfo: MenuItem[] = [];

    if (this.currentUser) {
      userInfo.push({
        label: `Conta: ${this.currentUser.userName}`,
        icon: PrimeIcons.USER,
        styleClass: 'text-sm cursor-default',
        disabled: true
      });

      userInfo.push({
        label: `Escopo: ${this.currentUser.scope}`,
        icon: PrimeIcons.FLAG,
        styleClass: 'text-sm cursor-default',
        disabled: true
      });

      const rolesString = this.currentUser.roles.join(' / ');
      userInfo.push({
        label: `Função: ${rolesString}`,
        icon: PrimeIcons.SHIELD,
        styleClass: 'text-sm mb-2 cursor-default',
        disabled: true
      });

      userInfo.push({ separator: true });
    }

    const actions: MenuItem[] = [
      {
        label: 'Perfil da Unidade',
        icon: PrimeIcons.ID_CARD,
        routerLink: '/administracao/unidades/perfil',
      },
      {
        label: 'Sobre',
        icon: PrimeIcons.INFO_CIRCLE,
        routerLink: '/sobre',
      },
      {
        separator: true,
      },
      {
        label: 'Sair',
        icon: PrimeIcons.POWER_OFF,
        command: () => this.logout(),
      },
    ];
    this.avatarItems = [...userInfo, ...actions];
  }

  toggleMenu(event: MouseEvent) {
    this.menu.toggle(event);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
