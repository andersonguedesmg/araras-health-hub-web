import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { ApiDropdownItem } from '../../../shared/interfaces/api-dropdown-item';
import { ApiResponse } from '../../../shared/interfaces/api-response';
import { SelectOptions } from '../../../shared/interfaces/select-options';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import { Product } from '../interfaces/product';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);
  private productsSignal = signal<Product[]>([]);

  public products = this.productsSignal.asReadonly();

  public loadProducts(
    pageNumber: number,
    pageSize: number,
    searchTerm: string = '',
  ): Observable<ApiResponse<Product[]>> {
    const url = this.apiConfig.getUrl('products');
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('searchTerm', searchTerm);

    return this.http.get<ApiResponse<Product[]>>(url, { params }).pipe(
      tap((response) => {
        if (response && response.data) {
          this.productsSignal.set(response.data);
        }
      }),
    );
  }

  public createProduct(product: Product): Observable<ApiResponse<Product>> {
    const url = this.apiConfig.getUrl('products');
    return this.http.post<ApiResponse<Product>>(url, product).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.productsSignal.update((current) => [response.data!, ...current]);
        }
      }),
    );
  }

  public getProductById(productId: number): Observable<ApiResponse<Product>> {
    const url = this.apiConfig.getUrl(`products/${productId}`);
    return this.http.get<ApiResponse<Product>>(url);
  }

  public updateProduct(
    product: Product,
    productId: number,
  ): Observable<ApiResponse<Product>> {
    const url = this.apiConfig.getUrl(`products/${productId}`);
    return this.http.put<ApiResponse<Product>>(url, product).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.productsSignal.update((current) =>
            current.map((item) =>
              item.id === productId ? response.data! : item,
            ),
          );
        }
      }),
    );
  }

  public changeStatusProduct(
    productId: number,
    product: Product,
  ): Observable<ApiResponse<Product>> {
    const action = product.isActive ? 'activate' : 'deactivate';
    const url = this.apiConfig.getUrl(`products/${productId}/${action}`);

    return this.http.patch<ApiResponse<Product>>(url, {}).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.productsSignal.update((current) =>
            current.map((item) =>
              item.id === productId ? response.data! : item,
            ),
          );
        }
      }),
    );
  }

  public getProductPagedOptions(
    pageNumber: number,
    pageSize: number,
    searchTerm: string = '',
    isActive?: boolean,
  ): Observable<ApiResponse<SelectOptions<number>[]>> {
    const url = this.apiConfig.getUrl('products/dropdown');

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
