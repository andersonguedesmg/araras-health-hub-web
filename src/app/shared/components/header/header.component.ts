import { Component, OnInit } from '@angular/core';
import { MegaMenuItem, PrimeIcons } from 'primeng/api';
import { MegaMenu } from 'primeng/megamenu';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-header',
  imports: [MegaMenu, AvatarModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  items: MegaMenuItem[] | undefined;

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
      {
        label: 'Sobre',
        icon: PrimeIcons.COMPASS,
        routerLink: '/sobre',
      }
    ];
  }
}
