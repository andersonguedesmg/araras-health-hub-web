import { Injectable } from '@angular/core';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { StockMovement } from '../interfaces/stock-movement';
import { ApiResponse } from '../../../shared/interfaces/api-response';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { StockShipping } from '../interfaces/stock-shipping';
import { StockAdjustment } from '../interfaces/stock-adjustment';

@Injectable({
  providedIn: 'root'
})
export class StockMovementService {
  private stockMovementSubject = new BehaviorSubject<StockMovement[]>([]);
  public stockMovements$ = this.stockMovementSubject.asObservable();

  private stockShippingSubject = new BehaviorSubject<StockShipping[]>([]);
  public stockShippings$ = this.stockShippingSubject.asObservable();

  private stockAdjustmentsSubject = new BehaviorSubject<StockAdjustment[]>([]);
  public stockAdjustments$ = this.stockAdjustmentsSubject.asObservable();

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  public loadStockMovements(pageNumber: number, pageSize: number, searchTerm: string = ''): Observable<ApiResponse<StockMovement[]>> {
    const url = this.apiConfig.getUrl('stock-movement', `getAll`);
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('searchTerm', searchTerm);
    return this.http.get<ApiResponse<StockMovement[]>>(url, { params }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.stockMovementSubject.next(response.data);
        }
      })
    );
  }

  public loadStockShippings(pageNumber: number, pageSize: number, searchTerm: string = ''): Observable<ApiResponse<StockShipping[]>> {
    const url = this.apiConfig.getUrl('stock-movement', `getAll`);
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('searchTerm', searchTerm);
    return this.http.get<ApiResponse<StockShipping[]>>(url, { params }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.stockShippingSubject.next(response.data);
        }
      })
    );
  }

  public loadStockAdjustments(pageNumber: number, pageSize: number, searchTerm: string = ''): Observable<ApiResponse<StockAdjustment[]>> {
    const url = this.apiConfig.getUrl('stock', `adjustments`);
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('searchTerm', searchTerm);
    return this.http.get<ApiResponse<StockAdjustment[]>>(url, { params }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.stockAdjustmentsSubject.next(response.data);
        }
      })
    );
  }

  public exportAdjustments(searchTerm: string = ''): Observable<HttpResponse<Blob>> {
    const url = this.apiConfig.getUrl('stock', `export`);
    const params = new HttpParams().set('searchTerm', searchTerm);

    return this.http.get(url, {
      params,
      responseType: 'blob',
      observe: 'response'
    });
  }
}
