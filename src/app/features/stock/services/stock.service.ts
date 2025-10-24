import { Injectable } from '@angular/core';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Stock } from '../interfaces/stock';
import { ApiResponse } from '../../../shared/interfaces/api-response';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { StockMinQuantity } from '../interfaces/stock-minimum-quantity';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private stockSubject = new BehaviorSubject<Stock[]>([]);
  public stocks$ = this.stockSubject.asObservable();

  private stockMinQuantitySubject = new BehaviorSubject<StockMinQuantity[]>([]);
  public stockMinQuantities$ = this.stockMinQuantitySubject.asObservable();

  private criticalStocksSubject = new BehaviorSubject<Stock[]>([]);
  public criticalStocks$ = this.criticalStocksSubject.asObservable();

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  public get stockMinQuantitySubjectGetter(): BehaviorSubject<StockMinQuantity[]> {
    return this.stockMinQuantitySubject;
  }

  public loadStocks(pageNumber: number, pageSize: number, searchTerm: string = ''): Observable<ApiResponse<Stock[]>> {
    const url = this.apiConfig.getUrl('stock', `getAll`);
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('searchTerm', searchTerm);
    return this.http.get<ApiResponse<Stock[]>>(url, { params }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.stockSubject.next(response.data);
        }
      })
    );
  }

  public loadStockMinQuantities(pageNumber: number, pageSize: number, searchTerm: string = ''): Observable<ApiResponse<StockMinQuantity[]>> {
    const url = this.apiConfig.getUrl('stock', `min-quantities`);
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('searchTerm', searchTerm);
    return this.http.get<ApiResponse<StockMinQuantity[]>>(url, { params }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.stockMinQuantitySubject.next(response.data);
        }
      })
    );
  }

  public loadCriticalStocks(pageNumber: number, pageSize: number, searchTerm: string = ''): Observable<ApiResponse<Stock[]>> {
    const url = this.apiConfig.getUrl('stock', `low-stock`);
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('searchTerm', searchTerm);
    return this.http.get<ApiResponse<Stock[]>>(url, { params }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.criticalStocksSubject.next(response.data);
        }
      })
    );
  }

  public updateMinQuantity(productId: number, newMinQuantity: number): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getUrl('stock', `${productId}/min-quantity`);
    const body = { newMinQuantity: newMinQuantity };
    return this.http.patch<ApiResponse<any>>(url, body);
  }

  public exportStocks(searchTerm: string = ''): Observable<HttpResponse<Blob>> {
    const url = this.apiConfig.getUrl('stock', `export`);
    const params = new HttpParams().set('searchTerm', searchTerm);

    return this.http.get(url, {
      params,
      responseType: 'blob',
      observe: 'response'
    });
  }
}
