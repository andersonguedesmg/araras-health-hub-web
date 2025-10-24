import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
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

  public loadReceivings(pageNumber: number, pageSize: number, searchTerm: string = ''): Observable<ApiResponse<Receiving[]>> {
    const url = this.apiConfig.getUrl('receiving', `getAll`);
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('searchTerm', searchTerm);
    return this.http.get<ApiResponse<Receiving[]>>(url, { params }).pipe(
      tap(response => {
        console.log('loadReceivings response:', response);
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

  public updateReceiving(receiving: Receiving, receivingId: number): Observable<ApiResponse<Receiving>> {
    const url = this.apiConfig.getUrl('receiving', `update/${receivingId}`);
    return this.http.put<ApiResponse<Receiving>>(url, receiving).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentProducts = this.receivingsSubject.getValue();
          const updatedList = currentProducts.map(r => r.id === receivingId ? response.data! : r);
          this.receivingsSubject.next(updatedList);
        }
      })
    );
  }

  public getReceivingById(id: number): Observable<ApiResponse<Receiving>> {
    const url = this.apiConfig.getUrl('receiving', `getById/${id}`);
    return this.http.get<ApiResponse<Receiving>>(url);
  }

  public exportReceivings(searchTerm: string = ''): Observable<HttpResponse<Blob>> {
    const url = this.apiConfig.getUrl('receiving', `export`);
    const params = new HttpParams().set('searchTerm', searchTerm);

    return this.http.get(url, {
      params,
      responseType: 'blob',
      observe: 'response'
    });
  }
}
