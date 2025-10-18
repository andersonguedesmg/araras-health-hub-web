import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree } from '@angular/router';
import { UserScopes } from '../constants/auth.constants';
import { AuthService } from '../services/auth.service';
import { map, Observable } from 'rxjs';

export const scopeGuard: CanActivateFn = (route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredScopes = route.data['scopes'] as UserScopes[];

  if (!requiredScopes || requiredScopes.length === 0) {
    return true;
  }

  return authService.hasScope$(requiredScopes).pipe(
    map(hasScope => {
      if (hasScope) {
        return true;
      } else {
        return router.createUrlTree(['/unauthorized']);
      }
    })
  );
};
