import { Injectable, ViewChild } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { ToastSeverities, ToastSummaries } from '../../shared/constants/toast.constants';
import { ToastMessages } from '../../shared/constants/messages.constants';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isLoggedIn()) {
      if (this.authService.isTokenExpiringSoon()) {
        this.toastComponent.showMessage(ToastSeverities.WARN, ToastSummaries.WARN, ToastMessages.SESSION_WILL_EXPIRE_SOON);
      }
      return true;
    } else {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
  }
}
