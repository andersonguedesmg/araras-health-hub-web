import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
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
import { ToastComponent } from '../../../../shared/components/toast/toast.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
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
import { SelectOptions } from '../../../../shared/interfaces/select-options';
import { AuthService } from '../../../../core/services/auth.service';
import { Supplier } from '../../../supplier/interfaces/supplier';
import { InputMask } from 'primeng/inputmask';
import { TextareaModule } from 'primeng/textarea';
import { DropdownDataService } from '../../../../shared/services/dropdown-data.service';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';

@Component({
  selector: 'app-receiving-create',
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
    InputMask,
    TextareaModule,
    TooltipModule,
    DatePickerModule,
    DialogModule,
    SelectModule,
    BreadcrumbComponent,
    ToastComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
    DialogComponent,
  ],
  providers: [MessageService],
  templateUrl: './receiving-create.component.html',
  styleUrl: './receiving-create.component.scss'
})
export class ReceivingCreateComponent implements OnInit {
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

  receivingFormSubmitted = false;
  supplierFormSubmitted = false;

  supplierForm: FormGroup;
  selectedSupplier?: Supplier;

  confirmMode: ConfirmMode.Create | ConfirmMode.Update | null = null;
  confirmMessage = '';

  private receivingFormLabels: { [key: string]: string; } = {
    invoiceNumber: 'Nota Fiscal',
    supplyAuthorization: 'Autorização de Fornecimento',
    totalValue: 'Valor da Nota',
    supplierId: 'Fornecedor',
    responsibleId: 'Responsável',
    receivingDate: 'Data',
    receivedItems: 'Itens do Recebimento',
    productId: 'Produto',
    quantity: 'Quantidade',
    unitValue: 'Valor Unitário',
    itemTotalValue: 'Valor Total do Item',
    batch: 'Lote',
    expiryDate: 'Data de Validade'
  };

  private supplierFormLabels: { [key: string]: string; } = {
    name: 'Nome',
    cnpj: 'CNPJ',
    address: 'Endereço',
    number: 'Número',
    neighborhood: 'Bairro',
    city: 'Cidade',
    state: 'Estado',
    cep: 'CEP',
    email: 'E-mail',
    phone: 'Telefone',
  };

