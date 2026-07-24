import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import {
  ToastSeverities,
  ToastSummaries,
} from '../../constants/toast.constants';
import {
  ApiValidationErrors,
  BaseApiResponse,
} from '../../interfaces/base-api-response';

interface ProblemDetailsError {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  traceId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly messageService = inject(MessageService);

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

  showInfo(message: string, summary: string = ToastSummaries.INFO): void {
    this.messageService.add({
      severity: ToastSeverities.INFO,
      summary: summary,
      detail: message,
    });
  }

  clearAll(): void {
    this.messageService.clear();
  }

  handleApiError(error: unknown): void {
    let detailMessage = 'Ocorreu um erro desconhecido.';
    let summary = ToastSummaries.ERROR;
    const severity = ToastSeverities.ERROR;

    this.messageService.clear();

    if (error instanceof HttpErrorResponse) {
      const problemDetail = error.error as ProblemDetailsError;

      if (problemDetail && (problemDetail.detail || problemDetail.title)) {
        summary = problemDetail.title || ToastSummaries.ERROR;
        detailMessage =
          problemDetail.detail || 'Erro de processamento na requisição.';
      } else {
        const apiResponse = error.error as any;
        if (apiResponse && apiResponse.errors) {
          summary = apiResponse.message || ToastSummaries.ERROR;
          detailMessage = this.formatValidationErrors(apiResponse.errors);
        } else if (apiResponse && apiResponse.message) {
          detailMessage = apiResponse.message;
        } else {
          detailMessage = `Erro [${error.status}]: ${error.statusText || error.message}`;
        }
      }
    } else if (this.isBaseApiResponse(error)) {
      if (error.errors) {
        summary = 'Ocorreram um ou mais erros de validação.';
        detailMessage = this.formatValidationErrors(error.errors);
      } else {
        detailMessage = error.message;
      }
    } else if (error instanceof Error) {
      detailMessage = error.message;
    }

    this.messageService.add({
      severity: severity,
      summary: summary,
      detail: detailMessage,
      life: 5000,
    });
  }

  private isBaseApiResponse(obj: any): obj is BaseApiResponse<unknown> {
    return (
      obj &&
      typeof obj === 'object' &&
      'success' in obj &&
      obj.success === false
    );
  }

  private formatValidationErrors(errors: ApiValidationErrors): string {
    let html = '<ul class="p-0 m-0 list-none">';
    for (const key in errors) {
      if (Object.prototype.hasOwnProperty.call(errors, key)) {
        errors[key].forEach((error) => {
          const fieldName =
            key !== '$' && key.length < 50
              ? `<span class="font-bold">${key}</span>: `
              : '';
          html += `<li class="mt-1">${fieldName}${error}</li>`;
        });
      }
    }
    html += '</ul>';
    return html;
  }
}
