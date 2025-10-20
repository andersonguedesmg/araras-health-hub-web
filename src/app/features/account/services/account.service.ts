import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response';
import { Account } from '../interfaces/account';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import { ResetPassword } from '../../../core/interfaces/account-reset-password';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private accountSubject = new BehaviorSubject<Account[]>([]);
  public accounts$ = this.accountSubject.asObservable();

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  public loadAccounts(pageNumber: number, pageSize: number, searchTerm: string = ''): Observable<ApiResponse<Account[]>> {
    const url = this.apiConfig.getUrl('account', `getAll`);
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('searchTerm', searchTerm);
    return this.http.get<ApiResponse<Account[]>>(url, { params }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.accountSubject.next(response.data);
        }
      })
    );
  }

  public registerAccount(account: Account): Observable<ApiResponse<Account>> {
    const url = this.apiConfig.getUrl('account', 'register');
    return this.http.post<ApiResponse<Account>>(url, account).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentAccounts = this.accountSubject.getValue();
          this.accountSubject.next([...currentAccounts, response.data]);
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

  public resetPassword(request: ResetPassword): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getUrl('account', 'resetPassword');
    return this.http.post<ApiResponse<any>>(url, request);
  }

  public exportAccounts(searchTerm: string = ''): Observable<HttpResponse<Blob>> {
    const url = this.apiConfig.getUrl('account', `export`);
    const params = new HttpParams().set('searchTerm', searchTerm);

    return this.http.get(url, {
      params,
      responseType: 'blob',
      observe: 'response'
    });
  }
}
