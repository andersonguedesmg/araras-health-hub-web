import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest } from '../interfaces/loginRequest';
import { LoginResponse } from '../interfaces/loginResponse';
import { ApiConfigService } from '../../shared/services/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    const url = this.apiConfig.getAccountUrl('login');
    return this.http.post<LoginResponse>(url, credentials).pipe(
      tap((response) => {
        if (response.data && response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('destinationId', response.data.destinationId.toString());
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('destinationId');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getDestinationId(): string | null {
    return localStorage.getItem('destinationId');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
