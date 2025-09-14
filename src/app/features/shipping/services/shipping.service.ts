import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import { Shipping } from '../interfaces/shipping';

@Injectable({
  providedIn: 'root'
})
export class ShippingService {
  private shippingsSubject = new BehaviorSubject<Shipping[]>([]);
  public shippings$ = this.shippingsSubject.asObservable();

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  public loadShippings(pageNumber: number, pageSize: number): Observable<ApiResponse<Shipping[]>> {
    const url = this.apiConfig.getUrl('receiving', `getAll?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return this.http.get<ApiResponse<Shipping[]>>(url).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.shippingsSubject.next(response.data);
        }
      })
    );
  }
}
