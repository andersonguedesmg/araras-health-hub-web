import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { ToastSummaries } from '../../../../shared/constants/toast.constants';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ConfirmMode } from '../../../../shared/enums/confirm-mode.enum';
import { StatusOptions } from '../../../../shared/constants/status-options.constants';
import { ReceivingService } from '../../services/receiving.service';
import { Receiving } from '../../interfaces/receiving';
import { combineLatest, firstValueFrom, Subscription } from 'rxjs';
import { SupplierService } from '../../../supplier/services/supplier.service';
import { SelectOptions } from '../../../../shared/interfaces/select-options';
import { AuthService } from '../../../../core/services/auth.service';
import { Supplier } from '../../../supplier/interfaces/supplier';
import { InputMaskModule } from 'primeng/inputmask';
import { TextareaModule } from 'primeng/textarea';
import { DropdownDataService } from '../../../../shared/services/dropdown-data.service';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { TableModule } from 'primeng/table';
import { cnpjValidator } from '../../../../core/validators/cpf-cnpj.validator';
import { FormHelperService } from '../../../../core/services/form-helper.service';
import { BaseComponent } from '../../../../core/components/base/base.component';

@Component({
  selector: 'app-receiving-create',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    ToastModule,
    ToolbarModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
    InputNumberModule,
    InputMaskModule,
    TextareaModule,
    TooltipModule,
    DatePickerModule,
    DialogModule,
    SelectModule,
    BreadcrumbComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
    DialogComponent,
  ],
  providers: [MessageService],
  templateUrl: './receiving-create.component.html',
  styleUrl: './receiving-create.component.scss'
})
export class ReceivingCreateComponent extends BaseComponent implements OnInit, OnDestroy {
  itemsBreadcrumb: MenuItem[] = [{ label: 'Almoxarifado' }, { label: 'Entradas' }, { label: 'Nova Entrada' }];
  title: string = 'Nova Entrada';

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
    brand: 'Marca',
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

  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private receivingService: ReceivingService,
    private authService: AuthService,
    private dropdownDataService: DropdownDataService,
    private supplierService: SupplierService,
    private formHelperService: FormHelperService,
  ) {
    super();
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
      cnpj: ['', [Validators.required, cnpjValidator()]],
      address: this.fb.group({
        cep: ['', Validators.required],
        street: ['', Validators.required],
        number: ['', Validators.required],
        complement: [''],
        neighborhood: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
      }),
      contact: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
      }),
      isActive: [{ value: false, disabled: true }],
    });
  }

  async ngOnInit(): Promise<void> {
    this.isLoading = true;
    try {
      const [employeeOpts, productOpts, supplierOpts] = await Promise.all([
        this.dropdownDataService.getEmployeeOptions(),
        this.dropdownDataService.getProductOptions(),
        this.dropdownDataService.getSupplierOptions(),
      ]);
      this.employeeOptions = employeeOpts;
      this.productOptions = productOpts;
      this.supplierOptions = supplierOpts;

      this.addReceivedItem();

    } catch (error) {
      this.toastService.showError('Erro ao carregar dados iniciais. Por favor, tente novamente.', ToastSummaries.ERROR);
    } finally {
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get receivedItems(): FormArray {
    return this.receivingForm.get('receivedItems') as FormArray;
  }

  addReceivedItem(): void {
    const itemGroup = this.fb.group({
      productId: [null, Validators.required],
      quantity: [null, [Validators.required, Validators.min(0.01)]],
      unitValue: [null, [Validators.required, Validators.min(0.01)]],
      totalValue: [{ value: null, disabled: true }],
      batch: ['', Validators.required],
      expiryDate: [null, Validators.required],
      brand: [null, Validators.required],
    });

    this.receivedItems.push(itemGroup);

    const quantityCtrl = itemGroup.get('quantity');
    const unitValueCtrl = itemGroup.get('unitValue');

    if (quantityCtrl && unitValueCtrl) {
      const sub = combineLatest([
        quantityCtrl.valueChanges,
        unitValueCtrl.valueChanges
      ]).subscribe(() => {
        this.calculateTotalValue(itemGroup);
      });
      this.subscriptions.add(sub);
    }
  }

  removeReceivedItem(index: number): void {
    this.confirmDialog.message = `Tem certeza que deseja remover o item ${index + 1}?`;
    this.confirmDialog.show();

    firstValueFrom(this.confirmDialog.confirmed)
      .then(() => {
        if (this.receivedItems.length > 1) {
          this.receivedItems.removeAt(index);
          this.toastService.showSuccess(`Item ${index + 1} removido com sucesso.`, ToastSummaries.SUCCESS);
        }
      })
      .catch(() => {
        this.toastService.showInfo('Remoção cancelada.', ToastSummaries.INFO);
      });
  }


  private calculateTotalValue(itemGroup: FormGroup): void {
    const quantity = parseFloat(itemGroup.get('quantity')?.value || 0);
    const unitValue = parseFloat(itemGroup.get('unitValue')?.value || 0);
    const total = (quantity * unitValue).toFixed(2);

    const totalValueCtrl = itemGroup.get('totalValue');
    if (totalValueCtrl) {
      const wasDisabled = totalValueCtrl.disabled;
      if (wasDisabled) {
        totalValueCtrl.enable({ emitEvent: false });
      }
      totalValueCtrl.setValue(parseFloat(total), { emitEvent: false });
      if (wasDisabled) {
        totalValueCtrl.disable({ emitEvent: false });
      }
    }
  }

  async saveReceiving(): Promise<void> {
    this.receivingFormSubmitted = true;
    this.supplierFormSubmitted = false;

    if (this.validateFormAndShowErrors(this.receivingForm, this.formHelperService, this.receivingFormLabels)) {
      if (!this.isTotalValueValid()) {
        this.toastService.showError(ToastMessages.SUM_TOTAL_VALUES_ITEMS_DIFFERENT_TOTAL_VALUE, ToastSummaries.ERROR);
        return;
      }

      const receiving: Receiving = this.receivingForm.getRawValue();
      const confirmMsg = this.formMode === FormMode.Create ? ConfirmMessages.CREATE_RECEIVING : ConfirmMessages.UPDATE_RECEIVING;
      const successMsg = ToastMessages.SUCCESS_OPERATION;

      const apiCall = this.formMode === FormMode.Create
        ? firstValueFrom(this.receivingService.createReceiving(receiving))
        : firstValueFrom(this.receivingService.updateReceiving(receiving, receiving.id));

      await this.handleApiCall(apiCall, confirmMsg, successMsg);

      if (!this.isLoading) {
        this.resetReceivingForm();
      }
    }
  }

  private isTotalValueValid(): boolean {
    const itemsTotal = this.receivedItems.controls.reduce((sum, item) => {
      const rawValue = item.get('totalValue')?.value ?? 0;
      const normalized = String(rawValue).replace(',', '.');
      const val = parseFloat(normalized);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    const rawFormTotal = this.receivingForm.get('totalValue')?.value ?? 0;
    const formTotal = parseFloat(String(rawFormTotal).replace(',', '.'));

    const precision = 0.01;
    return Math.abs(itemsTotal - formTotal) < precision;
  }

  public resetReceivingForm(): void {
    this.receivingForm.reset({
      receivingDate: new Date(),
      accountId: this.authService.getUserId(),
    });
    this.receivedItems.clear();
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
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
      this.supplierForm.get('address.street')?.enable();
      this.supplierForm.get('address.number')?.enable();
      this.supplierForm.get('address.complement')?.enable();
      this.supplierForm.get('address.neighborhood')?.enable();
      this.supplierForm.get('address.city')?.enable();
      this.supplierForm.get('address.state')?.enable();
      this.supplierForm.get('address.cep')?.enable();
      this.supplierForm.get('contact.email')?.enable();
      this.supplierForm.get('contact.phone')?.enable();
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

    if (this.validateFormAndShowErrors(this.supplierForm, this.formHelperService, this.supplierFormLabels)) {
      const confirmMsg = this.formMode === FormMode.Create ? ConfirmMessages.CREATE_SUPPLIER : ConfirmMessages.UPDATE_SUPPLIER;
      const successMsg = ToastMessages.SUCCESS_OPERATION;

      const supplier: Supplier = this.supplierForm.getRawValue();
      const apiCall = this.formMode === FormMode.Create
        ? firstValueFrom(this.supplierService.createSupplier(supplier))
        : firstValueFrom(this.supplierService.updateSupplier(supplier, supplier.id));

      await this.handleApiCall(apiCall, confirmMsg, successMsg);

      this.confirmDialog.message = confirmMsg;
      this.confirmDialog.show();

      try {
        await firstValueFrom(this.confirmDialog.confirmed);
        this.isLoading = true;

        const apiCall$ = this.formMode === FormMode.Create
          ? this.supplierService.createSupplier(supplier)
          : this.supplierService.updateSupplier(supplier, supplier.id);

        const response = await firstValueFrom(apiCall$);

        this.isLoading = false;
        this.handleApiResponse(response, successMsg);

        if (response.success && response.data) {
          this.supplierOptions = await this.dropdownDataService.getSupplierOptions();
          this.receivingForm.get('supplierId')?.setValue(response.data.id);
        }
        this.hideDialog();

      } catch (error: any) {
        this.isLoading = false;
        if (error.message !== 'cancel') {
          this.handleApiError(error);
        }
      }
    }
  }

  async validateCnpj(): Promise<void> {
    const cnpjControl = this.supplierForm.get('cnpj');
    if (cnpjControl?.value && cnpjControl.invalid) {
      cnpjControl.markAsTouched();
      cnpjControl.updateValueAndValidity();
      if (cnpjControl.errors?.['invalidCnpj']) {
        this.toastService.showError(ToastMessages.CNPJ_INVALID);
      }
    }
  }

  async searchCep(): Promise<void> {
    const addressGroup = this.supplierForm.get('address') as FormGroup;
    const cepControl = addressGroup.get('cep');
    if (!cepControl?.value || cepControl.invalid) {
      return;
    }

    this.isLoading = true;
    const success = await this.formHelperService.bindAddressByCep(addressGroup, this.toastService);

    this.updateSupplierFormState();
    this.isLoading = false;

    if (success) {
      document.getElementById('number')?.focus();
    }
  }
}
