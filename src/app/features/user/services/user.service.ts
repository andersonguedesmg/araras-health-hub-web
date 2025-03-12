import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';
import { User } from '../interfaces/user';
import { ApiResponse } from '../../../shared/interfaces/apiResponse';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl + 'user/getAll';

  constructor(private http: HttpClient) { }

  getUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(this.apiUrl);
  }
}
