import { Injectable } from '@angular/core';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import { HttpClient } from '@angular/common/http';
import { StockMovement } from '../interfaces/stock-movement';
import { ApiResponse } from '../../../shared/interfaces/api-response';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { StockShipping } from '../interfaces/stock-shipping';

@Injectable({
  providedIn: 'root'
})
export class StockMovementService {
  private stockMovementSubject = new BehaviorSubject<StockMovement[]>([]);
  public stockMovements$ = this.stockMovementSubject.asObservable();

  private stockShippingSubject = new BehaviorSubject<StockShipping[]>([]);
  public stockShippings$ = this.stockShippingSubject.asObservable();

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  public loadStockMovements(pageNumber: number, pageSize: number): Observable<ApiResponse<StockMovement[]>> {
    const url = this.apiConfig.getUrl('stock-movement', `getAll?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return this.http.get<ApiResponse<StockMovement[]>>(url).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.stockMovementSubject.next(response.data);
        }
      })
    );
  }

  public loadStockShippings(pageNumber: number, pageSize: number): Observable<ApiResponse<StockShipping[]>> {
    const url = this.apiConfig.getUrl('stock-movement', `getAll?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return this.http.get<ApiResponse<StockShipping[]>>(url).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.stockShippingSubject.next(response.data);
        }
      })
    );
  }
}
