import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { SCOPE_LABEL_MAPPING, UserScopes } from '../constants/auth.constants';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private readonly authService = inject(AuthService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);

  private readonly requiredRoles = signal<string[]>([]);
  private readonly requiredScopes = signal<string[]>([]);

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();

      if (!user) {
        this.viewContainer.clear();
        return;
      }

      const roles = this.requiredRoles();
      const scopes = this.requiredScopes();

      const hasRole = roles.length === 0 || roles.includes(user.role);
      const hasScope = scopes.length === 0 || scopes.includes(user.scope);

      if (hasRole && hasScope) {
        if (this.viewContainer.length === 0) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        }
      } else {
        this.viewContainer.clear();
      }
    });
  }

  @Input() set appHasPermission(roles: string[] | string | undefined) {
    if (!roles) {
      this.requiredRoles.set([]);
    } else {
      this.requiredRoles.set(Array.isArray(roles) ? roles : [roles]);
    }
  }

  @Input('appHasPermissionScope') set appHasPermissionScope(
    scopes: UserScopes | UserScopes[] | string | string[] | undefined,
  ) {
    if (!scopes) {
      this.requiredScopes.set([]);
    } else {
      const scopesArray = Array.isArray(scopes) ? scopes : [scopes];
      const normalizedScopes = scopesArray.map((s) =>
        typeof s === 'number' ? SCOPE_LABEL_MAPPING[s] || '' : s,
      );
      this.requiredScopes.set(normalizedScopes);
    }
  }
}
