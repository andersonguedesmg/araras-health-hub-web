import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/apiResponse';
import { Supplier } from '../interfaces/supplier';
import { ApiConfigService } from '../../../shared/services/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  getAllSuppliers(): Observable<ApiResponse<Supplier[]>> {
    const url = this.apiConfig.getSupplierUrl('getAll');
    return this.http.get<ApiResponse<Supplier[]>>(url);
  }

  createSupplier(supplier: Supplier): Observable<ApiResponse<Supplier>> {
    const url = this.apiConfig.getSupplierUrl('create');
    return this.http.post<ApiResponse<Supplier>>(url, supplier);
  }

  updateSupplier(supplier: Supplier, supplierId: number): Observable<ApiResponse<Supplier>> {
    const url = this.apiConfig.getSupplierUrl(`update/${supplierId}`);
    return this.http.put<ApiResponse<Supplier>>(url, supplier);
  }

  deleteSupplier(supplierId: number): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getSupplierUrl(`delete/${supplierId}`);
    return this.http.delete<ApiResponse<any>>(url);
  }

  changeStatusSupplier(supplierId: number, supplier: Supplier): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getSupplierUrl(`changeStatus/${supplierId}`);
    return this.http.patch<ApiResponse<any>>(url, supplier);
  }
}
