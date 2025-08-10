import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import { Receiving } from '../interfaces/receiving';

@Injectable({
  providedIn: 'root'
})
export class ReceivingService {
  private receivingsSubject = new BehaviorSubject<Receiving[]>([]);
  public receivings$ = this.receivingsSubject.asObservable();

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  public loadReceivings(pageNumber: number, pageSize: number): Observable<ApiResponse<Receiving[]>> {
    const url = this.apiConfig.getUrl('receiving', `getAll?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return this.http.get<ApiResponse<Receiving[]>>(url).pipe(
      tap(response => {
        console.log('response', response);
        if (response.success && response.data) {
          this.receivingsSubject.next(response.data);
        }
      })
    );
  }

  public createReceiving(receiving: Receiving): Observable<ApiResponse<Receiving>> {
    const url = this.apiConfig.getUrl('receiving', 'create');
    return this.http.post<ApiResponse<Receiving>>(url, receiving).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentReceivings = this.receivingsSubject.getValue();
          this.receivingsSubject.next([...currentReceivings, response.data]);
        }
      })
    );
  }

  public getReceivingById(id: number): Observable<ApiResponse<Receiving>> {
    const url = this.apiConfig.getUrl('receiving', `getById/${id}`);
    return this.http.get<ApiResponse<Receiving>>(url);
  }
}
