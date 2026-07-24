import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../interfaces/api-response';
import { DashboardSummary } from '../../interfaces/dashboard-summary';
import { ApiConfigService } from '../api-config/api-config.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  getSummary(): Observable<ApiResponse<DashboardSummary>> {
    const url = this.apiConfig.getUrlOld('dashboard', 'summary');
    return this.http.get<ApiResponse<DashboardSummary>>(url);
  }
}
