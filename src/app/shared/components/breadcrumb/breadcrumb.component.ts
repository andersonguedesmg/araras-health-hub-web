import { CommonModule } from '@angular/common';
import { Component, computed, input, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem, PrimeIcons } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, BreadcrumbModule, RouterModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class BreadcrumbComponent {
  itemsBreadcrumb = input.required<MenuItem[]>();

  protected readonly home: MenuItem = {
    icon: PrimeIcons.HOME,
    routerLink: '/',
  };

  protected items = computed(() => this.itemsBreadcrumb());
}
