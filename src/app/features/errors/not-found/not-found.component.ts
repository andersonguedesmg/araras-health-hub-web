import { Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule, ButtonModule, BreadcrumbComponent],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class NotFoundComponent {
  itemsBreadcrumb = [{ label: 'Não Encontrado', routerLink: '/404' }];
}
