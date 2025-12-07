import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, OnDestroy } from '@angular/core';
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
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmMessages, ToastMessages } from '../../../../shared/constants/messages.constants';
import { ApiResponse } from '../../../../shared/interfaces/api-response';
import { firstValueFrom, Subscription } from 'rxjs';
import { ApproveOrderCommand, SeparateOrderCommand, FinalizeOrderCommand } from '../../interfaces/order-commands';
import { OrderItem } from '../../interfaces/orderItem';
import { TagModule } from 'primeng/tag';
import { getOrderSeverity, getOrderStatus } from '../../../../shared/utils/order-status.utils';
import { BaseComponent } from '../../../../core/components/base/base.component';
import { FormHelperService } from '../../../../core/services/form-helper.service';
import { LotToSeparate } from '../../interfaces/lotToSeparate';

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
    SpinnerComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './order-action-modal.component.html',
  styleUrl: './order-action-modal.component.scss'
})
export class OrderActionModalComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy {
  @Input() display = false;
  @Input() order: Order | undefined;
  @Input() actionType!: OrderActionType;
  @Input() responsibleEmployeeOptions: any[] = [];

  @Output() displayChange = new EventEmitter<boolean>();
  @Output() onActionComplete = new EventEmitter<Order>();

  OrderActionType = OrderActionType;
  actionForm!: FormGroup;
  formSubmitted = false;
  confirmMessage = '';

  currentAccountId: number;
  pickingDetails: Order | undefined;

  private orderFormLabels: { [key: string]: string; } = {
    responsibleEmployeeId: 'Responsável',
    approvedQuantity: 'Quantidade Aprovada',
    actualQuantity: 'Quantidade Real',
    quantityToSeparate: 'Qtd. a Separar',
  };

