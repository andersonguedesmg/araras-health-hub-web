import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable, tap } from 'rxjs';
import { LoginRequest } from '../interfaces/loginRequest';
import { LoginResponse } from '../interfaces/loginResponse';
import { ApiConfigService } from '../../shared/services/api-config.service';
import { ApiResponse } from '../../shared/interfaces/apiResponse';
import { Account } from '../interfaces/account';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const url = this.apiConfig.getAccountUrl('login');
    try {
      const response = await firstValueFrom(this.http.post<LoginResponse>(url, credentials));
      if (response && response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('destinationId', response.data.destinationId.toString());
      }
      return response;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  async register(account: Account): Promise<ApiResponse<Account>> {
    const url = this.apiConfig.getAccountUrl('register');
    return firstValueFrom(this.http.post<ApiResponse<Account>>(url, account));
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
