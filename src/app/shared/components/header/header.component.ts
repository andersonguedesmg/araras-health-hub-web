import { Component, computed, inject, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MenuItem, PrimeIcons } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { Menu, MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { TooltipModule } from 'primeng/tooltip';

import {
  SCOPE_LABEL_MAPPING,
  UserScopes,
} from '../../../core/constants/auth.constants';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ThemeService } from '../../services/theme/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MenubarModule,
    AvatarModule,
    MenuModule,
    ButtonModule,
    RouterModule,
    TooltipModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  host: {
    class: 'block w-full sticky top-0 z-[100]',
  },
})
export class HeaderComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly themeService = inject(ThemeService);

  @ViewChild('menu') menu!: Menu;

  readonly themeIcon = computed(() => {
    return this.themeService.currentTheme() === 'light'
      ? PrimeIcons.SUN
      : PrimeIcons.MOON;
  });

  readonly userInitial = computed(() => {
    const user = this.authService.currentUser();
    if (user?.userName && user.userName.length > 0) {
      return user.userName.charAt(0).toUpperCase();
    }
    return '';
  });

  readonly items = computed<MenuItem[]>(() => {
    const user = this.authService.currentUser();
    if (!user) return [];

    const isManagement =
      user.scope === SCOPE_LABEL_MAPPING[UserScopes.MANAGEMENT];
    const isOperational =
      user.scope === SCOPE_LABEL_MAPPING[UserScopes.OPERATIONAL];
    const hasOrderAccess = isManagement || isOperational;

    const navItems: MenuItem[] = [
      { label: 'Home', icon: PrimeIcons.HOME, routerLink: '/' },
    ];

    if (isManagement) {
      navItems.push({
        label: 'Administração',
        icon: PrimeIcons.SLIDERS_H,
        items: [
          {
            label: 'Visão Geral',
            icon: PrimeIcons.TH_LARGE,
            routerLink: '/administracao',
          },
          { separator: true },
          {
            label: 'Organização',
            icon: PrimeIcons.SITEMAP,
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
                routerLink: '/administracao/contas',
              },
            ],
          },
          {
            label: 'Suprimentos',
            icon: PrimeIcons.TRUCK,
            items: [
              {
                label: 'Fornecedores',
                icon: PrimeIcons.ADDRESS_BOOK,
                routerLink: '/administracao/fornecedores',
              },
              {
                label: 'Materiais',
                icon: PrimeIcons.BOX,
                items: [
                  {
                    label: 'Itens',
                    icon: PrimeIcons.BARS,
                    routerLink: '/administracao/suprimentos/itens',
                  },
                  {
                    label: 'Categorias',
                    icon: PrimeIcons.TAGS,
                    routerLink: '/administracao/suprimentos/categorias',
                  },
                  {
                    label: 'Acondicionamento',
                    icon: PrimeIcons.INBOX,
                    routerLink: '/administracao/suprimentos/acondicionamento',
                  },
                ],
              },
            ],
          },
        ],
      });

      navItems.push({
        label: 'Almoxarifado',
        icon: PrimeIcons.BUILDING_COLUMNS,
        items: [
          {
            label: 'Estoque',
            icon: PrimeIcons.BOX,
            items: [
              {
                label: 'Estoque Geral',
                icon: PrimeIcons.DATABASE,
                routerLink: '/almoxarifado/estoque/geral',
              },
              {
                label: 'Estoque Crítico',
                icon: PrimeIcons.EXCLAMATION_TRIANGLE,
                routerLink: '/almoxarifado/estoque/critico',
              },
              {
                label: 'Lotes Ativos',
                icon: PrimeIcons.BARCODE,
                routerLink: '/almoxarifado/estoque/lotes-ativos',
              },
              {
                label: 'Vencimento Próximo',
                icon: PrimeIcons.CALENDAR_TIMES,
                routerLink: '/almoxarifado/estoque/proximo-vencimento',
              },
            ],
          },
          {
            label: 'Movimentações',
            icon: PrimeIcons.SYNC,
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
                label: 'Histórico Geral',
                icon: PrimeIcons.HISTORY,
                routerLink: '/almoxarifado/movimentacoes/historico',
              },
              { separator: true },
              {
                label: 'Entradas Realizadas',
                icon: PrimeIcons.FILE_IMPORT,
                routerLink: '/almoxarifado/movimentacoes/entradas',
              },
              {
                label: 'Saídas Realizadas',
                icon: PrimeIcons.FILE_EXPORT,
                routerLink: '/almoxarifado/movimentacoes/saidas',
              },
              {
                label: 'Ajustes Efetuados',
                icon: PrimeIcons.SLIDERS_V,
                routerLink: '/almoxarifado/movimentacoes/ajustes',
              },
            ],
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
            ],
          },
        ],
      });
    }

    if (hasOrderAccess) {
      navItems.push({
        label: 'Pedidos',
        icon: PrimeIcons.SHOPPING_CART,
        items: [
          {
            label: 'Aguardando Aprovação',
            icon: PrimeIcons.CLOCK,
            routerLink: '/pedidos/aprovar',
          },
          ...(isManagement
            ? [
                {
                  label: 'Aguardando Separação',
                  icon: PrimeIcons.LIST_CHECK,
                  routerLink: '/pedidos/separar',
                },
              ]
            : []),
          {
            label: 'Aguardando Finalização',
            icon: PrimeIcons.CHECK_SQUARE,
            routerLink: '/pedidos/finalizar',
          },
          { separator: true },
          {
            label: 'Cancelados',
            icon: PrimeIcons.BAN,
            routerLink: '/pedidos/cancelados',
          },
          {
            label: 'Finalizados',
            icon: PrimeIcons.CHECK_CIRCLE,
            routerLink: '/pedidos/finalizados',
          },
          {
            label: 'Histórico Completo',
            icon: PrimeIcons.LIST,
            routerLink: '/pedidos/historico',
          },
          { separator: true },
          {
            label: 'Novo Pedido',
            icon: PrimeIcons.PLUS_CIRCLE,
            routerLink: '/pedidos/novo',
          },
        ],
      });
    }

    return navItems;
  });

  readonly avatarItems = computed<MenuItem[]>(() => {
    const user = this.authService.currentUser();
    if (!user) return [];

    return [
      {
        label: `Usuário: ${user.userName}`,
        icon: PrimeIcons.USER,
        disabled: true,
      },
      { label: `Escopo: ${user.scope}`, icon: PrimeIcons.FLAG, disabled: true },
      {
        label: `Função: ${user.role}`,
        icon: PrimeIcons.SHIELD,
        disabled: true,
      },
      { separator: true },
      {
        label: 'Perfil da Unidade',
        icon: PrimeIcons.BUILDING,
        routerLink: '/administracao/unidades/perfil',
      },
      {
        label: 'Sobre o Sistema',
        icon: PrimeIcons.INFO_CIRCLE,
        routerLink: '/sobre',
      },
      { separator: true },
      {
        label: 'Sair do Sistema',
        icon: PrimeIcons.POWER_OFF,
        command: () => this.logout(),
      },
    ];
  });

  toggleThemeCycle(): void {
    this.themeService.toggleThemeCycle();
  }

  toggleMenu(event: MouseEvent): void {
    this.menu.toggle(event);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
