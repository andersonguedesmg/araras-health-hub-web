import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserScopes } from '../constants/auth.constants';

@Directive({
  selector: '[appHasRole]'
})
export class HasRoleDirective {
  private hasPermission = false;

  constructor(
    private authService: AuthService,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) { }

  @Input() set appHasRole(roles: string[]) {
    this.checkPermission(roles);
  }

  @Input() appHasScope: UserScopes | UserScopes[] | undefined;

  private checkPermission(requiredRoles: string[]): void {
    const userRoles = this.authService.getUserRoles();
    const hasRole = requiredRoles.some(role => userRoles.includes(role));

    let hasScope = true;
    if (this.appHasScope) {
      const requiredScopesArray = Array.isArray(this.appHasScope) ? this.appHasScope : [this.appHasScope];
      hasScope = this.authService.hasScope(requiredScopesArray);
    }

    this.hasPermission = hasRole && hasScope;

    if (this.hasPermission) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
