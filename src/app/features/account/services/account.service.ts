import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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

  createAccount(account: Account): Observable<ApiResponse<Account>> {
    const url = this.apiConfig.getAccountUrl('create');
    return this.http.post<ApiResponse<Account>>(url, account);
  }

  updateAccount(account: Account, accountId: string): Observable<ApiResponse<Account>> {
    const url = this.apiConfig.getAccountUrl(`update/${accountId}`);
    return this.http.put<ApiResponse<Account>>(url, account);
  }

  deleteAccount(userId: string): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getAccountUrl(`delete/${userId}`);
    return this.http.delete<ApiResponse<any>>(url);
  }

  changeStatusAccount(userId: string, account: Account): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getAccountUrl(`changeStatus/${userId}`);
    return this.http.patch<ApiResponse<any>>(url, account);
  }
}
