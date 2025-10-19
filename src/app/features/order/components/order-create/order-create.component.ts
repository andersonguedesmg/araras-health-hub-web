import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmMessages, ToastMessages } from '../../../../shared/constants/messages.constants';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ConfirmMode } from '../../../../shared/enums/confirm-mode.enum';
import { StatusOptions } from '../../../../shared/constants/status-options.constants';
import { firstValueFrom } from 'rxjs';
import { SelectOptions } from '../../../../shared/interfaces/select-options';
import { AuthService } from '../../../../core/services/auth.service';
import { TextareaModule } from 'primeng/textarea';
import { OrderService } from '../../services/order.service';
import { Order } from '../../interfaces/order';
import { DropdownDataService } from '../../../../shared/services/dropdown-data.service';
import { BaseComponent } from '../../../../core/components/base/base.component';

@Component({
  selector: 'app-order-create',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    ToastModule,
    ToolbarModule,
    ButtonModule,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
    InputNumberModule,
    TextareaModule,
    TooltipModule,
    DatePickerModule,
    DialogModule,
    SelectModule,
    BreadcrumbComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
  ],
  providers: [MessageService],
  templateUrl: './order-create.component.html',
  styleUrl: './order-create.component.scss'
})
export class OrderCreateComponent extends BaseComponent implements OnInit {
  @ViewChild(SpinnerComponent) spinnerComponent!: SpinnerComponent;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Pedidos' }, { label: 'Novo Pedido' }];
  title: string = 'Novo Pedido';

  orderForm: FormGroup;
  employeeOptions: SelectOptions<number>[] = [];
  productOptions: SelectOptions<number>[] = [];

  FormMode = FormMode;
  ConfirmMode = ConfirmMode;
  statusOptions = StatusOptions;

  formMode: FormMode.Create | FormMode.Update | FormMode.Detail = FormMode.Create;

  displayDialog = false;
  formSubmitted = false;

  confirmMode: ConfirmMode.Create | ConfirmMode.Update | null = null;
  confirmMessage = '';

  private orderFormLabels: { [key: string]: string; } = {
    createdByEmployeeId: 'Responsável',
    createdAt: 'Data',
    orderItems: 'Itens do Pedido',
    productId: 'Produto',
    requestedQuantity: 'Quantidade Solicitada',
  };

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private authService: AuthService,
    private dropdownDataService: DropdownDataService,
  ) {
    super();
    this.orderForm = this.fb.group({
      id: [{ value: null, disabled: true }],
      observation: [''],
      orderStatusId: [1],
      createdAt: [new Date(), Validators.required],
      createdByEmployeeId: [null, Validators.required],
      createdByAccountId: this.authService.getUserId(),
      orderItems: this.fb.array([], Validators.minLength(1)),
    });
  }

  async ngOnInit(): Promise<void> {
    this.addOrderItem();
    this.employeeOptions = await this.dropdownDataService.getEmployeeOptions();
    this.productOptions = await this.dropdownDataService.getProductOptions();
  }

  get orderItems(): FormArray {
    return this.orderForm.get('orderItems') as FormArray;
  }

  addOrderItem(): void {
    const itemGroup = this.fb.group({
      productId: [null, Validators.required],
      requestedQuantity: ['', [Validators.required, Validators.min(1)]],
    });

    this.orderItems.push(itemGroup);
  }

  removeOrderItem(index: number): void {
    if (this.orderItems.length > 1) {
      this.orderItems.removeAt(index);
    }
  }

  async saveOrder(): Promise<void> {
    this.formSubmitted = true;
    if (this.validateForm(this.orderForm, this.orderFormLabels)) {
      this.confirmMessage = this.formMode === FormMode.Create ? ConfirmMessages.CREATE_ORDER : ConfirmMessages.UPDATE_ORDER;
      this.confirmDialog.message = this.confirmMessage;
      this.confirmDialog.show();

      try {
        await firstValueFrom(this.confirmDialog.confirmed);
        this.spinnerComponent.loading = true;
        const order: Order = this.orderForm.getRawValue();

        const apiCall$ = this.formMode === FormMode.Create
          ? this.orderService.createOrder(order)
          : this.orderService.updateOrder(order, order.id);

        const response = await firstValueFrom(apiCall$);

        this.spinnerComponent.loading = false;
        this.handleApiResponse(response, ToastMessages.SUCCESS_OPERATION);
        this.resetOrderForm();

      } catch (error: any) {
        this.spinnerComponent.loading = false;
        if (error.message !== 'cancel') {
          this.handleApiError(error);
        }
      }
    }
  }

  public resetOrderForm(): void {
    this.orderForm.reset({
      createdAt: new Date(),
      createdByAccountId: this.authService.getUserId(),
    });
    this.orderItems.clear();
    this.addOrderItem();
    this.formSubmitted = false;
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

    this.toastService.showError(invalidFieldsMessage);
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
          }
          else if (!(control instanceof FormGroup) && !(control instanceof FormArray)) {
            invalidControls.push(control);
          }
          else {
            invalidControls.push(...this.findInvalidControlsRecursive(control));
          }
        }
      });
    }
    return invalidControls;
  }

  private getFormControlName(control: AbstractControl, labels: { [key: string]: string; }): string {
    const parent = control.parent;

    if (control instanceof FormArray && control.errors?.['minlength']) {
      const parentFormGroup = control.parent as FormGroup;
      if (parentFormGroup) {
        for (const name in parentFormGroup.controls) {
          if (control === parentFormGroup.controls[name]) {
            return labels[name] || `Pelo menos um item em '${name.replace(/([A-Z])/g, ' $1').toLowerCase()}' é obrigatório`;
          }
        }
      }
    }

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
}
