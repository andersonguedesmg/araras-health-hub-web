import { Component, OnInit, ViewChild } from '@angular/core';
import { MegaMenuItem, PrimeIcons } from 'primeng/api';
import { MegaMenu } from 'primeng/megamenu';
import { AvatarModule } from 'primeng/avatar';
import { Menu, MenuModule } from 'primeng/menu';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [MegaMenu, AvatarModule, MenuModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  @ViewChild('menu') menu!: Menu;

  items: MegaMenuItem[] | undefined;
  avatarItems: MegaMenuItem[] | undefined;

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
          [
            {
              label: 'Destinos',
              items: [
                { label: 'Listagem', routerLink: '/destinos', },
                { label: 'Cadastro', routerLink: '/destinos/form', },
              ],
            },
          ],
          [
            {
              label: 'Clientes',
              items: [
                { label: 'Listagem', routerLink: '/clientes', },
                { label: 'Cadastro', routerLink: '/clientes/form', },
              ],
            },
          ],
          [
            {
              label: 'Fornecedores',
              items: [
                { label: 'Listagem', routerLink: '/fornecedores', },
                { label: 'Cadastro', routerLink: '/fornecedores/form', },
              ],
            },
          ],
          [
            {
              label: 'Usuários',
              items: [
                { label: 'Listagem', routerLink: '/usuarios', },
                { label: 'Cadastro', routerLink: '/usuarios/form', },
              ],
            },
          ],
        ],
      },
      {
        label: 'Depósito',
        icon: PrimeIcons.BUILDING_COLUMNS,
        items: [
          [
            {
              label: 'Estoque',
              items: [
                { label: 'Listagem', routerLink: '/estoque', },
                { label: 'Cadastro', routerLink: '/estoque/form', },
              ],
            },
          ],
          [
            {
              label: 'Pedidos',
              items: [
                { label: 'Listagem', routerLink: '/pedidos', },
                { label: 'Cadastro', routerLink: '/pedidos/form', },
              ],
            },
          ],
          [
            {
              label: 'Produtos',
              items: [
                { label: 'Listagem', routerLink: '/produtos', },
                { label: 'Cadastro', routerLink: '/produtos/form', },
              ],
            },
          ],
        ],
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