  getOrderSeverity = getOrderSeverity;
  getOrderStatus = getOrderStatus;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private authService: AuthService,
    private formHelperService: FormHelperService,
  ) {
    super();
    const userId = this.authService.getUserId();
    this.currentAccountId = userId ? Number(userId) : 0;
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['display'] && changes['display'].currentValue) || changes['order']) {
      if (this.order) {
        this.pickingDetails = undefined;
        if (this.actionType === OrderActionType.Separate) {
          this.loadPickingDetails(this.order.id);
        } else {
          this.populateForm(this.order);
        }
      }
    }

    if (changes['actionType'] && this.order) {
      if (changes['actionType'].currentValue === OrderActionType.Separate) {
        this.loadPickingDetails(this.order.id);
      } else {
        this.populateForm(this.order);
      }
    }
  }

  public getFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  private async loadPickingDetails(orderId: number): Promise<void> {
    this.isLoading = true;
    try {
      const response = await firstValueFrom(this.orderService.getPickingDetails(orderId));
      this.isLoading = false;
      if (response.success && response.data) {
        this.pickingDetails = response.data;
        this.populateForm(this.pickingDetails);
      } else {
        this.toastService.showError('Erro ao carregar detalhes da separação.');
        this.closeModal();
      }
    } catch (error) {
      this.isLoading = false;
      this.handleApiError(error);
      this.closeModal();
    }
  }

  private initForm(): void {
    this.actionForm = this.fb.group({
      id: [this.order?.id],
      responsibleEmployeeId: [null, Validators.required],
      accountId: [this.currentAccountId],
      orderItems: this.fb.array([])
    });
  }

  private populateForm(orderData: Order): void {
    if (!orderData || !this.actionForm) {
      return;
    }

    this.actionForm.patchValue({
      id: orderData.id,
      accountId: this.currentAccountId,
      responsibleEmployeeId: this.actionType === OrderActionType.Separate
        ? orderData.separatedByEmployee?.id || null
        : null
    });

    if (this.actionType === OrderActionType.Approve && !orderData.approvedByEmployee?.id) {
      this.actionForm.get('responsibleEmployeeId')?.setValue(null);
    } else if (this.actionType === OrderActionType.Separate && !orderData.separatedByEmployee?.id) {
      this.actionForm.get('responsibleEmployeeId')?.setValue(null);
    } else if (this.actionType === OrderActionType.Finalize && !orderData.finalizedByEmployee?.id) {
      this.actionForm.get('responsibleEmployeeId')?.setValue(null);
    } else {
      if (this.actionType === OrderActionType.Detail) {
        this.actionForm.get('responsibleEmployeeId')?.clearValidators();
        this.actionForm.get('responsibleEmployeeId')?.updateValueAndValidity();
      }
    }

    const orderItemsFormArray = this.actionForm.get('orderItems') as FormArray;
    orderItemsFormArray.clear();

    orderData.orderItems.forEach(item => {
      if (this.actionType === OrderActionType.Separate && item.lotsToSeparate && item.lotsToSeparate.length > 0) {
        const lotsFormArray = this.fb.array(
          item.lotsToSeparate.map(lot => this.createLotFormGroup(lot))
        );

        const itemGroup = this.fb.group({
          id: [item.id],
          productId: [item.productId],
          productName: [item.productName],
          requestedQuantity: [item.requestedQuantity],
          availableQuantity: [item.availableQuantity],
          approvedQuantity: [item.approvedQuantity],
          actualQuantity: [item.actualQuantity],
          lotsToSeparate: lotsFormArray
        });
        orderItemsFormArray.push(itemGroup);
      } else {
        const itemGroup = this.fb.group({
          id: [item.id],
          productId: [item.productId],
          productName: [item.productName],
          requestedQuantity: [item.requestedQuantity],
          availableQuantity: [item.availableQuantity],
          approvedQuantity: [item.approvedQuantity === 0 ? null : item.approvedQuantity],
          actualQuantity: [item.actualQuantity === 0 ? null : item.actualQuantity],
        });
        this.applyConditionalValidators(itemGroup, item);
        orderItemsFormArray.push(itemGroup);
      }
    });
    this.actionForm.get('responsibleEmployeeId')?.updateValueAndValidity();
  }

  private createLotFormGroup(lot: LotToSeparate): FormGroup {
    return this.fb.group({
      stockLotId: [lot.stockLotId],
      batch: [lot.batch],
      expiryDate: [lot.expiryDate],
      initialLotQuantity: [lot.quantityToSeparate],
      quantityToSeparate: [lot.quantityToSeparate || 0, [Validators.required, Validators.min(0)]],
      unitValue: [lot.unitValue],
    });
  }

  getLotsFormArray(itemGroup: AbstractControl): FormArray {
    return itemGroup.get('lotsToSeparate') as FormArray;
  }

  private applyConditionalValidators(itemGroup: FormGroup, item: OrderItem): void {
    const approvedQuantityControl = itemGroup.get('approvedQuantity');
    if (approvedQuantityControl) {
      approvedQuantityControl.clearValidators();
      if (this.actionType === OrderActionType.Approve) {
        approvedQuantityControl.setValidators([
          Validators.required,
          Validators.min(0),
          Validators.max(item.requestedQuantity || 0)
        ]);
        if (approvedQuantityControl.value === null) {
          approvedQuantityControl.setValue(item.requestedQuantity);
        }
      }
      approvedQuantityControl.updateValueAndValidity();
    }

    const actualQuantityControl = itemGroup.get('actualQuantity');
    if (actualQuantityControl) {
      actualQuantityControl.clearValidators();
      if (this.actionType === OrderActionType.Separate && !(itemGroup.get('lotsToSeparate') instanceof FormArray)) {
        actualQuantityControl.setValidators([
          Validators.required,
          Validators.min(0),
          Validators.max(item.approvedQuantity || 0)
        ]);
        if (actualQuantityControl.value === null) {
          actualQuantityControl.setValue(item.approvedQuantity);
        }
      }
      actualQuantityControl.updateValueAndValidity();
    }
  }

  get orderItemsFormArray(): FormArray {
    return this.actionForm.get('orderItems') as FormArray;
  }

  private validateForm(formGroup: FormGroup, labels: { [key: string]: string; }): boolean {
    this.formHelperService.markAllControlsAsTouched(formGroup);

    if (formGroup.valid) {
      return true;
    }

    const invalidControls = this.formHelperService.findInvalidControlsRecursive(formGroup);
    const invalidFields = invalidControls.map(control => {
      const controlName = this.getFormControlName(control, labels);
      return controlName;
    }).filter(name => name !== '');

    const invalidFieldsMessage = invalidFields.length > 0
      ? `Por favor, preencha os seguintes campos: ${invalidFields.join(', ')}.`
      : ToastMessages.FILL_IN_ALL_REQUIRED_FIELDS;

    this.toastService.showError(invalidFieldsMessage);
    return false;
  }

  private getFormControlName(control: AbstractControl, labels: { [key: string]: string; }): string {
    const parent = control.parent;

    if (parent instanceof FormGroup) {
      for (const name in parent.controls) {
        if (control === parent.controls[name]) {
          const defaultLabel = labels[name] || name.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
          if (parent.parent instanceof FormArray) {
            const itemFormArray = parent.parent as FormArray;
            if (name === 'quantityToSeparate') {
              const itemGroup = itemFormArray.parent as FormGroup;
              const itemName = itemGroup.get('productName')?.value || 'Produto Desconhecido';
              const batch = parent.get('batch')?.value || 'Lote Desconhecido';
              return `${itemName} - ${batch} - ${defaultLabel}`;
            }

            if (itemFormArray.parent?.get('orderItems') === itemFormArray) {
              const itemName = parent.get('productName')?.value || 'Item de Pedido';
              return `${itemName} - ${defaultLabel}`;
            }
          }

          return defaultLabel;
        }
      }
    }
    return '';
  }

  async onActionClick(): Promise<void> {
    this.formSubmitted = true;
    this.cleanNumericFormValues();

    if (!this.validateForm(this.actionForm, this.orderFormLabels)) {
      return;
    }

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
            approvedByEmployeeId: formValue.responsibleEmployeeId,
            approvedByAccountId: formValue.accountId,
            orderItems: formValue.orderItems.map((item: any) => ({
              orderItemId: item.id,
              approvedQuantity: item.approvedQuantity ?? 0
            }))
          };
          response = await firstValueFrom(this.orderService.approveOrder(approveCommand));
          break;
        case OrderActionType.Separate:
          const totalActualQuantityCommand: SeparateOrderCommand = {
            orderId: formValue.id,
            separatedByEmployeeId: formValue.responsibleEmployeeId,
            separatedByAccountId: formValue.accountId,
            orderItems: formValue.orderItems.map((item: any) => ({
              orderItemId: item.id,
              actualQuantity: item.lotsToSeparate && item.lotsToSeparate.length > 0
                ? item.lotsToSeparate.reduce((sum: number, lot: any) => sum + (lot.quantityToSeparate ?? 0), 0)
                : item.actualQuantity ?? 0
            }))
          };
          response = await firstValueFrom(this.orderService.separateOrder(totalActualQuantityCommand));
          break;
        case OrderActionType.Finalize:
          const finalizeCommand: FinalizeOrderCommand = {
            orderId: formValue.id,
            finalizedByEmployeeId: formValue.responsibleEmployeeId,
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

  private cleanNumericFormValues(): void {
    const orderItems = this.actionForm.get('orderItems') as FormArray;
    orderItems.controls.forEach(control => {
      const approvedQuantity = control.get('approvedQuantity');
      const actualQuantity = control.get('actualQuantity');

      if (approvedQuantity && approvedQuantity.value === null) {
        approvedQuantity.setValue(0);
      }

      if (this.actionType === OrderActionType.Separate) {
        const lots = control.get('lotsToSeparate') as FormArray;
        if (lots) {
          lots.controls.forEach(lotControl => {
            const quantityToSeparate = lotControl.get('quantityToSeparate');
            if (quantityToSeparate && quantityToSeparate.value === null) {
              quantityToSeparate.setValue(0);
            }
          });
        }
      } else {
        if (actualQuantity && actualQuantity.value === null) {
          actualQuantity.setValue(0);
        }
      }
    });
  }

  closeModal() {
    this.displayChange.emit(false);
    this.formSubmitted = false;
    this.actionForm.reset();
    this.orderItemsFormArray.clear();
    this.initForm();
    this.pickingDetails = undefined;
  }
}
