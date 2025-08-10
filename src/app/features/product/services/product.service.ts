import { Injectable } from '@angular/core';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import { HttpClient } from '@angular/common/http';
import { Product } from '../interfaces/product';
import { ApiResponse } from '../../../shared/interfaces/api-response';
import { BehaviorSubject, firstValueFrom, Observable, tap } from 'rxjs';
import { SelectOptions } from '../../../shared/interfaces/select-options';
import { ApiDropdownItem } from '../../../shared/interfaces/api-dropdown-item';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  public loadProducts(pageNumber: number, pageSize: number): Observable<ApiResponse<Product[]>> {
    const url = this.apiConfig.getUrl('product', `getAll?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return this.http.get<ApiResponse<Product[]>>(url).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.productsSubject.next(response.data);
        }
      })
    );
  }

  public createProduct(product: Product): Observable<ApiResponse<Product>> {
    const url = this.apiConfig.getUrl('product', 'create');
    return this.http.post<ApiResponse<Product>>(url, product).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentProducts = this.productsSubject.getValue();
          this.productsSubject.next([...currentProducts, response.data]);
        }
      })
    );
  }

  public getProductById(productId: number): Observable<ApiResponse<Product>> {
    const url = this.apiConfig.getUrl('product', `getById/${productId}`);
    return this.http.get<ApiResponse<Product>>(url);
  }

  public updateProduct(product: Product, productId: number): Observable<ApiResponse<Product>> {
    const url = this.apiConfig.getUrl('product', `update/${productId}`);
    return this.http.put<ApiResponse<Product>>(url, product).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentProducts = this.productsSubject.getValue();
          const updatedList = currentProducts.map(p => p.id === productId ? response.data! : p);
          this.productsSubject.next(updatedList);
        }
      })
    );
  }

  public changeStatusProduct(productId: number, product: Product): Observable<ApiResponse<Product>> {
    const url = this.apiConfig.getUrl('product', `changeStatus/${productId}`);
    return this.http.patch<ApiResponse<Product>>(url, product).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentProducts = this.productsSubject.getValue();
          const updatedList = currentProducts.map(p => p.id === productId ? response.data! : p);
          this.productsSubject.next(updatedList);
        }
      })
    );
  }

  public deleteProduct(productId: number): Observable<ApiResponse<Product>> {
    const url = this.apiConfig.getUrl('product', `delete/${productId}`);
    return this.http.delete<ApiResponse<Product>>(url).pipe(
      tap(response => {
        if (response.success) {
          const currentProducts = this.productsSubject.getValue();
          const updatedList = currentProducts.filter(p => p.id !== productId);
          this.productsSubject.next(updatedList);
        }
      })
    );
  }

  public getProductOptions(): Promise<SelectOptions<number>[]> {
    const url = this.apiConfig.getUrl('product', 'getDropdownOptions');
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
