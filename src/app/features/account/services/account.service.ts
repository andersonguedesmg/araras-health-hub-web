import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable, tap } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/apiResponse';
import { Account } from '../interfaces/account';
import { ApiConfigService } from '../../../shared/services/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private accountSubject = new BehaviorSubject<Account[]>([]);
  public accounts$ = this.accountSubject.asObservable();

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  public loadAccounts(pageNumber: number, pageSize: number): Observable<ApiResponse<Account[]>> {
    const url = this.apiConfig.getUrl('account', `getAll?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return this.http.get<ApiResponse<Account[]>>(url).pipe(
      tap(response => {
        console.log('response', response);

        if (response.success && response.data) {
          this.accountSubject.next(response.data);
        }
      })
    );
  }

  public createAccount(account: Account): Observable<ApiResponse<Account>> {
    const url = this.apiConfig.getUrl('account', 'create');
    return this.http.post<ApiResponse<Account>>(url, account).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentAccount = this.accountSubject.getValue();
          this.accountSubject.next([...currentAccount, response.data]);
        }
      })
    );
  }

  public getAccountById(accountId: number): Observable<ApiResponse<Account>> {
    const url = this.apiConfig.getUrl('account', `getById/${accountId}`);
    return this.http.get<ApiResponse<Account>>(url);
  }

  public updateAccount(account: Account, accountId: number): Observable<ApiResponse<Account>> {
    const url = this.apiConfig.getUrl('account', `update/${accountId}`);
    return this.http.put<ApiResponse<Account>>(url, account).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentAccount = this.accountSubject.getValue();
          const updatedList = currentAccount.map(p => p.userId === accountId ? response.data! : p);
          this.accountSubject.next(updatedList);
        }
      })
    );
  }

  public changeStatusAccount(accountId: number, account: Account): Observable<ApiResponse<Account>> {
    const url = this.apiConfig.getUrl('account', `changeStatus/${accountId}`);
    return this.http.patch<ApiResponse<Account>>(url, account).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentAccount = this.accountSubject.getValue();
          const updatedList = currentAccount.map(p => p.userId === accountId ? response.data! : p);
          this.accountSubject.next(updatedList);
        }
      })
    );
  }

  public deleteAccount(accountrId: number): Observable<ApiResponse<Account>> {
    const url = this.apiConfig.getUrl('account', `delete/${accountrId}`);
    return this.http.delete<ApiResponse<Account>>(url).pipe(
      tap(response => {
        if (response.success) {
          const currentAccount = this.accountSubject.getValue();
          const updatedList = currentAccount.filter(p => p.userId !== accountrId);
          this.accountSubject.next(updatedList);
        }
      })
    );
  }

  public getByFacilityId(facilityId: number): Observable<ApiResponse<Account>> {
    const url = this.apiConfig.getUrl('account', `getByFacilityId/${facilityId}`);
    return this.http.get<ApiResponse<Account>>(url);
  }
}
