import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';
import { ApiResponse } from '../../../shared/interfaces/apiResponse';
import { Destination } from '../interfaces/destination';
import { ApiConfigService } from '../../../shared/services/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class DestinationService {
  private apiUrl = environment.apiUrl + 'destination/getAll';

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  getDestinations(): Observable<ApiResponse<Destination[]>> {
    return this.http.get<ApiResponse<Destination[]>>(this.apiUrl);
  }

  getDestinationById(id: number): Observable<ApiResponse<Destination>> {
    const url = this.apiConfig.getDestinationUrl(`getById/${id}`);
    return this.http.get<ApiResponse<Destination>>(url);
  }
}
