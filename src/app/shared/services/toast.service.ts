import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastSeverities, ToastSummaries } from '../constants/toast.constants';
import { HttpErrorResponse } from '@angular/common/http';
import { BaseApiResponse } from '../interfaces/base-api-response';

interface ApiValidationErrors {
  [key: string]: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private messageService: MessageService) { }

  showSuccess(message: string, summary: string = ToastSummaries.SUCCESS): void {
    this.messageService.add({
      severity: ToastSeverities.SUCCESS,
      summary: summary,
      detail: message,
    });
  }

  showError(message: string, summary: string = ToastSummaries.ERROR): void {
    this.messageService.add({
      severity: ToastSeverities.ERROR,
      summary: summary,
      detail: message,
    });
  }

  handleApiError(error: any): void {
    let detailMessage = 'Ocorreu um erro desconhecido.';
    let summary = ToastSummaries.ERROR;
    let severity = ToastSeverities.ERROR;
    this.messageService.clear();

    if (error instanceof HttpErrorResponse) {
      const apiResponse: BaseApiResponse<any> = error.error;
      if (apiResponse && apiResponse.errors) {
        summary = apiResponse.message || ToastSummaries.ERROR;
        detailMessage = this.formatValidationErrors(apiResponse.errors);
      } else if (apiResponse && apiResponse.message) {
        detailMessage = apiResponse.message;
      } else {
        detailMessage = `[${error.status}] ${error.message}`;
      }
    } else if (error && error.success === false) {
      if (error.errors) {
        summary = 'Ocorreram um ou mais erros de validação.';
        detailMessage = this.formatValidationErrors(error.errors);
      } else {
        detailMessage = error.message;
      }
    } else if (error && error.message) {
      detailMessage = error.message;
    }

    this.messageService.add({
      severity: severity,
      summary: summary,
      detail: detailMessage,
      life: 8000
    });
  }

  private formatValidationErrors(errors: ApiValidationErrors): string {
    let html = '<ul class="p-0 m-0">';

    for (const key in errors) {
      if (errors.hasOwnProperty(key)) {
        errors[key].forEach(error => {

          const fieldName = key !== '$' && key.length < 50 ?
            `<span class="font-bold">${key}</span>: ` : '';

          html += `<li class="mt-1">${fieldName} ${error}</li>`;
        });
      }
    }

    html += '</ul>';
    return html;
  }
}
