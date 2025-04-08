import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/apiResponse';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import { Receiving } from '../interfaces/receiving';

@Injectable({
  providedIn: 'root'
})
export class ReceivingService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  async getAllReceivings(): Promise<ApiResponse<Receiving[]>> {
    const url = this.apiConfig.getReceivingUrl('getAll');
    return firstValueFrom(this.http.get<ApiResponse<Receiving[]>>(url));
  }
}
