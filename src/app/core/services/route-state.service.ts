import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RouteStateService {
  private showHeaderSubject = new BehaviorSubject<boolean>(false);
  showHeader$ = this.showHeaderSubject.asObservable();

  constructor(private router: Router, private authService: AuthService) {
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.showHeaderSubject.next(isLoggedIn);
    });
  }
}
