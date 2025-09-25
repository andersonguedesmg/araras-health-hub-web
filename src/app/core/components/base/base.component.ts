import { Directive, ViewChild } from '@angular/core';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { ApiResponse } from '../../../shared/interfaces/api-response';
import { ToastSeverities, ToastSummaries } from '../../../shared/constants/toast.constants';
import { ToastMessages } from '../../../shared/constants/messages.constants';
import { HttpStatus } from '../../../shared/enums/http-status.enum';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { firstValueFrom } from 'rxjs';

@Directive()
export abstract class BaseComponent {
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  isLoading = false;

  protected handleApiResponse(response: ApiResponse<any>, successMessage: string) {
    if (response.success) {
      this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, response.message || successMessage);
    } else {
      this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, response.message || ToastMessages.UNEXPECTED_ERROR);
    }
  }

  protected handleApiError(error: any) {
    if (this.toastComponent) {
      if (error.error && error.error.statusCode === HttpStatus.NotFound) {
        this.toastComponent.showMessage(ToastSeverities.INFO, ToastSummaries.INFO, error.error.message);
      } else if (error.error && error.error.message) {
        this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, error.error.message);
      } else {
        this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, ToastMessages.UNEXPECTED_ERROR);
      }
    }
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
      : ToastMessages.REQUIRED_FIELDS;
    this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, invalidFieldsMessage);
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
