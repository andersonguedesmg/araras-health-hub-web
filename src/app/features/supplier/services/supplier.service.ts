import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/apiResponse';
import { Supplier } from '../interfaces/supplier';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import { SelectOptions } from '../../../shared/interfaces/select-options';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  async getAllSuppliers(): Promise<ApiResponse<Supplier[]>> {
    const url = this.apiConfig.getSupplierUrl('getAll');
    return firstValueFrom(this.http.get<ApiResponse<Supplier[]>>(url));
  }

  async createSupplier(supplier: Supplier): Promise<ApiResponse<Supplier>> {
    const url = this.apiConfig.getSupplierUrl('create');
    return firstValueFrom(this.http.post<ApiResponse<Supplier>>(url, supplier));
  }

  async updateSupplier(supplier: Supplier, supplierId: number): Promise<ApiResponse<Supplier>> {
    const url = this.apiConfig.getSupplierUrl(`update/${supplierId}`);
    return firstValueFrom(this.http.put<ApiResponse<Supplier>>(url, supplier));
  }

  async deleteSupplier(supplierId: number): Promise<ApiResponse<Supplier>> {
    const url = this.apiConfig.getSupplierUrl(`delete/${supplierId}`);
    return firstValueFrom(this.http.delete<ApiResponse<Supplier>>(url));
  }

  async changeStatusSupplier(supplierId: number, supplier: Supplier): Promise<ApiResponse<Supplier>> {
    const url = this.apiConfig.getSupplierUrl(`changeStatus/${supplierId}`);
    return firstValueFrom(this.http.patch<ApiResponse<Supplier>>(url, supplier));
  }

  async getSupplierOptions(): Promise<ApiResponse<SelectOptions<number>[]>> {
    const url = this.apiConfig.getSupplierUrl('getDropdownOptions');
    return firstValueFrom(this.http.get<ApiResponse<SelectOptions<number>[]>>(url));
  }
}
