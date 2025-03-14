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

  createUser(user: User): Observable<ApiResponse<User>> {
    const url = this.apiConfig.getUserUrl('create');
    return this.http.post<ApiResponse<User>>(url, user);
  }

  updateUser(user: User, userId: number): Observable<ApiResponse<User>> {
    const url = this.apiConfig.getUserUrl(`update/${userId}`);
    return this.http.put<ApiResponse<User>>(url, user);
  }

  deleteUser(userId: number): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getUserUrl(`delete/${userId}`);
    return this.http.delete<ApiResponse<any>>(url);
  }

  changeStatusUser(userId: number, user: User): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getUserUrl(`changeStatus/${userId}`);
    return this.http.patch<ApiResponse<any>>(url, user);
  }
}
