import { Component, Input, OnInit } from '@angular/core';
import { MenuItem, PrimeIcons } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';

@Component({
  selector: 'app-breadcrumb',
  imports: [Breadcrumb],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent implements OnInit {
  @Input({ required: true }) itemsBreadcrumb!: MenuItem[];

  items: MenuItem[] | undefined;
  home: MenuItem | undefined;

  constructor() { }

  ngOnInit() {
    this.home = { icon: PrimeIcons.HOME, routerLink: '/' };
    this.items = this.itemsBreadcrumb;
  }
}
