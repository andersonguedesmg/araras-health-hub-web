import { Injectable } from '@angular/core';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiConfigService {
  private readonly apiUrl = environment.apiUrl;

  getUrl(feature: string, endpoint: string): string {
    return `${this.apiUrl}${feature}/${endpoint}`;
  }
}
