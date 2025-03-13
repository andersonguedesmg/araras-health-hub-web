import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';
import { ApiResponse } from '../../../shared/interfaces/apiResponse';
import { Destination } from '../interfaces/destination';

@Injectable({
  providedIn: 'root'
})
export class DestinationService {
  private apiUrl = environment.apiUrl + 'destination/getAll';

  constructor(private http: HttpClient) { }

  getDestinations(): Observable<ApiResponse<Destination[]>> {
    return this.http.get<ApiResponse<Destination[]>>(this.apiUrl);
  }
}
