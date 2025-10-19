import { Directive, inject, ViewChild } from '@angular/core';
import { ApiResponse } from '../../../shared/interfaces/api-response';
import { ToastMessages } from '../../../shared/constants/messages.constants';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '../../../shared/services/toast.service';

@Directive()
export abstract class BaseComponent {
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;
  protected toastService: ToastService;

  isLoading = false;

  constructor() {
    this.toastService = inject(ToastService);
  }

  protected handleApiResponse(response: ApiResponse<any>, successMessage: string) {
    if (response.success) {
      this.toastService.showSuccess(response.message || successMessage);
    } else {
      this.toastService.handleApiError(response);
    }
  }

  protected handleApiError(error: any) {
    this.toastService.handleApiError(error);
  }

  protected changeIsActive(objeto: any) {
    if (objeto && typeof objeto === 'object' && 'isActive' in objeto) {
      objeto.isActive = !objeto.isActive;
    }
    return objeto;
  }

  protected validateFormAndShowErrors(form: any, formHelperService: any, formLabels: any): boolean {
    if (form.valid) {
      return true;
    }
    const invalidControls = formHelperService.findInvalidControlsRecursive(form);
    const invalidFields = invalidControls.map((control: any) => formHelperService.getFormControlName(control, formLabels));
    const invalidFieldsMessage = invalidFields.length > 0
      ? `Por favor, preencha os seguintes campos: ${invalidFields.join(', ')}.`
      : ToastMessages.FILL_IN_ALL_REQUIRED_FIELDS;
    this.toastService.showError(invalidFieldsMessage, ToastMessages.REQUIRED_FIELDS);
    return false;
  }

  protected async handleApiCall(
    apiCall: Promise<any> | any,
    confirmMessage: string,
    successMessage: string
  ): Promise<void> {
    if (this.confirmDialog) {
      this.confirmDialog.message = confirmMessage;
      this.confirmDialog.show();
    }

    try {
      if (this.confirmDialog) {
        await firstValueFrom(this.confirmDialog.confirmed);
      }

      this.isLoading = true;
      const response = await apiCall;
      this.isLoading = false;
      this.handleApiResponse(response, successMessage);
    } catch (error: any) {
      this.isLoading = false;
      if (error.message !== 'cancel') {
        this.handleApiError(error);
      }
    }
  }
}
