import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  readonly currentYear: number = new Date().getFullYear();
}
