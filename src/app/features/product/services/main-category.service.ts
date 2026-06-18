import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiDropdownItem } from '../../../shared/interfaces/api-dropdown-item';
import { ApiResponse } from '../../../shared/interfaces/api-response';
import { SelectOptions } from '../../../shared/interfaces/select-options';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import { MainCategory } from '../interfaces/main-category';

@Injectable({
  providedIn: 'root',
})
export class MainCategoryService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);
  private mainCategoriesSignal = signal<MainCategory[]>([]);

  public mainCategories = this.mainCategoriesSignal.asReadonly();

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

    return this.http.get<ApiResponse<MainCategory[]>>(url, { params }).pipe(
      tap((response) => {
        if (response && response.data) {
          this.mainCategoriesSignal.set(response.data);
        }
      }),
    );
  }

  public createMainCategory(
    mainCategory: MainCategory,
  ): Observable<ApiResponse<MainCategory>> {
    const url = this.apiConfig.getUrl('main-categories');
    return this.http.post<ApiResponse<MainCategory>>(url, mainCategory).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.mainCategoriesSignal.update((current) => [
            response.data!,
            ...current,
          ]);
        }
      }),
    );
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
    return this.http.put<ApiResponse<MainCategory>>(url, mainCategory).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.mainCategoriesSignal.update((current) =>
            current.map((item) =>
              item.id === mainCategoryId ? response.data! : item,
            ),
          );
        }
      }),
    );
  }

  public changeStatusMainCategory(
    mainCategoryId: number,
    mainCategory: MainCategory,
  ): Observable<ApiResponse<MainCategory>> {
    const action = mainCategory.isActive ? 'activate' : 'deactivate';
    const url = this.apiConfig.getUrl(
      `main-categories/${mainCategoryId}/${action}`,
    );

    return this.http.patch<ApiResponse<MainCategory>>(url, {}).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.mainCategoriesSignal.update((current) =>
            current.map((item) =>
              item.id === mainCategoryId ? response.data! : item,
            ),
          );
        }
      }),
    );
  }

  public getMainCategoryOptions(): Observable<SelectOptions<number>[]> {
    const url = this.apiConfig.getUrl('main-categories/dropdown');
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
