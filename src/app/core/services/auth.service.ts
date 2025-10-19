import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from 'rxjs';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { LoginRequest } from '../interfaces/login-request';
import { ApiConfigService } from '../../shared/services/api-config.service';
import { Account } from '../interfaces/account';
import { Router } from '@angular/router';
import { BaseApiResponse } from '../../shared/interfaces/base-api-response';
import { SCOPE_MAPPING, UserScopes } from '../constants/auth.constants';
import { AccountInfo } from '../interfaces/account-info';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  public isLoggedIn$ = this.loggedInSubject.asObservable();

  private userSubject = new BehaviorSubject<AccountInfo | null>(this.loadUserInfo());
  public currentUser$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private apiConfig: ApiConfigService, private router: Router) { }

  login(credentials: LoginRequest): Observable<BaseApiResponse<Account>> {
    const url = this.apiConfig.getUrl('account', 'login');

    return this.http.post<BaseApiResponse<Account>>(url, credentials).pipe(
      tap(response => {
        if (response.success && response.data?.token) {
          this.saveAuthData(response.data);
          this.loggedInSubject.next(true);
          this.userSubject.next(this.loadUserInfo());
        }
      }),
      catchError((error: HttpErrorResponse) => {
        this.loggedInSubject.next(false);
        this.userSubject.next(null);
        return throwError(() => error);
      })
    );
  }

  private saveAuthData(account: Account): void {
    if (account.token) {
      localStorage.setItem('token', account.token);
      localStorage.setItem('facilityId', account.facilityId.toString());
      localStorage.setItem('userId', account.userId.toString());
      localStorage.setItem('userName', account.userName);

      const scopeName = SCOPE_MAPPING[account.scope];
      if (scopeName) {
        localStorage.setItem('scope', scopeName);
      }

      const roleNames = account.roles.map(role => role.name);
      localStorage.setItem('roles', JSON.stringify(roleNames));
    }
  }

  private loadUserInfo(): AccountInfo | null {
    const userName = localStorage.getItem('userName');
    const scope = localStorage.getItem('scope');
    const rolesJson = localStorage.getItem('roles');

    if (userName && scope && rolesJson) {
      try {
        const roles = JSON.parse(rolesJson);
        return {
          userName: userName,
          scope: scope,
          roles: Array.isArray(roles) ? roles : [roles]
        } as AccountInfo;
      } catch (e) {
        console.error("Erro ao fazer parse das roles:", e);
        return null;
      }
    }
    return null;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('facilityId');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('roles');
    localStorage.removeItem('scope');

    this.loggedInSubject.next(false);
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserScope(): string | null {
    return localStorage.getItem('scope');
  }

  hasScope(requiredScopes: (UserScopes | string)[]): boolean {
    const userScope = this.getUserScope();
    if (!userScope) {
      return false;
    }
    return requiredScopes.includes(userScope);
  }

  hasScope$(requiredScopes: (UserScopes | string)[]): Observable<boolean> {
    return this.isLoggedIn$.pipe(
      map(isLoggedIn => {
        if (!isLoggedIn) {
          return false;
        }
        return this.hasScope(requiredScopes);
      })
    );
  }

  getUserRoles(): string[] {
    const roles = localStorage.getItem('roles');
    return roles ? JSON.parse(roles) : [];
  }

  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }

  hasRole$(requiredRoles: string[]): Observable<boolean> {
    return this.isLoggedIn$.pipe(
      map(isLoggedIn => {
        if (!isLoggedIn) {
          return false;
        }
        const userRoles = this.getUserRoles();
        return requiredRoles.some(role => userRoles.includes(role));
      })
    );
  }

  getFacilityId(): string | null {
    return localStorage.getItem('facilityId');
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  getUserName(): string | null {
    return localStorage.getItem('userName');
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && !this.isTokenExpired();
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }
    try {
      const decodedToken: JwtPayload = jwtDecode(token);
      return decodedToken.exp ? decodedToken.exp * 1000 < Date.now() : true;
    } catch (error) {
      return true;
    }
  }

  isTokenExpiringSoon(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    try {
      const decodedToken: JwtPayload = jwtDecode(token);
      if (!decodedToken.exp) {
        return false;
      }
      const expirationTime = decodedToken.exp * 1000;
      const currentTime = Date.now();
      const timeLeft = expirationTime - currentTime;
      const warningTime = 5 * 60 * 1000;
      return timeLeft < warningTime;
    } catch (error) {
      return false;
    }
  }
}
