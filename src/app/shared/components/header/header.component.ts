import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  inject,
  OnInit,
  signal,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MenuItem, PrimeIcons } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { PrimeNG } from 'primeng/config';
import { Menu, MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import {
  SCOPE_LABEL_MAPPING,
  UserScopes,
} from '../../../core/constants/auth.constants';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MenubarModule,
    AvatarModule,
    MenuModule,
    RouterModule,
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly primeng = inject(PrimeNG);

  @ViewChild('menu') menu!: Menu;

  readonly items = signal<MenuItem[]>([]);
  readonly avatarItems = signal<MenuItem[]>([]);
  readonly currentTheme = signal<'light' | 'dark' | 'system'>('system');

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.initializeMenuItems();
        this.updateAvatarMenu(user.userName, user.scope, user.role);
      }
    });
  }

  ngOnInit(): void {
    this.detectAndApplyTheme();
    this.listenToSystemThemeChanges();
  }

  toggleThemeCycle(): void {
    const modes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
    const nextIndex = (modes.indexOf(this.currentTheme()) + 1) % modes.length;
    const nextMode = modes[nextIndex];

    this.currentTheme.set(nextMode);
    localStorage.setItem('theme', nextMode);
    this.applyTheme(nextMode);

    const user = this.authService.currentUser();
    if (user) this.updateAvatarMenu(user.userName, user.scope, user.role);
  }

  private detectAndApplyTheme(): void {
    const savedTheme =
      (localStorage.getItem('theme') as 'light' | 'dark' | 'system') ||
      'system';
    this.currentTheme.set(savedTheme);
    this.applyTheme(savedTheme);
  }

  private applyTheme(theme: 'light' | 'dark' | 'system'): void {
    const root = document.documentElement;
    let isDark = theme === 'dark';

    if (theme === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    if (isDark) {
      root.classList.add('dark');
      this.primeng.theme.set({
        palette: { primary: { 50: '#ecfdf5', 500: '#10b981', 900: '#064e3b' } },
      });
    } else {
      root.classList.remove('dark');
      this.primeng.theme.set({
        palette: { primary: { 50: '#f0fdf4', 500: '#22c55e', 900: '#14532d' } },
      });
    }
  }

  private listenToSystemThemeChanges(): void {
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', () => {
        if (this.currentTheme() === 'system') {
          this.applyTheme('system');
        }
      });
  }

  private initializeMenuItems(): void {
    const user = this.authService.currentUser();
    if (!user) return;

    const isManagement =
      user.scope === SCOPE_LABEL_MAPPING[UserScopes.MANAGEMENT];
    const isOperational =
      user.scope === SCOPE_LABEL_MAPPING[UserScopes.OPERATIONAL];
    const hasOrderAccess = isManagement || isOperational;

    const baseItems: MenuItem[] = [
      { label: 'Home', icon: PrimeIcons.HOME, routerLink: '/' },
    ];

    if (isManagement) {
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
            ],
          },
          {
            label: 'Fornecedores',
            icon: PrimeIcons.TRUCK,
            routerLink: '/administracao/fornecedores',
          },
          {
            label: 'Catálogo de Produtos',
            icon: PrimeIcons.BOX,
            items: [
              {
                label: 'Produtos',
                icon: PrimeIcons.BARS,
                routerLink: '/administracao/produtos',
              },
              {
                label: 'Categorias',
                icon: PrimeIcons.TAGS,
                routerLink: '/administracao/produtos/categorias',
              },
              {
                label: 'Tipos de Embalagem',
                icon: PrimeIcons.BOX,
                routerLink: '/administracao/produtos/embalagens',
              },
            ],
          },
        ],
      });

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
              },
              {
                label: 'Lotes Ativos',
                icon: PrimeIcons.CLOCK,
                routerLink: '/almoxarifado/estoque/lotes-ativos',
              },
              {
                label: 'Vencimento Próximo',
                icon: PrimeIcons.CLOCK,
                routerLink: '/almoxarifado/estoque/proximo-vencimento',
              },
            ],
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
      baseItems.push({
        label: 'Pedido',
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
            label: 'Cancelado',
            icon: PrimeIcons.BAN,
            routerLink: '/pedidos/cancelados',
          },
          {
            label: 'Finalizado',
            icon: PrimeIcons.CHECK_CIRCLE,
            routerLink: '/pedidos/finalizados',
          },
          {
            label: 'Histórico',
            icon: PrimeIcons.LIST,
            routerLink: '/pedidos/historico',
          },
          { separator: true },
          {
            label: 'Novo',
            icon: PrimeIcons.PLUS_CIRCLE,
            routerLink: '/pedidos/novo',
          },
        ],
      });
    }

    this.items.set(baseItems);
  }

  private updateAvatarMenu(
    username: string,
    scope: string,
    role: string,
  ): void {
    this.avatarItems.set([
      { label: `Conta: ${username}`, icon: PrimeIcons.USER, disabled: true },
      { label: `Escopo: ${scope}`, icon: PrimeIcons.FLAG, disabled: true },
      { label: `Função: ${role}`, icon: PrimeIcons.SHIELD, disabled: true },
      { separator: true },
      {
        label: 'Perfil da Unidade',
        icon: PrimeIcons.ID_CARD,
        routerLink: '/administracao/unidades/perfil',
      },
      { label: 'Sobre', icon: PrimeIcons.INFO_CIRCLE, routerLink: '/sobre' },
      { separator: true },
      {
        label: 'Sair',
        icon: PrimeIcons.POWER_OFF,
        command: () => this.logout(),
      },
    ]);
  }

  toggleMenu(event: MouseEvent): void {
    this.menu.toggle(event);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
