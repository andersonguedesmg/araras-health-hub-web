import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { BaseApiResponse } from '../../shared/interfaces/base-api-response';
import { ApiConfigService } from '../../shared/services/api-config.service';
import {
  ROLE_LABEL_MAPPING,
  SCOPE_LABEL_MAPPING,
  UserScopes,
} from '../constants/auth.constants';
import {
  Account,
  AccountInfo,
  LoginRequest,
} from '../interfaces/auth.interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);
  private readonly router = inject(Router);

  readonly currentUser = signal<AccountInfo | null>(this.loadUserInfo());
  readonly isLoggedIn = computed(
    () => this.currentUser() !== null && !this.isTokenExpired(),
  );

  login(credentials: LoginRequest): Observable<BaseApiResponse<Account>> {
    const url = this.apiConfig.getUrl('accounts/login');

    return this.http.post<BaseApiResponse<Account>>(url, credentials).pipe(
      tap((response) => {
        if (response && response.data?.token) {
          this.saveAuthData(response.data);
          this.currentUser.set(this.loadUserInfo());
        }
      }),
      catchError((error: HttpErrorResponse) => {
        this.logout();
        return throwError(() => error);
      }),
    );
  }

  private saveAuthData(account: Account): void {
    localStorage.setItem('token', account.token);
    localStorage.setItem('facilityId', account.facilityId.toString());
    localStorage.setItem('userId', account.id.toString());
    localStorage.setItem('userName', account.userName);

    const scopeName = SCOPE_LABEL_MAPPING[account.scope] || 'Unassigned';
    localStorage.setItem('scope', scopeName);

    const roleName = ROLE_LABEL_MAPPING[account.role] || 'User';
    localStorage.setItem('roles', JSON.stringify([roleName]));
  }

  private loadUserInfo(): AccountInfo | null {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    const scope = localStorage.getItem('scope');
    const rolesJson = localStorage.getItem('roles');
    const facilityId = localStorage.getItem('facilityId');
    const userId = localStorage.getItem('userId');

    if (!token || !userName || !scope || !rolesJson || !facilityId || !userId) {
      return null;
    }

    try {
      const roles = JSON.parse(rolesJson);
      const primaryRole = Array.isArray(roles) ? roles[0] : roles;

      return {
        userName,
        scope,
        role: primaryRole || 'User',
        facilityId,
        userId,
      };
    } catch (e) {
      console.error('Erro ao processar as credenciais salvas:', e);
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('facilityId');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('roles');
    localStorage.removeItem('scope');

    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  hasScope(requiredScopes: (UserScopes | string)[]): boolean {
    const user = this.currentUser();
    if (!user) return false;
    return requiredScopes.includes(user.scope);
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    if (!user) return false;
    return user.role === role;
  }

  private isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    try {
      const decoded: JwtPayload = jwtDecode(token);
      return decoded.exp ? decoded.exp * 1000 < Date.now() : true;
    } catch {
      return true;
    }
  }
}
