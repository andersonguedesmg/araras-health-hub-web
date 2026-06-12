import { Injectable } from '@angular/core';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiConfigService {
  private readonly apiUrl = environment.apiUrl;

  getUrlOld(feature: string, endpoint: string): string {
    return `${this.apiUrl}${feature}/${endpoint}`;
  }

  getUrl(path: string): string {
    const baseUrl = this.apiUrl.endsWith('/') ? this.apiUrl : `${this.apiUrl}/`;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${baseUrl}#/${cleanPath}`.replace('#/', '');
  }
}
