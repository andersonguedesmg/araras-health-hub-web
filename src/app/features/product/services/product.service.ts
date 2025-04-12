import { Injectable } from '@angular/core';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import { HttpClient } from '@angular/common/http';
import { Product } from '../interfaces/product';
import { ApiResponse } from '../../../shared/interfaces/apiResponse';
import { firstValueFrom } from 'rxjs';
import { SelectOptions } from '../../../shared/interfaces/select-options';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  async getAllProducts(): Promise<ApiResponse<Product[]>> {
    const url = this.apiConfig.getProductUrl('getAll');
    return firstValueFrom(this.http.get<ApiResponse<Product[]>>(url));
  }

  async createProduct(product: Product): Promise<ApiResponse<Product>> {
    const url = this.apiConfig.getProductUrl('create');
    return firstValueFrom(this.http.post<ApiResponse<Product>>(url, product));
  }

  async updateProduct(product: Product, productId: number): Promise<ApiResponse<Product>> {
    const url = this.apiConfig.getProductUrl(`update/${productId}`);
    return firstValueFrom(this.http.put<ApiResponse<Product>>(url, product));
  }

  async deleteProduct(productId: number): Promise<ApiResponse<Product>> {
    const url = this.apiConfig.getProductUrl(`delete/${productId}`);
    return firstValueFrom(this.http.delete<ApiResponse<Product>>(url));
  }

  async changeStatusProduct(productId: number, product: Product): Promise<ApiResponse<Product>> {
    const url = this.apiConfig.getProductUrl(`changeStatus/${productId}`);
    return firstValueFrom(this.http.patch<ApiResponse<Product>>(url, product));
  }

  async getAllProductNames(): Promise<ApiResponse<SelectOptions<number>[]>> {
    const url = this.apiConfig.getUserUrl('getNames');
    return firstValueFrom(this.http.get<ApiResponse<SelectOptions<number>[]>>(url));
  }
}
