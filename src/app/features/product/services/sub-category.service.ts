import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiDropdownItem } from '../../../shared/interfaces/api-dropdown-item';
import { ApiResponse } from '../../../shared/interfaces/api-response';
import { SelectOptions } from '../../../shared/interfaces/select-options';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import { SubCategory } from '../interfaces/sub-category';

@Injectable({
  providedIn: 'root',
})
export class SubCategoryService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);
  private subCategoriesSignal = signal<SubCategory[]>([]);

  public subCategories = this.subCategoriesSignal.asReadonly();

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

    return this.http.get<ApiResponse<SubCategory[]>>(url, { params }).pipe(
      tap((response) => {
        if (response && response.data) {
          this.subCategoriesSignal.set(response.data);
        }
      }),
    );
  }

  public createSubCategory(
    subCategory: SubCategory,
  ): Observable<ApiResponse<SubCategory>> {
    const url = this.apiConfig.getUrl('subcategories');
    return this.http.post<ApiResponse<SubCategory>>(url, subCategory).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.subCategoriesSignal.update((current) => [
            response.data!,
            ...current,
          ]);
        }
      }),
    );
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
    return this.http.put<ApiResponse<SubCategory>>(url, subCategory).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.subCategoriesSignal.update((current) =>
            current.map((item) =>
              item.id === subCategoryId ? response.data! : item,
            ),
          );
        }
      }),
    );
  }

  public changeStatusSubCategory(
    subCategoryId: number,
    subCategory: SubCategory,
  ): Observable<ApiResponse<SubCategory>> {
    const action = subCategory.isActive ? 'activate' : 'deactivate';
    const url = this.apiConfig.getUrl(
      `subcategories/${subCategoryId}/${action}`,
    );

    return this.http.patch<ApiResponse<SubCategory>>(url, {}).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.subCategoriesSignal.update((current) =>
            current.map((item) =>
              item.id === subCategoryId ? response.data! : item,
            ),
          );
        }
      }),
    );
  }

  public getSubCategoryOptions(): Observable<SelectOptions<number>[]> {
    const url = this.apiConfig.getUrl('subcategories/dropdown');
    return this.http.get<ApiResponse<ApiDropdownItem[]>>(url).pipe(
      map((response) => {
        return (
          response?.data?.map((item) => ({
            label: item.name,
            value: item.id,
          })) || []
        );
      }),
    );
  }
}
