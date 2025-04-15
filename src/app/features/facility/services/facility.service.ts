import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/apiResponse';
import { Facility } from '../interfaces/facility';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import { SelectOptions } from '../../../shared/interfaces/select-options';

@Injectable({
  providedIn: 'root'
})
export class FacilityService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  async getAllFacilities(): Promise<ApiResponse<Facility[]>> {
    const url = this.apiConfig.getFacilityUrl('getAll');
    return firstValueFrom(this.http.get<ApiResponse<Facility[]>>(url));
  }

  async getFacilityById(facilityId: number): Promise<ApiResponse<Facility>> {
    const url = this.apiConfig.getFacilityUrl(`getById/${facilityId}`);
    return firstValueFrom(this.http.get<ApiResponse<Facility>>(url));
  }

  async createFacility(facility: Facility): Promise<ApiResponse<Facility>> {
    const url = this.apiConfig.getFacilityUrl('create');
    return firstValueFrom(this.http.post<ApiResponse<Facility>>(url, facility));
  }

  async updateFacility(facility: Facility, facilityId: number): Promise<ApiResponse<Facility>> {
    const url = this.apiConfig.getFacilityUrl(`update/${facilityId}`);
    return firstValueFrom(this.http.put<ApiResponse<Facility>>(url, facility));
  }

  async deleteFacility(facilityId: number): Promise<ApiResponse<Facility>> {
    const url = this.apiConfig.getFacilityUrl(`delete/${facilityId}`);
    return firstValueFrom(this.http.delete<ApiResponse<Facility>>(url));
  }

  async changeStatusFacility(facilityId: number, facility: Facility): Promise<ApiResponse<Facility>> {
    const url = this.apiConfig.getFacilityUrl(`changeStatus/${facilityId}`);
    return firstValueFrom(this.http.patch<ApiResponse<Facility>>(url, facility));
  }

  async getAllFacilitiesNames(): Promise<ApiResponse<SelectOptions<number>[]>> {
    const url = this.apiConfig.getFacilityUrl('getNames');
    return firstValueFrom(this.http.get<ApiResponse<SelectOptions<number>[]>>(url));
  }
}
