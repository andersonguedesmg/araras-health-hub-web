import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../../../../shared/interfaces/api-response';
import { ApiConfigService } from '../../../../../../shared/services/api-config/api-config.service';
import { CreateReceivingRequest, Receiving } from '../../interfaces/receiving';

@Injectable({
  providedIn: 'root',
})
export class ReceivingService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);

  public loadReceivings(pageNumber: number, pageSize: number, searchTerm = ''): Observable<ApiResponse<Receiving[]>> {
    const url = this.apiConfig.getUrl('receivings');
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('searchTerm', searchTerm);

    return this.http.get<ApiResponse<Receiving[]>>(url, { params });
  }

  public createReceiving(payload: CreateReceivingRequest): Observable<ApiResponse<Receiving>> {
    const url = this.apiConfig.getUrl('receivings');
    return this.http.post<ApiResponse<Receiving>>(url, payload);
  }

  public getReceivingById(receivingId: number): Observable<ApiResponse<Receiving>> {
    const url = this.apiConfig.getUrl(`receivings/${receivingId}`);
    return this.http.get<ApiResponse<Receiving>>(url);
  }
}
