import { Injectable } from '@angular/core';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import { HttpClient } from '@angular/common/http';
import { Stock } from '../interfaces/stock';
import { ApiResponse } from '../../../shared/interfaces/apiResponse';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  async getStock(): Promise<ApiResponse<Stock[]>> {
    const url = this.apiConfig.getStockUrl('getAll');
    return firstValueFrom(this.http.get<ApiResponse<Stock[]>>(url));
  }
}
