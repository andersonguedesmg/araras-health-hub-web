import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable, tap } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import { Order } from '../interfaces/order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  public orders$ = this.ordersSubject.asObservable();

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  public loadOrders(pageNumber: number, pageSize: number): Observable<ApiResponse<Order[]>> {
    const url = this.apiConfig.getUrl('order', `getAll?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return this.http.get<ApiResponse<Order[]>>(url).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.ordersSubject.next(response.data);
        }
      })
    );
  }

  public createOrder(order: Order): Observable<ApiResponse<Order>> {
    const url = this.apiConfig.getUrl('order', 'create');
    return this.http.post<ApiResponse<Order>>(url, order).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentOrders = this.ordersSubject.getValue();
          this.ordersSubject.next([...currentOrders, response.data]);
        }
      })
    );
  }

  public updateOrder(order: Order, orderId: number): Observable<ApiResponse<Order>> {
    const url = this.apiConfig.getUrl('order', `update/${orderId}`);
    return this.http.put<ApiResponse<Order>>(url, order).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentOrders = this.ordersSubject.getValue();
          const updatedList = currentOrders.map(o => o.id === orderId ? response.data! : o);
          this.ordersSubject.next(updatedList);
        }
      })
    );
  }

  public getOrderById(id: number): Observable<ApiResponse<Order>> {
    const url = this.apiConfig.getUrl('order', `getById/${id}`);
    return this.http.get<ApiResponse<Order>>(url);
  }
}
