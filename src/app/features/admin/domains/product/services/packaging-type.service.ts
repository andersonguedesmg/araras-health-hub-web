import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiDropdownItem } from '../../../../../shared/interfaces/api-dropdown-item';
import { ApiResponse } from '../../../../../shared/interfaces/api-response';
import { SelectOptions } from '../../../../../shared/interfaces/select-options';
import { ApiConfigService } from '../../../../../shared/services/api-config.service';
import { PackagingType } from '../interfaces/packaging-type';

@Injectable({
  providedIn: 'root',
})
export class PackagingTypeService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);

  public loadPackagingTypes(
    pageNumber: number,
    pageSize: number,
    searchTerm: string = '',
  ): Observable<ApiResponse<PackagingType[]>> {
    const url = this.apiConfig.getUrl('packaging-types');
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('searchTerm', searchTerm);

    return this.http.get<ApiResponse<PackagingType[]>>(url, { params });
  }

  public createPackagingType(
    packagingType: PackagingType,
  ): Observable<ApiResponse<PackagingType>> {
    const url = this.apiConfig.getUrl('packaging-types');
    return this.http.post<ApiResponse<PackagingType>>(url, packagingType);
  }

  public getPackagingTypeById(
    packagingTypeId: number,
  ): Observable<ApiResponse<PackagingType>> {
    const url = this.apiConfig.getUrl(`packaging-types/${packagingTypeId}`);
    return this.http.get<ApiResponse<PackagingType>>(url);
  }

  public updatePackagingType(
    packagingType: PackagingType,
    packagingTypeId: number,
  ): Observable<ApiResponse<PackagingType>> {
    const url = this.apiConfig.getUrl(`packaging-types/${packagingTypeId}`);
    return this.http.put<ApiResponse<PackagingType>>(url, packagingType);
  }

  public changeStatusPackagingType(
    packagingTypeId: number,
    packagingType: PackagingType,
  ): Observable<ApiResponse<PackagingType>> {
    const action = packagingType.isActive ? 'activate' : 'deactivate';
    const url = this.apiConfig.getUrl(
      `packaging-types/${packagingTypeId}/${action}`,
    );
    return this.http.patch<ApiResponse<PackagingType>>(url, {});
  }

  public getPackagingTypePagedOptions(
    pageNumber: number,
    pageSize: number,
    searchTerm: string = '',
    isActive?: boolean,
  ): Observable<ApiResponse<SelectOptions<number>[]>> {
    const url = this.apiConfig.getUrl('packaging-types/dropdown');

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
