import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from 'rxjs';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { LoginRequest } from '../interfaces/login-request';
import { ApiConfigService } from '../../shared/services/api-config.service';
import { Account } from '../interfaces/account';
import { Router } from '@angular/router';
import { BaseApiResponse } from '../../shared/interfaces/base-api-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  public isLoggedIn$ = this.loggedInSubject.asObservable();

  constructor(private http: HttpClient, private apiConfig: ApiConfigService, private router: Router) { }

  login(credentials: LoginRequest): Observable<BaseApiResponse<Account>> {
    const url = this.apiConfig.getUrl('account', 'login');

    return this.http.post<BaseApiResponse<Account>>(url, credentials).pipe(
      tap(response => {
        if (response.success && response.data?.token) {
          this.saveAuthData(response.data);
          this.loggedInSubject.next(true);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Erro no login:', error);
        const errorMessage = error.error?.message || 'Erro de autenticação desconhecido. Por favor, verifique suas credenciais.';
        this.loggedInSubject.next(false);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  private saveAuthData(account: Account): void {
    if (account.token) {
      localStorage.setItem('token', account.token);
      localStorage.setItem('facilityId', account.facilityId.toString());
      localStorage.setItem('userId', account.userId.toString());
      localStorage.setItem('userName', account.userName);
      const roleNames = account.roles.map(role => role.name);
      localStorage.setItem('roles', JSON.stringify(roleNames));
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('facilityId');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('roles');
    this.loggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserRoles(): string[] {
    const roles = localStorage.getItem('roles');
    return roles ? JSON.parse(roles) : [];
  }

  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
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

  /**
   * Verifica se um token expirou.
   * @returns True se o token expirou ou não existe, false caso contrário.
   */
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

  /**
   * Verifica se o token irá expirar em breve (em menos de 5 minutos).
   * @returns True se o token estiver prestes a expirar, false caso contrário.
   */
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
