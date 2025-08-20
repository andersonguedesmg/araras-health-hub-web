import { Injectable } from '@angular/core';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {

  constructor() { }

  private apiUrl = environment.apiUrl;

  getUrl(feature: string, endpoint: string): string {
    const featureUrl = `${this.apiUrl}${feature}`;
    return `${featureUrl}/${endpoint}`;
  }
}
