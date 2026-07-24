import { Component, OnInit, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimeNG } from 'primeng/config';
import { RouteStateService } from './core/services/route-state/route-state.service';
import { FooterComponent } from './shared/components/footer/footer.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    ToastComponent,
    SpinnerComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private readonly primeng = inject(PrimeNG);
  private readonly routeStateService = inject(RouteStateService);

  readonly showHeader = computed(() => this.routeStateService.showHeader());
  readonly showFooter = computed(() => this.routeStateService.showHeader());

  ngOnInit(): void {
    this.primeng.ripple.set(true);

    this.primeng.zIndex = {
      modal: 1100,
      overlay: 1000,
      menu: 1000,
      tooltip: 1100,
    };
  }
}
