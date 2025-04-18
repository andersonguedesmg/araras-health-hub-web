import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
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
import { Table } from 'primeng/table';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ApiResponse } from '../../../../shared/interfaces/apiResponse';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmMessages, ToastMessages } from '../../../../shared/constants/messages.constants';
import { ToastSeverities, ToastSummaries } from '../../../../shared/constants/toast.constants';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ConfirmMode } from '../../../../shared/enums/confirm-mode.enum';
import { HttpStatus } from '../../../../shared/enums/http-status.enum';
import { StatusOptions } from '../../../../shared/constants/status-options.constants';
import { ReceivingService } from '../../services/receiving.service';
import { Receiving } from '../../interfaces/receiving';
import { firstValueFrom } from 'rxjs';
import { SupplierService } from '../../../supplier/services/supplier.service';
import { EmployeeService } from '../../../employee/services/employee.service';
import { ProductService } from '../../../product/services/product.service';
import { SelectOptions } from '../../../../shared/interfaces/select-options';
import { AuthService } from '../../../../core/services/auth.service';
import { Supplier } from '../../../supplier/interfaces/supplier';
import { InputMask } from 'primeng/inputmask';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-receiving-create',
  imports: [
    BreadcrumbComponent,
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    TableModule,
    ToastModule,
    ToolbarModule,
    ButtonModule,
    FormsModule,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
    TooltipModule,
    DialogModule,
    SelectModule,
    DatePickerModule,
    InputNumberModule,
    InputMask,
    TextareaModule,
    ToastComponent,
    SpinnerComponent,
    ConfirmDialogComponent
  ],
  providers: [MessageService],
  templateUrl: './receiving-create.component.html',
  styleUrl: './receiving-create.component.scss'
})
export class ReceivingCreateComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(SpinnerComponent) spinnerComponent!: SpinnerComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Almoxarifado' }, { label: 'Entradas' }, { label: 'Nova' }];

  receivingForm: FormGroup;
  supplierOptions: SelectOptions<number>[] = [];
  employeeOptions: SelectOptions<number>[] = [];
  productOptions: SelectOptions<number>[] = [];

  FormMode = FormMode;
  ConfirmMode = ConfirmMode;
  statusOptions = StatusOptions;

  formMode: FormMode.Create | FormMode.Update | FormMode.Detail = FormMode.Create;

  displayDialog = false;
  formSubmitted = false;

  supplierForm: FormGroup;
  selectedSupplier?: Supplier;

  confirmMode: ConfirmMode.Create | ConfirmMode.Update | null = null;
  confirmMessage = '';

  constructor(
    private fb: FormBuilder,
    private receivingService: ReceivingService,
    private authService: AuthService,
    private supplierService: SupplierService,
    private employeeService: EmployeeService,
    private productService: ProductService) {
    this.receivingForm = this.fb.group({
      id: [{ value: null, disabled: true }],
      invoiceNumber: ['', Validators.required],
      observation: [''],
      supplyAuthorization: ['', Validators.required],
      receivingDate: [new Date(), Validators.required],
      supplierId: [null, Validators.required],
      totalValue: ['', Validators.required],
      responsibleId: [null, Validators.required],
      accountId: this.authService.getUserId(),
      receivedItems: this.fb.array([]),
    });

    this.supplierForm = this.fb.group({
      id: [{ value: null, disabled: true }],
      name: ['', Validators.required],
      cnpj: ['', Validators.required],
      address: ['', Validators.required],
      number: ['', Validators.required],
      neighborhood: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      cep: ['', Validators.required],
      email: ['', Validators.required],
      phone: ['', Validators.required],
      isActive: [{ value: false, disabled: true }],
    });
  }

  async ngOnInit(): Promise<void> {
    this.addReceivedItem();
    this.loadSupplierNames();
    this.loadEmployeeNames();
    this.loadProductsNames();
  }

  get receivedItems(): FormArray {
    return this.receivingForm.get('receivedItems') as FormArray;
  }

  addReceivedItem(): void {
    const itemGroup = this.fb.group({
      productId: [null, Validators.required],
      quantity: ['', Validators.required],
      unitValue: ['', Validators.required],
      totalValue: [{ value: '', disabled: true }, Validators.required],
      batch: [''],
      expiryDate: [],
    });

    this.receivedItems.push(itemGroup);
    this.setupValueChangeListener(itemGroup);
  }

  private setupValueChangeListener(itemGroup: FormGroup): void {
    const quantityCtrl = itemGroup.get('quantity');
    const unitValueCtrl = itemGroup.get('unitValue');
    const totalValueCtrl = itemGroup.get('totalValue');

    quantityCtrl?.valueChanges.subscribe(() => {
      this.updateTotalValue(itemGroup);
    });

    unitValueCtrl?.valueChanges.subscribe(() => {
      this.updateTotalValue(itemGroup);
    });
  }

  private updateTotalValue(itemGroup: FormGroup): void {
    const quantity = parseFloat(itemGroup.get('quantity')?.value);
    const unitValue = parseFloat(itemGroup.get('unitValue')?.value);
    const totalValueCtrl = itemGroup.get('totalValue');

    if (!isNaN(quantity) && !isNaN(unitValue)) {
      const total = quantity * unitValue;
      totalValueCtrl?.setValue(total.toFixed(2), { emitEvent: false });
    } else {
      totalValueCtrl?.setValue('', { emitEvent: false });
    }
  }

  removeReceivedItem(index: number): void {
    this.receivedItems.removeAt(index);
  }

  async saveReceiving(): Promise<void> {
    this.formSubmitted = true;
    if (this.receivingForm.valid) {
      if (!this.isTotalValueValid()) {
        this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, ToastMessages.SUM_TOTAL_VALUES_ITEMS_DIFFERENT_TOTAL_VALUE);
        return;
      }
      if (this.formMode === FormMode.Create) {
        this.confirmMessage = ConfirmMessages.CREATE_RECEIVING;
        this.confirmMode = ConfirmMode.Create;
      } else if (this.formMode === FormMode.Update) {
        this.confirmMessage = ConfirmMessages.UPDATE_RECEIVING;
        this.confirmMode = ConfirmMode.Update;
      }
      this.confirmDialog.message = this.confirmMessage;
      this.confirmDialog.show();

      try {
        await firstValueFrom(this.confirmDialog.confirmed);
        this.spinnerComponent.loading = true;
        const receiving: Receiving = this.receivingForm.getRawValue();
        let response: any = null;
        if (this.confirmMode === ConfirmMode.Create) {
          response = await this.receivingService.createReceiving(receiving);
        } else if (this.confirmMode === ConfirmMode.Update) {
          // response = await this.receivingService.createReceiving(receiving, receiving.id);
        }
        this.spinnerComponent.loading = false;
        if (response && (response.statusCode === HttpStatus.Ok || response.statusCode === HttpStatus.Created)) {
          this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, response.message);
          this.resetReceivingForm();
        } else if (response) {
          this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, response.message);
        }
        this.confirmMode = null;
      } catch (error: any) {
        this.spinnerComponent.loading = false;
        if (error && error.error && error.error.message) {
          this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, error.error.message);
        } else {
          this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, ToastMessages.UNEXPECTED_ERROR);
        }
        this.confirmMode = null;

        try {
          await firstValueFrom(this.confirmDialog.rejected);
          this.confirmMode = null;
        } catch (rejectError) {
          this.confirmMode = null;
        }
      }
    } else {
      this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, ToastMessages.REQUIRED_FIELDS);
    }
  }

  private isTotalValueValid(): boolean {
    const itemsTotal = this.receivedItems.controls.reduce((sum, item) => {
      const rawValue = item.get('totalValue')?.value ?? '0';
      const normalized = String(rawValue).replace(',', '.');

      const val = parseFloat(normalized);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    const rawFormTotal = this.receivingForm.get('totalValue')?.value ?? '0';
    const formTotal = parseFloat(String(rawFormTotal).replace(',', '.'));

    const precision = 0.01;
    return Math.abs(itemsTotal - formTotal) < precision;
  }

  private resetReceivingForm(): void {
    this.receivingForm.reset({
      receivingDate: new Date(),
      accountId: this.authService.getUserId(),
    });
    const firstReceivedItem = this.receivedItems.controls[0]?.getRawValue();
    this.receivedItems.clear();

    if (firstReceivedItem) {
      this.addReceivedItem();
      const newItem = this.receivedItems.at(0);
      newItem.patchValue(firstReceivedItem);
    }
  }

  async loadSupplierNames(): Promise<void> {
    try {
      const response: ApiResponse<any[]> = await this.supplierService.getAllSupplierNames();
      if (response && response.data) {
        this.supplierOptions = response.data.map((supplier) => ({
          label: supplier.name,
          value: supplier.id,
        }));
      }
    } catch (error) {
      console.error(ToastMessages.ERROR_LOADING_NAMES, error);
    }
  }

  async loadEmployeeNames(): Promise<void> {
    try {
      const response: ApiResponse<any[]> = await this.employeeService.getAllEmployeeNames();
      if (response && response.data) {
        this.employeeOptions = response.data.map((employee) => ({
          label: employee.name,
          value: employee.id,
        }));
      }
    } catch (error) {
      console.error(ToastMessages.ERROR_LOADING_NAMES, error);
    }
  }

  async loadProductsNames(): Promise<void> {
    try {
      const response: ApiResponse<any[]> = await this.productService.getAllProductNames();
      if (response && response.data) {
        this.productOptions = response.data.map((product) => ({
          label: product.name,
          value: product.id,
        }));
      }
    } catch (error) {
      console.error(ToastMessages.ERROR_LOADING_NAMES, error);
    }
  }

  openForm(mode: FormMode.Create | FormMode.Update | FormMode.Detail, supplier?: Supplier): void {
    this.formMode = mode;
    this.selectedSupplier = supplier;
    this.displayDialog = true;
    this.initializeForm();
  };

  initializeForm(): void {
    this.supplierForm.reset();
    if (this.selectedSupplier) {
      this.supplierForm.patchValue(this.selectedSupplier);
    }
    this.updateFormState();
  }

  updateFormState(): void {
    const isDetail = this.formMode === FormMode.Detail;
    const isUpdate = this.formMode === FormMode.Update;

    this.supplierForm.get('name')?.disable();
    this.supplierForm.get('cnpj')?.disable();
    this.supplierForm.get('address')?.disable();
    this.supplierForm.get('number')?.disable();
    this.supplierForm.get('neighborhood')?.disable();
    this.supplierForm.get('city')?.disable();
    this.supplierForm.get('state')?.disable();
    this.supplierForm.get('cep')?.disable();
    this.supplierForm.get('email')?.disable();
    this.supplierForm.get('phone')?.disable();
    this.supplierForm.get('isActive')?.disable();

    if (this.formMode === FormMode.Create) {
      this.supplierForm.get('isActive')?.setValue(true);
      this.supplierForm.get('isActive')?.disable();
      this.supplierForm.get('name')?.enable();
      this.supplierForm.get('cnpj')?.enable();
      this.supplierForm.get('address')?.enable();
      this.supplierForm.get('number')?.enable();
      this.supplierForm.get('neighborhood')?.enable();
      this.supplierForm.get('city')?.enable();
      this.supplierForm.get('state')?.enable();
      this.supplierForm.get('cep')?.enable();
      this.supplierForm.get('email')?.enable();
      this.supplierForm.get('phone')?.enable();
    } else if (isUpdate) {
      this.supplierForm.get('name')?.enable();
      this.supplierForm.get('cnpj')?.enable();
      this.supplierForm.get('address')?.enable();
      this.supplierForm.get('number')?.enable();
      this.supplierForm.get('neighborhood')?.enable();
      this.supplierForm.get('city')?.enable();
      this.supplierForm.get('state')?.enable();
      this.supplierForm.get('cep')?.enable();
      this.supplierForm.get('email')?.enable();
      this.supplierForm.get('phone')?.enable();
    }

    if (!isDetail && !isUpdate) {
      this.supplierForm.get('isActive')?.disable();
    }
    if (isDetail) {
      this.supplierForm.get('isActive')?.disable();
    }
  }

  hideDialog(): void {
    this.displayDialog = false;
    this.selectedSupplier = undefined;
  }

  async saveSupplier(): Promise<void> {
    this.formSubmitted = true;
    if (this.supplierForm.valid) {
      if (this.formMode === FormMode.Create) {
        this.confirmMessage = ConfirmMessages.CREATE_SUPPLIER;
        this.confirmMode = ConfirmMode.Create;
      } else if (this.formMode === FormMode.Update) {
        this.confirmMessage = ConfirmMessages.UPDATE_SUPPLIER;
        this.confirmMode = ConfirmMode.Update;
      }
      this.confirmDialog.message = this.confirmMessage;
      this.confirmDialog.show();

      try {
        await firstValueFrom(this.confirmDialog.confirmed);
        this.spinnerComponent.loading = true;
        const supplier: Supplier = this.supplierForm.getRawValue();
        let response: any = null;
        if (this.confirmMode === ConfirmMode.Create) {
          response = await this.supplierService.createSupplier(supplier);
        } else if (this.confirmMode === ConfirmMode.Update) {
          response = await this.supplierService.updateSupplier(supplier, supplier.id);
        }
        this.spinnerComponent.loading = false;
        if (response && (response.statusCode === HttpStatus.Ok || response.statusCode === HttpStatus.Created)) {
          this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, response.message);
          this.loadSupplierNames();
          this.hideDialog();
          this.receivingForm.get('supplierId')?.setValue(response.data.id);
        } else if (response) {
          this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, response.message);
        }
        this.confirmMode = null;
      } catch (error: any) {
        this.spinnerComponent.loading = false;
        if (error && error.error && error.error.message) {
          this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, error.error.message);
        } else {
          this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, ToastMessages.UNEXPECTED_ERROR);
        }
        this.confirmMode = null;

        try {
          await firstValueFrom(this.confirmDialog.rejected);
          this.confirmMode = null;
        } catch (rejectError) {
          this.confirmMode = null;
        }
      }
    } else {
      this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, ToastMessages.REQUIRED_FIELDS);
    }
  }
}
