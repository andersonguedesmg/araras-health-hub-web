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
}
