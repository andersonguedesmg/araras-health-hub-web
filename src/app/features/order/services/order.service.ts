import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/apiResponse';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import { Order } from '../interfaces/order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  async getAllOrders(): Promise<ApiResponse<Order[]>> {
    const url = this.apiConfig.getOrderUrl('getAll');
    return firstValueFrom(this.http.get<ApiResponse<Order[]>>(url));
  }

  async createOrder(order: Order): Promise<ApiResponse<Order>> {
    const url = this.apiConfig.getOrderUrl('create');
    return firstValueFrom(this.http.post<ApiResponse<Order>>(url, order));
  }
}
