import { Injectable } from '@angular/core';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {

  constructor() { }

  private apiUrl = environment.apiUrl;

  getBaseUrl(): string {
    return this.apiUrl;
  }

  getUrl(feature: string, endpoint: string): string {
    const featureUrl = `${this.apiUrl}${feature}`;
    return `${featureUrl}/${endpoint}`;
  }

  getFacilityUrl(endpoint: string): string {
    return this.apiUrl + 'facility/' + endpoint;
  }

  getAccountUrl(endpoint: string): string {
    return this.apiUrl + 'account/' + endpoint;
  }

  getReceivingUrl(endpoint: string): string {
    return this.apiUrl + 'receiving/' + endpoint;
  }

  getStockUrl(endpoint: string): string {
    return this.apiUrl + 'stock/' + endpoint;
  }

  getOrderUrl(endpoint: string): string {
    return this.apiUrl + 'order/' + endpoint;
  }
}
