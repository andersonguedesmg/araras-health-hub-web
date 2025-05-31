import { Component, OnInit } from '@angular/core';
import { PrimeNG } from 'primeng/config';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { RouteStateService } from './core/services/route-state.service';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, ToastComponent, SpinnerComponent, CommonModule, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  showHeader = false;
  showFooter: boolean = false;

  constructor(private primeng: PrimeNG, private routeStateService: RouteStateService) { }

  ngOnInit() {
    this.primeng.ripple.set(true);
    this.primeng.zIndex = {
      modal: 1100,
      overlay: 1000,
      menu: 1000,
      tooltip: 1100
    };

    this.routeStateService.showHeader$.subscribe((show) => {
      this.showHeader = show;
      this.showFooter = show;
    });
  }
}
