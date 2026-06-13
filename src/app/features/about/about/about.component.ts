import { Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterModule, ButtonModule, BreadcrumbComponent],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  itemsBreadcrumb = [{ label: 'Sobre', routerLink: '/sobre' }];
}
