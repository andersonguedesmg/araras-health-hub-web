import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, CanActivateFn, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, Observable } from 'rxjs';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = route.data['roles'] as string[];

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  return authService.hasRole$(requiredRoles).pipe(
    map(hasRole => {
      if (hasRole) {
        return true;
      } else {
        return router.createUrlTree(['/unauthorized']);
      }
    })
  );
};
