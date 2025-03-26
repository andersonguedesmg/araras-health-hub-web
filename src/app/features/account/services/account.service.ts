import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/apiResponse';
import { Account } from '../interfaces/account';
import { ApiConfigService } from '../../../shared/services/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  getAllAccounts(): Observable<ApiResponse<Account[]>> {
    const url = this.apiConfig.getAccountUrl('getAll');
    return this.http.get<ApiResponse<Account[]>>(url);
  }

  async createAccount(account: Account): Promise<ApiResponse<Account>> {
    const url = this.apiConfig.getAccountUrl('register');
    return firstValueFrom(this.http.post<ApiResponse<Account>>(url, account));
  }

  async updateAccount(account: Account, accountId: string): Promise<ApiResponse<Account>> {
    const url = this.apiConfig.getAccountUrl(`update/${accountId}`);
    return firstValueFrom(this.http.put<ApiResponse<Account>>(url, account));
  }

  async deleteAccount(accountId: number): Promise<ApiResponse<Account>> {
    const url = this.apiConfig.getAccountUrl(`delete/${accountId}`);
    return firstValueFrom(this.http.delete<ApiResponse<Account>>(url));
  }

  async changeStatusAccount(accountId: string, account: Account): Promise<ApiResponse<Account>> {
    const url = this.apiConfig.getAccountUrl(`changeStatus/${accountId}`);
    return firstValueFrom(this.http.patch<ApiResponse<Account>>(url, account));
  }

  async getByDestinationId(destinationId: number): Promise<ApiResponse<Account>> {
    const url = this.apiConfig.getAccountUrl(`getByDestinationId/${destinationId}`);
    return firstValueFrom(this.http.get<ApiResponse<Account>>(url));
  }
}
