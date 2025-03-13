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
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  getAllDestinations(): Observable<ApiResponse<Destination[]>> {
    const url = this.apiConfig.getDestinationUrl('getAll');
    return this.http.get<ApiResponse<Destination[]>>(url);
  }

  getDestinationById(id: number): Observable<ApiResponse<Destination>> {
    const url = this.apiConfig.getDestinationUrl(`getById/${id}`);
    return this.http.get<ApiResponse<Destination>>(url);
  }
}
