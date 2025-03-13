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
}
