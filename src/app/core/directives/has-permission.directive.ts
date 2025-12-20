import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { UserScopes } from '../constants/auth.constants';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[appHasPermission]'
})
export class HasPermissionDirective {
  private _requiredRoles: string[] = [];
  private _requiredScopes: (UserScopes | string)[] = [];

  constructor(
    private authService: AuthService,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) { }

  @Input() set appHasPermission(roles: string[] | string) {
    this._requiredRoles = Array.isArray(roles) ? roles : [roles];
    this.updateView();
  }

  @Input('appHasPermissionScope') set appHasPermissionScope(scopes: UserScopes | UserScopes[] | string | string[]) {
    if (!scopes) {
      this._requiredScopes = [];
    } else {
      this._requiredScopes = Array.isArray(scopes) ? scopes : [scopes];
    }
    this.updateView();
  }

  private updateView(): void {
    const userRoles = this.authService.getUserRoles() || [];

    const hasRole = this._requiredRoles.length === 0 ||
      this._requiredRoles.some(role => userRoles.includes(role));

    const hasScope = this._requiredScopes.length === 0 ||
      this.authService.hasScope(this._requiredScopes as UserScopes[]);

    if (hasRole && hasScope) {
      if (this.viewContainer.length === 0) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    } else {
      this.viewContainer.clear();
    }
  }
}
