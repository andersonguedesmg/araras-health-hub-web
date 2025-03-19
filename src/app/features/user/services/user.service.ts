import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { User } from '../interfaces/user';
import { ApiResponse } from '../../../shared/interfaces/apiResponse';
import { ApiConfigService } from '../../../shared/services/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  async getAllUsers(): Promise<ApiResponse<User[]>> {
    const url = this.apiConfig.getUserUrl('getAll');
    return firstValueFrom(this.http.get<ApiResponse<User[]>>(url));
  }

  async createUser(user: User): Promise<ApiResponse<User>> {
    const url = this.apiConfig.getUserUrl('create');
    return firstValueFrom(this.http.post<ApiResponse<User>>(url, user));
  }

  async updateUser(user: User, userId: number): Promise<ApiResponse<User>> {
    const url = this.apiConfig.getUserUrl(`update/${userId}`);
    return firstValueFrom(this.http.put<ApiResponse<User>>(url, user));
  }

  async deleteUser(userId: number): Promise<ApiResponse<User>> {
    const url = this.apiConfig.getUserUrl(`delete/${userId}`);
    return firstValueFrom(this.http.delete<ApiResponse<User>>(url));
  }

  async changeStatusUser(userId: number, user: User): Promise<ApiResponse<User>> {
    const url = this.apiConfig.getUserUrl(`changeStatus/${userId}`);
    return firstValueFrom(this.http.patch<ApiResponse<User>>(url, user));
  }
}
