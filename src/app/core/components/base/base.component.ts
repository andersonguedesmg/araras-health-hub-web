import { Directive, inject, ViewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastMessages } from '../../../shared/constants/messages.constants';
import { ApiResponse } from '../../../shared/interfaces/api-response';
import { ToastService } from '../../../shared/services/toast/toast.service';
import { ExportApiFunction } from '../../interfaces/export-api-function';

@Directive()
export abstract class BaseComponent {
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;
  protected toastService: ToastService;

  isLoading = false;

  constructor() {
    this.toastService = inject(ToastService);
  }

  protected handleApiResponse(
    response: ApiResponse<any>,
    successMessage: string,
  ) {
    if (response.success) {
      this.toastService.showSuccess(response.message || successMessage);
    } else {
      this.toastService.handleApiError(response);
    }
  }

  protected handleApiError(error: any) {
    this.toastService.handleApiError(error);
  }

  protected validateFormAndShowErrors(
    form: any,
    formHelperService: any,
    formLabels: any,
  ): boolean {
    if (form.valid) {
      return true;
    }
    const invalidControls =
      formHelperService.findInvalidControlsRecursive(form);
    const invalidFields = invalidControls.map((control: any) =>
      formHelperService.getFormControlName(control, formLabels),
    );
    const invalidFieldsMessage =
      invalidFields.length > 0
        ? `Por favor, preencha os seguintes campos: ${invalidFields.join(', ')}.`
        : ToastMessages.FILL_IN_ALL_REQUIRED_FIELDS;
    this.toastService.showError(
      invalidFieldsMessage,
      ToastMessages.REQUIRED_FIELDS,
    );
    return false;
  }

  protected async handleApiCall(
    apiCallFactory: () => Promise<any>,
    confirmMessage: string,
    successMessage: string,
  ): Promise<boolean> {
    if (!this.confirmDialog) {
      try {
        this.isLoading = true;
        const response = await apiCallFactory();
        this.handleApiResponse(response, successMessage);
        return true;
      } catch (error) {
        this.handleApiError(error);
        return false;
      } finally {
        this.isLoading = false;
      }
    }

    try {
      // this.confirmDialog.message = confirmMessage;
      await firstValueFrom(this.confirmDialog.show());
      this.isLoading = true;
      const response = await apiCallFactory();
      this.isLoading = false;
      this.handleApiResponse(response, successMessage);
      return true;
    } catch (error: any) {
      this.isLoading = false;
      if (error !== 'cancel' && error?.message !== 'cancel') {
        this.handleApiError(error);
      }
      return false;
    }
  }

  protected async exportData(
    exportFn: ExportApiFunction,
    defaultFilename: string,
    searchTerm: string = '',
  ): Promise<void> {
    this.isLoading = true;
    try {
      const response = await firstValueFrom(exportFn(searchTerm));
      const contentDisposition = response.headers.get('Content-Disposition');

      const now = new Date();
      const timestamp =
        now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0') +
        now.getHours().toString().padStart(2, '0') +
        now.getMinutes().toString().padStart(2, '0') +
        now.getSeconds().toString().padStart(2, '0');
      let filename = `${defaultFilename}_${timestamp}.csv`;

      if (contentDisposition) {
        const matches = /filename\*?="?([^;"]+)"?/.exec(contentDisposition);
        if (matches && matches.length > 1) {
          filename = decodeURIComponent(matches[1].replace(/\+/g, ' '));
        }
      }

      const blob = response.body;
      if (!blob) {
        throw new Error('O corpo da resposta está vazio.');
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);

      this.toastService.showSuccess(ToastMessages.SUCCESS_EXPORT);
    } catch (error: any) {
      this.handleApiError(error);
      if (!error?.error?.message && error?.message !== 'cancel') {
        this.toastService.showError(ToastMessages.UNEXPECTED_ERROR);
      }
    } finally {
      this.isLoading = false;
    }
  }
}
