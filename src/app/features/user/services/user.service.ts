import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user';
import { ApiResponse } from '../../../shared/interfaces/apiResponse';
import { ApiConfigService } from '../../../shared/services/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  getAllUsers(): Observable<ApiResponse<User[]>> {
    const url = this.apiConfig.getUserUrl('getAll');
    return this.http.get<ApiResponse<User[]>>(url);
  }
}
