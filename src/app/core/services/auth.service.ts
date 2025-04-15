import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { jwtDecode, JwtPayload } from 'jwt-decode';
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
        localStorage.setItem('facilityId', response.data.facilityId.toString());
        localStorage.setItem('userId', response.data.userId.toString());
        localStorage.setItem('userName', response.data.userName.toString());
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
    localStorage.removeItem('facilityId');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
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
