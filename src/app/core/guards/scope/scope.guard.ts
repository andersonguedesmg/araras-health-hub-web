import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import {
  SCOPE_LABEL_MAPPING,
  UserScopes,
} from '../../constants/auth.constants';
import { AuthService } from '../../services/auth/auth.service';

export const scopeGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredScopes = route.data['scopes'] as UserScopes[] | undefined;

  if (!requiredScopes || requiredScopes.length === 0) {
    return true;
  }

  const user = authService.currentUser();
  if (user) {
    const hasValidScope = requiredScopes.some(
      (scope) => SCOPE_LABEL_MAPPING[scope] === user.scope,
    );

    if (hasValidScope) {
      return true;
    }
  }

  return router.createUrlTree(['/unauthorized']);
};
