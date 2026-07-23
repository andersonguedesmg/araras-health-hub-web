import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule, ButtonModule, BreadcrumbComponent],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
  host: {
    class: 'block w-full h-full overflow-hidden',
  },
})
export class NotFoundComponent {
  readonly itemsBreadcrumb = signal([
    { label: 'Não Encontrado', routerLink: '/404' },
  ]);
}
