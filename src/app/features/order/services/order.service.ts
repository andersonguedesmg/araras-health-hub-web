import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import { Order } from '../interfaces/order';
import { ApproveOrderCommand, CancelOrderCommand, FinalizeOrderCommand, SeparateOrderCommand } from '../interfaces/order-commands';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  public orders$ = this.ordersSubject.asObservable();

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  public loadOrders(pageNumber: number, pageSize: number, searchTerm: string = '', orderStatusId?: number): Observable<ApiResponse<Order[]>> {
    const url = this.apiConfig.getUrl('order', `getAll`);
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('searchTerm', searchTerm);

    if (orderStatusId !== undefined && orderStatusId !== null) {
      params = params.set('OrderStatusId', orderStatusId.toString());
    }

    return this.http.get<ApiResponse<Order[]>>(url, { params }).pipe(
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

  public approveOrder(order: ApproveOrderCommand): Observable<ApiResponse<Order>> {
    const url = this.apiConfig.getUrl('order', 'approve');
    return this.http.put<ApiResponse<Order>>(url, order).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentOrders = this.ordersSubject.getValue();
          this.ordersSubject.next([...currentOrders, response.data]);
        }
      })
    );
  }

  public getPickingDetails(id: number): Observable<ApiResponse<Order>> {
    const url = this.apiConfig.getUrl('order', `picking-details/${id}`);
    return this.http.get<ApiResponse<Order>>(url);
  }

  public getPickingReport(id: number): Observable<Blob> {
    const url = this.apiConfig.getUrl('order', `picking-report/${id}`);
    return this.http.get(url, { responseType: 'blob' });
  }

  public separateOrder(order: SeparateOrderCommand): Observable<ApiResponse<Order>> {
    const url = this.apiConfig.getUrl('order', 'separate');
    return this.http.put<ApiResponse<Order>>(url, order).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentOrders = this.ordersSubject.getValue();
          this.ordersSubject.next([...currentOrders, response.data]);
        }
      })
    );
  }

  public finalizeOrder(order: FinalizeOrderCommand): Observable<ApiResponse<Order>> {
    const url = this.apiConfig.getUrl('order', 'finalize');
    return this.http.put<ApiResponse<Order>>(url, order).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentOrders = this.ordersSubject.getValue();
          this.ordersSubject.next([...currentOrders, response.data]);
        }
      })
    );
  }

  public cancelOrder(order: CancelOrderCommand): Observable<ApiResponse<Order>> {
    const url = this.apiConfig.getUrl('order', 'cancel');
    return this.http.put<ApiResponse<Order>>(url, order).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentOrders = this.ordersSubject.getValue();
          this.ordersSubject.next([...currentOrders, response.data]);
        }
      })
    );
  }

  public exportOrders(searchTerm: string = '', orderStatusId?: number): Observable<HttpResponse<Blob>> {
    const url = this.apiConfig.getUrl('order', 'export');
    let params = new HttpParams().set('searchTerm', searchTerm);

    if (orderStatusId !== undefined && orderStatusId !== null) {
      params = params.set('orderStatusId', orderStatusId.toString());
    }

    return this.http.get(url, {
      params,
      responseType: 'blob',
      observe: 'response'
    });
  }
}
