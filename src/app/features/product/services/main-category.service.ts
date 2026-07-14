import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiDropdownItem } from '../../../shared/interfaces/api-dropdown-item';
import { ApiResponse } from '../../../shared/interfaces/api-response';
import { SelectOptions } from '../../../shared/interfaces/select-options';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import { MainCategory } from '../interfaces/main-category';

@Injectable({
  providedIn: 'root',
})
export class MainCategoryService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);

  public loadMainCategories(
    pageNumber: number,
    pageSize: number,
    searchTerm: string = '',
  ): Observable<ApiResponse<MainCategory[]>> {
    const url = this.apiConfig.getUrl('main-categories');
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('searchTerm', searchTerm);

    return this.http.get<ApiResponse<MainCategory[]>>(url, { params });
  }

  public createMainCategory(
    mainCategory: MainCategory,
  ): Observable<ApiResponse<MainCategory>> {
    const url = this.apiConfig.getUrl('main-categories');
    return this.http.post<ApiResponse<MainCategory>>(url, mainCategory);
  }

  public getMainCategoryById(
    mainCategoryId: number,
  ): Observable<ApiResponse<MainCategory>> {
    const url = this.apiConfig.getUrl(`main-categories/${mainCategoryId}`);
    return this.http.get<ApiResponse<MainCategory>>(url);
  }

  public updateMainCategory(
    mainCategory: MainCategory,
    mainCategoryId: number,
  ): Observable<ApiResponse<MainCategory>> {
    const url = this.apiConfig.getUrl(`main-categories/${mainCategoryId}`);
    return this.http.put<ApiResponse<MainCategory>>(url, mainCategory);
  }

  public changeStatusMainCategory(
    mainCategoryId: number,
    mainCategory: MainCategory,
  ): Observable<ApiResponse<MainCategory>> {
    const action = mainCategory.isActive ? 'activate' : 'deactivate';
    const url = this.apiConfig.getUrl(
      `main-categories/${mainCategoryId}/${action}`,
    );

    return this.http.patch<ApiResponse<MainCategory>>(url, {});
  }

  public getMainCategoryOptions(): Observable<SelectOptions<number>[]> {
    const url = this.apiConfig.getUrl('main-categories/dropdown');
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
