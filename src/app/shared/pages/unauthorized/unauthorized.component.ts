import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterModule, ButtonModule, BreadcrumbComponent],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.scss',
  host: {
    class: 'block w-full h-full overflow-hidden',
  },
})
export class UnauthorizedComponent {
  readonly itemsBreadcrumb = signal([
    { label: 'Acesso Restrito', routerLink: '/403' },
  ]);
}
