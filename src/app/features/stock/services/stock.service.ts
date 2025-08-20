import { Injectable } from '@angular/core';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import { HttpClient } from '@angular/common/http';
import { Stock } from '../interfaces/stock';
import { ApiResponse } from '../../../shared/interfaces/api-response';
import { BehaviorSubject, firstValueFrom, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private stockSubject = new BehaviorSubject<Stock[]>([]);
  public stocks$ = this.stockSubject.asObservable();

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  public loadStocks(pageNumber: number, pageSize: number): Observable<ApiResponse<Stock[]>> {
    const url = this.apiConfig.getUrl('stock', `getAll?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return this.http.get<ApiResponse<Stock[]>>(url).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.stockSubject.next(response.data);
        }
      })
    );
  }
}
