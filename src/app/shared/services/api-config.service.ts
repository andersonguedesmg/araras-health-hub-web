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

  getUrl(endpoint: string): string {
    return this.apiUrl + endpoint;
  }

  getDestinationUrl(endpoint: string): string {
    return this.apiUrl + 'destination/' + endpoint;
  }

  getUserUrl(endpoint: string): string {
    return this.apiUrl + 'user/' + endpoint;
  }

  getUSupplierUrl(endpoint: string): string {
    return this.apiUrl + 'supplier/' + endpoint;
  }
}
