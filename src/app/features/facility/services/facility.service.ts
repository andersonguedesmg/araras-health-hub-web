import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable, tap } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response';
import { Facility } from '../interfaces/facility';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import { SelectOptions } from '../../../shared/interfaces/select-options';
import { ApiDropdownItem } from '../../../shared/interfaces/api-dropdown-item';

@Injectable({
  providedIn: 'root'
})
export class FacilityService {
  private facilitySubject = new BehaviorSubject<Facility[]>([]);
  public facilities$ = this.facilitySubject.asObservable();

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  public loadFacilities(pageNumber: number, pageSize: number): Observable<ApiResponse<Facility[]>> {
    const url = this.apiConfig.getUrl('facility', `getAll?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return this.http.get<ApiResponse<Facility[]>>(url).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.facilitySubject.next(response.data);
        }
      })
    );
  }

  public createFacility(facility: Facility): Observable<ApiResponse<Facility>> {
    const url = this.apiConfig.getUrl('facility', 'create');
    return this.http.post<ApiResponse<Facility>>(url, facility).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentFacility = this.facilitySubject.getValue();
          this.facilitySubject.next([...currentFacility, response.data]);
        }
      })
    );
  }

  public getFacilityById(facilityId: number): Observable<ApiResponse<Facility>> {
    const url = this.apiConfig.getUrl('facility', `getById/${facilityId}`);
    return this.http.get<ApiResponse<Facility>>(url);
  }

  public updateFacility(facility: Facility, facilityId: number): Observable<ApiResponse<Facility>> {
    const url = this.apiConfig.getUrl('facility', `update/${facilityId}`);
    return this.http.put<ApiResponse<Facility>>(url, facility).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentFacility = this.facilitySubject.getValue();
          const updatedList = currentFacility.map(p => p.id === facilityId ? response.data! : p);
          this.facilitySubject.next(updatedList);
        }
      })
    );
  }

  public changeStatusFacility(facilityId: number, facility: Facility): Observable<ApiResponse<Facility>> {
    const url = this.apiConfig.getUrl('facility', `changeStatus/${facilityId}`);
    return this.http.patch<ApiResponse<Facility>>(url, facility).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentFacility = this.facilitySubject.getValue();
          const updatedList = currentFacility.map(p => p.id === facilityId ? response.data! : p);
          this.facilitySubject.next(updatedList);
        }
      })
    );
  }

  public deleteFacility(facilityId: number): Observable<ApiResponse<Facility>> {
    const url = this.apiConfig.getUrl('facility', `delete/${facilityId}`);
    return this.http.delete<ApiResponse<Facility>>(url).pipe(
      tap(response => {
        if (response.success) {
          const currentFacility = this.facilitySubject.getValue();
          const updatedList = currentFacility.filter(p => p.id !== facilityId);
          this.facilitySubject.next(updatedList);
        }
      })
    );
  }

  public getFacilityOptions(): Promise<SelectOptions<number>[]> {
    const url = this.apiConfig.getUrl('facility', 'getDropdownOptions');
    return firstValueFrom(this.http.get<ApiResponse<ApiDropdownItem[]>>(url))
      .then(response => {
        return response?.data?.map((item) => ({
          label: item.name,
          value: item.id,
        })) || [];
      })
      .catch(error => {
        return [];
      });
  }
}
