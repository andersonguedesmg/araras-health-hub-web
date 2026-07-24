import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiDropdownItem } from '../../../../../shared/interfaces/api-dropdown-item';
import { ApiResponse } from '../../../../../shared/interfaces/api-response';
import { SelectOptions } from '../../../../../shared/interfaces/select-options';
import { ApiConfigService } from '../../../../../shared/services/api-config/api-config.service';
import { Facility } from '../interfaces/facility';
import { FacilityProfile } from '../interfaces/facility-profile';

@Injectable({
  providedIn: 'root',
})
export class FacilityService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);

  public loadFacilities(
    pageNumber: number,
    pageSize: number,
    searchTerm: string = '',
  ): Observable<ApiResponse<Facility[]>> {
    const url = this.apiConfig.getUrl('facilities');
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('searchTerm', searchTerm);

    return this.http.get<ApiResponse<Facility[]>>(url, { params });
  }

  public createFacility(facility: Facility): Observable<ApiResponse<Facility>> {
    const url = this.apiConfig.getUrl('facilities');
    return this.http.post<ApiResponse<Facility>>(url, facility);
  }

  public getFacilityById(
    facilityId: number,
  ): Observable<ApiResponse<Facility>> {
    const url = this.apiConfig.getUrl(`facilities/${facilityId}`);
    return this.http.get<ApiResponse<Facility>>(url);
  }

  public updateFacility(
    facility: Facility,
    facilityId: number,
  ): Observable<ApiResponse<Facility>> {
    const url = this.apiConfig.getUrl(`facilities/${facilityId}`);
    return this.http.put<ApiResponse<Facility>>(url, facility);
  }

  public changeStatusFacility(
    facilityId: number,
    facility: Facility,
  ): Observable<ApiResponse<Facility>> {
    const action = facility.isActive ? 'activate' : 'deactivate';
    const url = this.apiConfig.getUrl(`facilities/${facilityId}/${action}`);
    return this.http.patch<ApiResponse<Facility>>(url, {});
  }

  public getFacilityProfile(): Observable<ApiResponse<FacilityProfile>> {
    const url = this.apiConfig.getUrl('facilities/profile');
    return this.http.get<ApiResponse<FacilityProfile>>(url);
  }

  public getFacilityPagedOptions(
    pageNumber: number,
    pageSize: number,
    searchTerm: string = '',
    isActive?: boolean,
  ): Observable<ApiResponse<SelectOptions<number>[]>> {
    const url = this.apiConfig.getUrl('facilities/dropdown');

    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('searchTerm', searchTerm);

    if (isActive !== undefined) {
      params = params.set('isActive', isActive.toString());
    }

    return this.http.get<ApiResponse<ApiDropdownItem[]>>(url, { params }).pipe(
      map((response) => {
        const mappedData: SelectOptions<number>[] =
          response?.data?.map((item) => ({
            label: item.label,
            value: item.id,
          })) || [];

        return {
          ...response,
          data: mappedData,
        };
      }),
    );
  }
}
