import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/apiResponse';
import { Destination } from '../interfaces/destination';
import { ApiConfigService } from '../../../shared/services/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class DestinationService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  async getAllDestinations(): Promise<ApiResponse<Destination[]>> {
    const url = this.apiConfig.getDestinationUrl('getAll');
    return firstValueFrom(this.http.get<ApiResponse<Destination[]>>(url));
  }

  async getDestinationById(destinationId: number): Promise<ApiResponse<Destination>> {
    const url = this.apiConfig.getDestinationUrl(`getById/${destinationId}`);
    return firstValueFrom(this.http.get<ApiResponse<Destination>>(url));
  }

  async createDestination(destination: Destination): Promise<ApiResponse<Destination>> {
    const url = this.apiConfig.getDestinationUrl('create');
    return firstValueFrom(this.http.post<ApiResponse<Destination>>(url, destination));
  }

  async updateDestination(destination: Destination, destinationId: number): Promise<ApiResponse<Destination>> {
    const url = this.apiConfig.getDestinationUrl(`update/${destinationId}`);
    return firstValueFrom(this.http.put<ApiResponse<Destination>>(url, destination));
  }

  async deleteDestination(destinationId: number): Promise<ApiResponse<Destination>> {
    const url = this.apiConfig.getDestinationUrl(`delete/${destinationId}`);
    return firstValueFrom(this.http.delete<ApiResponse<Destination>>(url));
  }

  async changeStatusDestination(destinationId: number, destination: Destination): Promise<ApiResponse<Destination>> {
    const url = this.apiConfig.getDestinationUrl(`changeStatus/${destinationId}`);
    return firstValueFrom(this.http.patch<ApiResponse<Destination>>(url, destination));
  }
}
