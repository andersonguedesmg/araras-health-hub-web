import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiDropdownItem } from '../../../shared/interfaces/api-dropdown-item';
import { ApiResponse } from '../../../shared/interfaces/api-response';
import { SelectOptions } from '../../../shared/interfaces/select-options';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import { Product } from '../interfaces/product';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);

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

    return this.http.get<ApiResponse<Product[]>>(url, { params });
  }

  public createProduct(product: Product): Observable<ApiResponse<Product>> {
    const url = this.apiConfig.getUrl('products');
    return this.http.post<ApiResponse<Product>>(url, product);
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
    return this.http.put<ApiResponse<Product>>(url, product);
  }

  public changeStatusProduct(
    productId: number,
    product: Product,
  ): Observable<ApiResponse<Product>> {
    const action = product.isActive ? 'activate' : 'deactivate';
    const url = this.apiConfig.getUrl(`products/${productId}/${action}`);
    return this.http.patch<ApiResponse<Product>>(url, {});
  }

  public deleteProduct(productId: number): Observable<ApiResponse<Product>> {
    const url = this.apiConfig.getUrl(`products/${productId}`);
    return this.http.delete<ApiResponse<Product>>(url);
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
