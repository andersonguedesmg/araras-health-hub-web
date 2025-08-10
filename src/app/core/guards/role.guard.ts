import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { tap, map } from 'rxjs';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = route.data['roles'] as string[];

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  return authService.hasRole$(requiredRoles).pipe(
    tap(hasRole => {
      if (!hasRole) {
        router.navigate(['/unauthorized']);
      }
    }),
    map(hasRole => hasRole)
  );
};