  constructor(
    private fb: FormBuilder,
    private receivingService: ReceivingService,
    private authService: AuthService,
    private dropdownDataService: DropdownDataService,
    private supplierService: SupplierService,
    private cdr: ChangeDetectorRef
  ) {
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
      receivedItems: this.fb.array([], Validators.minLength(1)),
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
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      isActive: [{ value: false, disabled: true }],
    });
  }

  async ngOnInit(): Promise<void> {
    this.addReceivedItem();
    this.employeeOptions = await this.dropdownDataService.getEmployeeOptions();
    this.productOptions = await this.dropdownDataService.getProductOptions();
    this.supplierOptions = await this.dropdownDataService.getSupplierOptions();
  }

  get receivedItems(): FormArray {
    return this.receivingForm.get('receivedItems') as FormArray;
  }

  addReceivedItem(): void {
    const itemGroup = this.fb.group({
      productId: [null, Validators.required],
      quantity: ['', [Validators.required, Validators.min(0.01)]],
      unitValue: ['', [Validators.required, Validators.min(0.01)]],
      totalValue: [{ value: '', disabled: true }],
      batch: ['', Validators.required],
      expiryDate: [null, Validators.required],
    });

    this.receivedItems.push(itemGroup);
    this.setupValueChangeListener(itemGroup);
  }

  private setupValueChangeListener(itemGroup: FormGroup): void {
    const quantityCtrl = itemGroup.get('quantity');
    const unitValueCtrl = itemGroup.get('unitValue');
    const totalValueCtrl = itemGroup.get('totalValue');

    if (!quantityCtrl || !unitValueCtrl || !totalValueCtrl) return;

    itemGroup.valueChanges.subscribe(() => {
      const quantity = parseFloat(quantityCtrl.value);
      const unitValue = parseFloat(unitValueCtrl.value);

      if (!isNaN(quantity) && !isNaN(unitValue)) {
        const total = quantity * unitValue;
        totalValueCtrl.setValue(total.toFixed(2), { emitEvent: false });
      } else {
        totalValueCtrl.setValue('', { emitEvent: false });
      }
    });
  }

  removeReceivedItem(index: number): void {
    this.receivedItems.removeAt(index);
  }

  async saveReceiving(): Promise<void> {
    this.receivingFormSubmitted = true;
    this.supplierFormSubmitted = false;

    if (this.validateForm(this.receivingForm, this.receivingFormLabels)) {
      if (!this.isTotalValueValid()) {
        this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, ToastMessages.SUM_TOTAL_VALUES_ITEMS_DIFFERENT_TOTAL_VALUE);
        return;
      }

      this.confirmMessage = this.formMode === FormMode.Create ? ConfirmMessages.CREATE_RECEIVING : ConfirmMessages.UPDATE_RECEIVING;
      this.confirmDialog.message = this.confirmMessage;
      this.confirmDialog.show();

      try {
        await firstValueFrom(this.confirmDialog.confirmed);
        this.spinnerComponent.loading = true;
        const receiving: Receiving = this.receivingForm.getRawValue();

        const apiCall$ = this.formMode === FormMode.Create
          ? this.receivingService.createReceiving(receiving)
          : this.receivingService.updateReceiving(receiving, receiving.id);

        const response = await firstValueFrom(apiCall$);

        this.spinnerComponent.loading = false;
        this.handleApiResponse(response, ToastMessages.SUCCESS_OPERATION);
        this.resetReceivingForm();

      } catch (error: any) {
        this.spinnerComponent.loading = false;
        if (error.message !== 'cancel') {
          this.handleApiError(error);
        }
      }
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
    this.receivedItems.clear();
    this.addReceivedItem();
    this.receivingFormSubmitted = false;
  }

  openForm(mode: FormMode.Create | FormMode.Update | FormMode.Detail, supplier?: Supplier): void {
    this.formMode = mode;
    this.selectedSupplier = supplier;
    this.displayDialog = true;
    this.initializeSupplierForm();
  };

  initializeSupplierForm(): void {
    this.supplierForm.reset();
    if (this.selectedSupplier) {
      this.supplierForm.patchValue(this.selectedSupplier);
    }
    this.updateSupplierFormState();
  }

  updateSupplierFormState(): void {
    this.supplierForm.disable();

    const isDetail = this.formMode === FormMode.Detail;
    const isCreate = this.formMode === FormMode.Create;

    if (!isDetail) {
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

    if (isCreate) {
      this.supplierForm.get('isActive')?.setValue(true);
      this.supplierForm.get('isActive')?.disable();
    }
  }

  hideDialog(): void {
    this.displayDialog = false;
    this.selectedSupplier = undefined;
    this.supplierFormSubmitted = false;
  }

  async saveSupplier(): Promise<void> {
    this.supplierFormSubmitted = true;
    this.receivingFormSubmitted = false;

    if (this.validateForm(this.supplierForm, this.supplierFormLabels)) {
      this.confirmMessage = this.formMode === FormMode.Create ? ConfirmMessages.CREATE_SUPPLIER : ConfirmMessages.UPDATE_SUPPLIER;
      this.confirmDialog.message = this.confirmMessage;
      this.confirmDialog.show();

      try {
        await firstValueFrom(this.confirmDialog.confirmed);
        this.spinnerComponent.loading = true;
        const supplier: Supplier = this.supplierForm.getRawValue();

        const apiCall$ = this.formMode === FormMode.Create
          ? this.supplierService.createSupplier(supplier)
          : this.supplierService.updateSupplier(supplier, supplier.id);

        const response = await firstValueFrom(apiCall$);

        this.spinnerComponent.loading = false;
        this.handleApiResponse(response, ToastMessages.SUCCESS_OPERATION);
        if (response.success && response.data) {
          this.supplierOptions = await this.dropdownDataService.getSupplierOptions();
          this.receivingForm.get('supplierId')?.setValue(response.data.id);
        }
        this.hideDialog();

      } catch (error: any) {
        this.spinnerComponent.loading = false;
        if (error.message !== 'cancel') {
          this.handleApiError(error);
        }
      }
    }
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
          const label = (subControlName === 'totalValue' ? labels['itemTotalValue'] : labels[subControlName])
            || labels[subControlName]
            || subControlName.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
          return `Item ${itemIndex + 1} - ${label}`;
        }
      }
    }
    return '';
  }

  private handleApiResponse(response: any, successMessage: string) {
    if (response.success) {
      this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, response.message || successMessage);
    } else {
      this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, response.message || ToastMessages.UNEXPECTED_ERROR);
    }
  }

  private handleApiError(error: any) {
    if (error.error?.statusCode === HttpStatus.NotFound || error.error?.statusCode === HttpStatus.BadRequest) {
      this.toastComponent.showMessage(ToastSeverities.INFO, ToastSummaries.INFO, error.error.message);
    } else if (error.error?.message) {
      this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, error.error.message);
    } else {
      this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, ToastMessages.UNEXPECTED_ERROR);
    }
  }
}
