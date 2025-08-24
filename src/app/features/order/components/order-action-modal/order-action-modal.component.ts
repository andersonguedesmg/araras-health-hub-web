import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { OrderActionType } from '../../../../shared/enums/order-action-type.enum';
import { Order } from '../../interfaces/order';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../../../core/services/auth.service';
import { DropdownDataService } from '../../../../shared/services/dropdown-data.service';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmMessages, ToastMessages } from '../../../../shared/constants/messages.constants';
import { ToastSeverities, ToastSummaries } from '../../../../shared/constants/toast.constants';
import { SelectOptions } from '../../../../shared/interfaces/select-options';
import { ApiResponse } from '../../../../shared/interfaces/api-response';
import { firstValueFrom, Subscription } from 'rxjs';
import { ConfirmMode } from '../../../../shared/enums/confirm-mode.enum';
import { ApproveOrderCommand, SeparateOrderCommand, FinalizeOrderCommand } from '../../interfaces/order-commands';
import { OrderItem } from '../../interfaces/orderItem';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-order-action-modal',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    TableModule,
    InputNumberModule,
    ReactiveFormsModule,
    SelectModule,
    TagModule,
    ToastComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './order-action-modal.component.html',
  styleUrl: './order-action-modal.component.scss'
})
export class OrderActionModalComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(SpinnerComponent) spinnerComponent!: SpinnerComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  @Input() display = false;
  @Input() order!: Order;
  @Input() actionType!: OrderActionType;

  @Output() displayChange = new EventEmitter<boolean>();
  @Output() onActionComplete = new EventEmitter<Order>();

  OrderActionType = OrderActionType;
  actionForm!: FormGroup;
  formSubmitted = false;
  isLoading = false;

  employeeOptions: SelectOptions<number>[] = [];
  currentAccountId: string;

  confirmMessage = '';
  confirmMode: ConfirmMode = ConfirmMode.Create;

  private subscriptions: Subscription = new Subscription();

  private actionFormLabels: { [key: string]: string; } = {
    responsibleId: 'Responsável',
    approvedQuantity: 'Quantidade Aprovada',
    actualQuantity: 'Quantidade Real',
  };

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private authService: AuthService,
    private dropdownDataService: DropdownDataService,
  ) {
    this.currentAccountId = this.authService.getUserId() || '';
    this.initForm();
  }

  async ngOnInit(): Promise<void> {
    this.isLoading = true;
    try {
      this.employeeOptions = await this.dropdownDataService.getEmployeeOptions();
    } catch (error) {
      console.error('Erro ao carregar opções de funcionário:', error);
      this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, 'Erro ao carregar responsáveis. Por favor, tente novamente.');
    } finally {
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('changes', changes);
    console.log('this.employeeOptions', this.employeeOptions);
    console.log('this.currentAccountId', this.currentAccountId);
    console.log('this.order', this.order);
    console.log('this.actionType', this.actionType);
    if (changes['order'] && this.order) {
      this.populateForm();
    }
    if (changes['actionType']) {
      this.populateForm();
    }
  }

  private initForm(): void {
    this.actionForm = this.fb.group({
      id: [this.order?.id],
      responsibleId: [null, Validators.required],
      accountId: [this.currentAccountId],
      orderItems: this.fb.array([])
    });
  }

  private populateForm(): void {
    if (!this.order || !this.actionForm) {
      return;
    }

    this.actionForm.patchValue({
      id: this.order.id,
      accountId: this.currentAccountId,
    });

    const orderItemsFormArray = this.actionForm.get('orderItems') as FormArray;
    orderItemsFormArray.clear();

    this.order.orderItems.forEach(item => {
      const itemGroup = this.fb.group({
        id: [item.id],
        productId: [item.productId],
        // productName: [item.productName],
        requestedQuantity: [item.requestedQuantity],
        // availableQuantity: [item.availableQuantity || 0],
        approvedQuantity: [item.approvedQuantity || 0],
        actualQuantity: [item.actualQuantity || 0],
      });

      this.applyConditionalValidators(itemGroup, item);

      orderItemsFormArray.push(itemGroup);
    });
    this.actionForm.get('responsibleId')?.updateValueAndValidity();
  }

  private applyConditionalValidators(itemGroup: FormGroup, item: OrderItem): void {
    // Validação para Quantidade Aprovada
    const approvedQuantityControl = itemGroup.get('approvedQuantity');
    if (approvedQuantityControl) {
      approvedQuantityControl.clearValidators();
      if (this.actionType === OrderActionType.Approve) {
        approvedQuantityControl.setValidators([
          Validators.required,
          Validators.min(0),
          Validators.max(item.requestedQuantity || 0)
        ]);
      }
      approvedQuantityControl.updateValueAndValidity();
    }

    // Validação para Quantidade Real
    const actualQuantityControl = itemGroup.get('actualQuantity');
    if (actualQuantityControl) {
      actualQuantityControl.clearValidators();
      if (this.actionType === OrderActionType.Separate) {
        actualQuantityControl.setValidators([
          Validators.required,
          Validators.min(0),
          Validators.max(item.approvedQuantity || 0)
        ]);
      }
      actualQuantityControl.updateValueAndValidity();
    }
  }

  get orderItemsFormArray(): FormArray {
    return this.actionForm.get('orderItems') as FormArray;
  }

  private validateForm(formGroup: FormGroup, labels: { [key: string]: string; }): boolean {
    this.markAllControlsAsTouched(formGroup);

    if (formGroup.valid) {
      return true;
    }

    const invalidControls = this.findInvalidControlsRecursive(formGroup);
    const invalidFields = invalidControls.map(control => {
      const controlName = this.getFormControlName(control, labels);
      return controlName;
    }).filter(name => name !== '');

    const invalidFieldsMessage = invalidFields.length > 0
      ? `Por favor, preencha os seguintes campos: ${invalidFields.join(', ')}.`
      : ToastMessages.REQUIRED_FIELDS;

    this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, invalidFieldsMessage);
    return false;
  }

  private markAllControlsAsTouched(abstractControl: AbstractControl): void {
    if (abstractControl instanceof FormGroup) {
      Object.values(abstractControl.controls).forEach(control => {
        control.markAsTouched();
        if (control instanceof FormGroup || control instanceof FormArray) {
          this.markAllControlsAsTouched(control);
        }
      });
    } else if (abstractControl instanceof FormArray) {
      abstractControl.controls.forEach(control => {
        control.markAsTouched();
        if (control instanceof FormGroup || control instanceof FormArray) {
          this.markAllControlsAsTouched(control);
        }
      });
    }
  }

  private findInvalidControlsRecursive(form: FormGroup | AbstractControl): AbstractControl[] {
    const invalidControls: AbstractControl[] = [];

    if (form instanceof FormGroup || form instanceof FormArray) {
      Object.values(form.controls).forEach(control => {
        if (control.invalid) {
          if (control instanceof FormArray && control.errors?.['minlength']) {
            invalidControls.push(control);
          } else if (!(control instanceof FormGroup) && !(control instanceof FormArray)) {
            invalidControls.push(control);
          } else {
            invalidControls.push(...this.findInvalidControlsRecursive(control));
          }
        }
      });
    }
    return invalidControls;
  }

  private getFormControlName(control: AbstractControl, labels: { [key: string]: string; }): string {
    const parent = control.parent;

    if (parent instanceof FormGroup) {
      for (const name in parent.controls) {
        if (control === parent.controls[name]) {
          return labels[name] || name.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
        }
      }
    }

    if (parent instanceof FormGroup && parent.parent instanceof FormArray) {
      const itemFormArray = parent.parent as FormArray;
      const itemIndex = itemFormArray.controls.indexOf(parent);

      for (const subControlName in parent.controls) {
        if (control === parent.controls[subControlName]) {
          const label = labels[subControlName] || subControlName.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
          return `Item ${itemIndex + 1} - ${label}`;
        }
      }
    }
    return '';
  }

  async onActionClick(): Promise<void> {
    this.formSubmitted = true;

    if (!this.validateForm(this.actionForm, this.actionFormLabels)) {
      return;
    }

    // Configura a mensagem de confirmação
    switch (this.actionType) {
      case OrderActionType.Approve:
        this.confirmMessage = ConfirmMessages.APPROVE_ORDER;
        break;
      case OrderActionType.Separate:
        this.confirmMessage = ConfirmMessages.SEPARATE_ORDER;
        break;
      case OrderActionType.Finalize:
        this.confirmMessage = ConfirmMessages.FINALIZE_ORDER;
        break;
      default:
        this.confirmMessage = ConfirmMessages.CONFIRM_OPERATION;
        break;
    }
    this.confirmDialog.message = this.confirmMessage;
    this.confirmDialog.show();

    try {
      await firstValueFrom(this.confirmDialog.confirmed);
      this.isLoading = true;
      let response: ApiResponse<Order>;

      const formValue = this.actionForm.getRawValue();

      switch (this.actionType) {
        case OrderActionType.Approve:
          const approveCommand: ApproveOrderCommand = {
            orderId: formValue.id,
            approvedByEmployeeId: formValue.responsibleId,
            approvedByAccountId: formValue.accountId,
            orderItems: formValue.orderItems.map((item: any) => ({
              orderItemId: item.id,
              approvedQuantity: item.approvedQuantity
            }))
          };
          response = await firstValueFrom(this.orderService.approveOrder(approveCommand));
          break;
        case OrderActionType.Separate:
          const separateCommand: SeparateOrderCommand = {
            orderId: formValue.id,
            separatedByEmployeeId: formValue.responsibleId,
            separatedByAccountId: formValue.accountId,
            orderItems: formValue.orderItems.map((item: any) => ({
              orderItemId: item.id,
              actualQuantity: item.actualQuantity
            }))
          };
          response = await firstValueFrom(this.orderService.separateOrder(separateCommand));
          break;
        case OrderActionType.Finalize:
          const finalizeCommand: FinalizeOrderCommand = {
            orderId: formValue.id,
            finalizedByEmployeeId: formValue.responsibleId,
            finalizedByAccountId: formValue.accountId,
          };
          response = await firstValueFrom(this.orderService.finalizeOrder(finalizeCommand));
          break;
        default:
          throw new Error('Tipo de ação desconhecido.');
      }

      this.isLoading = false;
      this.handleApiResponse(response, ToastMessages.SUCCESS_OPERATION);
      if (response.success && response.data) {
        this.onActionComplete.emit(response.data);
      }
      this.closeModal();

    } catch (error: any) {
      this.isLoading = false;
      if (error.message !== 'cancel') {
        this.handleApiError(error);
      }
    }
  }


  private handleApiResponse(response: ApiResponse<any>, successMessage: string): void {
    if (response.success) {
      this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, response.message || successMessage);
    } else {
      this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, response.message || ToastMessages.UNEXPECTED_ERROR);
    }
  }

  private handleApiError(error: any): void {
    if (error.error?.statusCode === 404 || error.error?.statusCode === 400) {
      this.toastComponent.showMessage(ToastSeverities.INFO, ToastSummaries.INFO, error.error.message);
    } else if (error.error?.message) {
      this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, error.error.message);
    } else {
      this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, ToastMessages.UNEXPECTED_ERROR);
    }
  }

  closeModal() {
    this.displayChange.emit(false);
    this.formSubmitted = false;
    this.actionForm.reset();
    this.orderItemsFormArray.clear();
    this.initForm();
  }
}
