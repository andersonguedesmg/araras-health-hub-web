import { Component, computed, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem, PrimeIcons } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [BreadcrumbModule, RouterModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss',
  host: {
    class: 'block w-full',
  },
})
export class BreadcrumbComponent {
  readonly itemsBreadcrumb = input.required<MenuItem[]>();

  protected readonly home: MenuItem = {
    icon: PrimeIcons.HOME,
    routerLink: '/',
  };

  protected items = computed(() => {
    const rawItems = this.itemsBreadcrumb();
    return rawItems.map((item, index) => {
      const isLast = index === rawItems.length - 1;
      return {
        ...item,
        styleClass: isLast
          ? 'text-zinc-800 dark:text-zinc-200 font-semibold cursor-default pointer-events-none hover:bg-transparent'
          : 'text-zinc-500 dark:text-zinc-400 font-medium text-[0.8rem] rounded md:px-1 py-0.5 transition-all duration-150 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white',
      };
    });
  });
}
