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

  createDestination(destination: Destination): Observable<ApiResponse<Destination>> {
    const url = this.apiConfig.getDestinationUrl('create');
    return this.http.post<ApiResponse<Destination>>(url, destination);
  }

  updateDestination(destination: Destination, destinationId: number): Observable<ApiResponse<Destination>> {
    const url = this.apiConfig.getDestinationUrl(`update/${destinationId}`);
    return this.http.put<ApiResponse<Destination>>(url, destination);
  }

  deleteDestination(destinationId: number): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getDestinationUrl(`delete/${destinationId}`);
    return this.http.delete<ApiResponse<any>>(url);
  }

  changeStatusDestination(destinationId: number, destination: Destination): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getDestinationUrl(`changeStatus/${destinationId}`);
    return this.http.patch<ApiResponse<any>>(url, destination);
  }
}
