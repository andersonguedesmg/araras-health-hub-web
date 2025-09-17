import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable, tap } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response';
import { Supplier } from '../interfaces/supplier';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import { SelectOptions } from '../../../shared/interfaces/select-options';
import { ApiDropdownItem } from '../../../shared/interfaces/api-dropdown-item';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private supplierSubject = new BehaviorSubject<Supplier[]>([]);
  public suppliers$ = this.supplierSubject.asObservable();

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  public loadSuppliers(pageNumber: number, pageSize: number, searchTerm: string = ''): Observable<ApiResponse<Supplier[]>> {
    const url = this.apiConfig.getUrl('supplier', `getAll`);
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('searchTerm', searchTerm);
    return this.http.get<ApiResponse<Supplier[]>>(url, { params }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.supplierSubject.next(response.data);
        }
      })
    );
  }

  public createSupplier(supplier: Supplier): Observable<ApiResponse<Supplier>> {
    const url = this.apiConfig.getUrl('supplier', 'create');
    return this.http.post<ApiResponse<Supplier>>(url, supplier).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentSupplier = this.supplierSubject.getValue();
          this.supplierSubject.next([...currentSupplier, response.data]);
        }
      })
    );
  }

  public getSupplierById(supplierId: number): Observable<ApiResponse<Supplier>> {
    const url = this.apiConfig.getUrl('supplier', `getById/${supplierId}`);
    return this.http.get<ApiResponse<Supplier>>(url);
  }

  public updateSupplier(supplier: Supplier, supplierId: number): Observable<ApiResponse<Supplier>> {
    const url = this.apiConfig.getUrl('supplier', `update/${supplierId}`);
    return this.http.put<ApiResponse<Supplier>>(url, supplier).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentSupplier = this.supplierSubject.getValue();
          const updatedList = currentSupplier.map(p => p.id === supplierId ? response.data! : p);
          this.supplierSubject.next(updatedList);
        }
      })
    );
  }

  public changeStatusSupplier(supplierId: number, supplier: Supplier): Observable<ApiResponse<Supplier>> {
    const url = this.apiConfig.getUrl('supplier', `changeStatus/${supplierId}`);
    return this.http.patch<ApiResponse<Supplier>>(url, supplier).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentSupplier = this.supplierSubject.getValue();
          const updatedList = currentSupplier.map(p => p.id === supplierId ? response.data! : p);
          this.supplierSubject.next(updatedList);
        }
      })
    );
  }

  public deleteSupplier(supplierId: number): Observable<ApiResponse<Supplier>> {
    const url = this.apiConfig.getUrl('supplier', `delete/${supplierId}`);
    return this.http.delete<ApiResponse<Supplier>>(url).pipe(
      tap(response => {
        if (response.success) {
          const currentSupplier = this.supplierSubject.getValue();
          const updatedList = currentSupplier.filter(p => p.id !== supplierId);
          this.supplierSubject.next(updatedList);
        }
      })
    );
  }

  public getSupplierOptions(): Promise<SelectOptions<number>[]> {
    const url = this.apiConfig.getUrl('supplier', 'getDropdownOptions');
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

  public exportProducts(searchTerm: string = ''): Observable<HttpResponse<Blob>> {
    const url = this.apiConfig.getUrl('supplier', `export`);
    const params = new HttpParams().set('searchTerm', searchTerm);
    return this.http.get(url, {
      params,
      responseType: 'blob',
      observe: 'response'
    });
  }
}
