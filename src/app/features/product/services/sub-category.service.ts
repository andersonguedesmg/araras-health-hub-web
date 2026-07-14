import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiDropdownItem } from '../../../shared/interfaces/api-dropdown-item';
import { ApiResponse } from '../../../shared/interfaces/api-response';
import { SelectOptions } from '../../../shared/interfaces/select-options';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import { SubCategory } from '../interfaces/sub-category';

@Injectable({
  providedIn: 'root',
})
export class SubCategoryService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);

  public loadSubCategories(
    pageNumber: number,
    pageSize: number,
    searchTerm: string = '',
  ): Observable<ApiResponse<SubCategory[]>> {
    const url = this.apiConfig.getUrl('subcategories');
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('searchTerm', searchTerm);

    return this.http.get<ApiResponse<SubCategory[]>>(url, { params });
  }

  public createSubCategory(
    subCategory: SubCategory,
  ): Observable<ApiResponse<SubCategory>> {
    const url = this.apiConfig.getUrl('subcategories');
    return this.http.post<ApiResponse<SubCategory>>(url, subCategory);
  }

  public getSubCategoryById(
    subCategoryId: number,
  ): Observable<ApiResponse<SubCategory>> {
    const url = this.apiConfig.getUrl(`subcategories/${subCategoryId}`);
    return this.http.get<ApiResponse<SubCategory>>(url);
  }

  public updateSubCategory(
    subCategory: SubCategory,
    subCategoryId: number,
  ): Observable<ApiResponse<SubCategory>> {
    const url = this.apiConfig.getUrl(`subcategories/${subCategoryId}`);
    return this.http.put<ApiResponse<SubCategory>>(url, subCategory);
  }

  public changeStatusSubCategory(
    subCategoryId: number,
    subCategory: SubCategory,
  ): Observable<ApiResponse<SubCategory>> {
    const action = subCategory.isActive ? 'activate' : 'deactivate';
    const url = this.apiConfig.getUrl(
      `subcategories/${subCategoryId}/${action}`,
    );

    return this.http.patch<ApiResponse<SubCategory>>(url, {});
  }

  public getSubCategoryOptions(): Observable<SelectOptions<number>[]> {
    const url = this.apiConfig.getUrl('subcategories/dropdown');
    return this.http.get<ApiResponse<ApiDropdownItem[]>>(url).pipe(
      map((response) => {
        return (
          response?.data?.map((item) => ({
            label: item.label,
            value: item.id,
          })) || []
        );
      }),
    );
  }
}
