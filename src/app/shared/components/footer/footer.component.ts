import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  host: {
    class: 'block w-full',
  },
})
export class FooterComponent {
  private readonly START_YEAR = 2025;
  private readonly currentYear = signal<number>(new Date().getFullYear());

  readonly copyrightText = computed<string>(() => {
    const year = this.currentYear();
    if (year > this.START_YEAR) {
      return `${this.START_YEAR} - ${year}`;
    }
    return `${this.START_YEAR}`;
  });
}
