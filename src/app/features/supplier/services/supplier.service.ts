import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { ApiDropdownItem } from '../../../shared/interfaces/api-dropdown-item';
import { ApiResponse } from '../../../shared/interfaces/api-response';
import { SelectOptions } from '../../../shared/interfaces/select-options';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import { Supplier } from '../interfaces/supplier';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);
  private suppliersSignal = signal<Supplier[]>([]);

  public suppliers = this.suppliersSignal.asReadonly();

  public loadSuppliers(
    pageNumber: number,
    pageSize: number,
    searchTerm: string = '',
  ): Observable<ApiResponse<Supplier[]>> {
    const url = this.apiConfig.getUrl('suppliers');
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('searchTerm', searchTerm);

    return this.http.get<ApiResponse<Supplier[]>>(url, { params }).pipe(
      tap((response) => {
        if (response && response.data) {
          this.suppliersSignal.set(response.data);
        }
      }),
    );
  }

  public createSupplier(supplier: Supplier): Observable<ApiResponse<Supplier>> {
    const url = this.apiConfig.getUrl('suppliers');
    return this.http.post<ApiResponse<Supplier>>(url, supplier).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.suppliersSignal.update((current) => [
            response.data!,
            ...current,
          ]);
        }
      }),
    );
  }

  public getSupplierById(
    supplierId: number,
  ): Observable<ApiResponse<Supplier>> {
    const url = this.apiConfig.getUrl(`suppliers/${supplierId}`);
    return this.http.get<ApiResponse<Supplier>>(url);
  }

  public updateSupplier(
    supplier: Supplier,
    supplierId: number,
  ): Observable<ApiResponse<Supplier>> {
    const url = this.apiConfig.getUrl(`suppliers/${supplierId}`);
    return this.http.put<ApiResponse<Supplier>>(url, supplier).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.suppliersSignal.update((current) =>
            current.map((item) =>
              item.id === supplierId ? response.data! : item,
            ),
          );
        }
      }),
    );
  }

  public changeStatusSupplier(
    supplierId: number,
    supplier: Supplier,
  ): Observable<ApiResponse<Supplier>> {
    const action = supplier.isActive ? 'activate' : 'deactivate';
    const url = this.apiConfig.getUrl(`suppliers/${supplierId}/${action}`);

    return this.http.patch<ApiResponse<Supplier>>(url, {}).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.suppliersSignal.update((current) =>
            current.map((item) =>
              item.id === supplierId ? response.data! : item,
            ),
          );
        }
      }),
    );
  }

  public getSupplierPagedOptions(
    pageNumber: number,
    pageSize: number,
    searchTerm: string = '',
    isActive?: boolean,
  ): Observable<ApiResponse<SelectOptions<number>[]>> {
    const url = this.apiConfig.getUrl('suppliers/dropdown');

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
