import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiConfigService } from './api-config.service';
import { ApiResponse } from '../interfaces/api-response';
import { Observable } from 'rxjs';
import { DashboardSummary } from '../interfaces/dashboard-summary';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  getSummary(): Observable<ApiResponse<DashboardSummary>> {
    const url = this.apiConfig.getUrl('dashboard', 'summary');
    return this.http.get<ApiResponse<DashboardSummary>>(url);
  }
}
