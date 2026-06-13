import { Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterModule, ButtonModule, BreadcrumbComponent],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class UnauthorizedComponent {
  readonly itemsBreadcrumb = [{ label: 'Acesso Restrito', routerLink: '/403' }];
}
