import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../../../shared/interfaces/api-response';
import { ApiConfigService } from '../../../../../shared/services/api-config.service';
import { Account } from '../interfaces/account';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);
  private accountsSignal = signal<Account[]>([]);
  public accounts = this.accountsSignal.asReadonly();

  public loadAccounts(
    pageNumber: number,
    pageSize: number,
    searchTerm: string = '',
  ): Observable<ApiResponse<Account[]>> {
    const url = this.apiConfig.getUrl('accounts');
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('searchTerm', searchTerm);

    return this.http.get<ApiResponse<Account[]>>(url, { params });
  }

  public registerAccount(account: Account): Observable<ApiResponse<Account>> {
    const url = this.apiConfig.getUrl('accounts');
    return this.http.post<ApiResponse<Account>>(url, account);
  }

  public getAccountById(accountId: number): Observable<ApiResponse<Account>> {
    const url = this.apiConfig.getUrl(`accounts/${accountId}`);
    return this.http.get<ApiResponse<Account>>(url);
  }

  public updateAccount(
    account: Account,
    accountId: number,
  ): Observable<ApiResponse<Account>> {
    const url = this.apiConfig.getUrl(`accounts/${accountId}`);
    return this.http.put<ApiResponse<Account>>(url, account);
  }

  public changeStatusAccount(
    accountId: number,
    account: Account,
  ): Observable<ApiResponse<Account>> {
    const action = account.isActive ? 'activate' : 'deactivate';
    const url = this.apiConfig.getUrl(`accounts/${accountId}/${action}`);
    return this.http.patch<ApiResponse<Account>>(url, {});
  }

  public getByFacilityId(
    facilityId: number,
  ): Observable<ApiResponse<Account[]>> {
    const url = this.apiConfig.getUrl(`accounts/by-facility/${facilityId}`);
    return this.http.get<ApiResponse<Account[]>>(url);
  }

  public loginAccount(loginData: any): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getUrl('accounts/login');
    return this.http.post<ApiResponse<any>>(url, loginData);
  }

  public changePassword(
    accountId: number,
    request: string,
  ): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getUrl(`accounts/${accountId}/change-password`);
    return this.http.patch<ApiResponse<any>>(url, request);
  }
}
