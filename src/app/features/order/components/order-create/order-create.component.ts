import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { FormHelperService } from '../../../../core/services/form-helper.service';

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
  itemsBreadcrumb: MenuItem[] = [{ label: 'Pedidos' }, { label: 'Novo Pedido' }];
  title: string = 'Novo Pedido';

  orderForm: FormGroup;
  employeeOptions: SelectOptions<number>[] = [];
  productOptions: SelectOptions<number>[] = [];

  FormMode = FormMode;
  formMode: FormMode = FormMode.Create;
  formSubmitted = false;

  ConfirmMode = ConfirmMode;
  statusOptions = StatusOptions;

  private orderFormLabels: { [key: string]: string; } = {
    createdByEmployeeId: 'Responsável',
    createdAt: 'Data',
    orderItems: 'Itens do Pedido',
    'orderItems.productId': 'Produto',
    'orderItems.requestedQuantity': 'Quantidade Solicitada',
  };

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private authService: AuthService,
    private dropdownDataService: DropdownDataService,
    private formHelperService: FormHelperService,
  ) {
    super();
    this.orderForm = this.fb.group({
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
    this.isLoading = true;
    try {
      this.employeeOptions = await this.dropdownDataService.getEmployeeOptions();
      this.productOptions = await this.dropdownDataService.getProductOptions();
    } catch (error) {
      this.handleApiError(error);
    } finally {
      this.isLoading = false;
    }
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

    if (this.validateFormAndShowErrors(this.orderForm, this.formHelperService, this.orderFormLabels)) {

      const order: Order = this.orderForm.getRawValue();
      const apiCall = firstValueFrom(this.orderService.createOrder(order));

      await this.handleApiCall(
        apiCall,
        ConfirmMessages.CREATE_ORDER,
        ToastMessages.SUCCESS_OPERATION
      );

      this.resetOrderForm();
    }
  }

  public resetOrderForm(): void {
    this.orderForm.reset({
      orderStatusId: 1,
      createdAt: new Date(),
      createdByEmployeeId: null,
      createdByAccountId: this.authService.getUserId(),
    });
    this.orderItems.clear();
    this.addOrderItem();
    this.formSubmitted = false;
  }
}
