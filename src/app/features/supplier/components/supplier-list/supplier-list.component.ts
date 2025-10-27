import { Component, OnDestroy, OnInit } from '@angular/core';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ConfirmMode } from '../../../../shared/enums/confirm-mode.enum';
import { getSeverity, getStatus } from '../../../../shared/utils/status.utils';
import { Supplier } from '../../interfaces/supplier';
import { SupplierService } from '../../services/supplier.service';
import { StatusOptions } from '../../../../shared/constants/status-options.constants';
import { ConfirmMessages, ToastMessages } from '../../../../shared/constants/messages.constants';
import { debounceTime, firstValueFrom, Observable, Subject, Subscription, switchMap } from 'rxjs';
import { HasRoleDirective } from '../../../../core/directives/has-role.directive';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { TableHeaderComponent } from '../../../../shared/components/table-header/table-header.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { InputMask } from 'primeng/inputmask';
import { BaseComponent } from '../../../../core/components/base/base.component';
import { FormHelperService } from '../../../../core/services/form-helper.service';
import { cnpjValidator } from '../../../../core/validators/cpf-cnpj.validator';

@Component({
  selector: 'app-supplier-list',
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
    TooltipModule,
    TagModule,
    DialogModule,
    SelectModule,
    InputMask,
    BreadcrumbComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
    TableComponent,
    DialogComponent,
    TableHeaderComponent,
    HasRoleDirective,
  ],
  providers: [MessageService],
  templateUrl: './supplier-list.component.html',
  styleUrl: './supplier-list.component.scss'
})
export class SupplierListComponent extends BaseComponent implements OnInit, OnDestroy {
  FormMode = FormMode;
  ConfirmMode = ConfirmMode;
  statusOptions = StatusOptions;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Administração' }, { label: 'Fornecedores' }];
  title: string = 'Fornecedores';

  suppliers$!: Observable<Supplier[]>;
  selectedSupplier?: Supplier;
  supplierForm: FormGroup;
  formMode: FormMode.Create | FormMode.Update | FormMode.Detail = FormMode.Create;

  displayDialog = false;
  formSubmitted = false;

  confirmMode: ConfirmMode.Create | ConfirmMode.Update | null = null;
  confirmMessage = '';
  headerText = '';

  private formLabels: { [key: string]: string; } = {
    name: 'Nome do Fornecedor',
    cnpj: 'CNPJ',
    cep: 'CEP',
    address: 'Endereço',
    number: 'Número',
    neighborhood: 'Bairro',
    city: 'Cidade',
    state: 'Estado',
    email: 'E-mail',
    phone: 'Telefone',
  };

  getSeverity = getSeverity;
  getStatus = getStatus;

  private searchTerm: string = '';
  private searchSubject = new Subject<string>();

  private loadLazy = new Subject<any>();
  private subscriptions: Subscription = new Subscription();
  totalRecords = 0;

  constructor(
    private supplierService: SupplierService,
    private fb: FormBuilder,
    private formHelperService: FormHelperService) {
    super();
    this.supplierForm = this.fb.group({
      id: [{ value: null, disabled: true }],
      name: ['', Validators.required],
      cnpj: ['', [Validators.required, cnpjValidator()]],
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

  ngOnInit() {
    this.suppliers$ = this.supplierService.suppliers$;
    this.subscriptions.add(
      this.loadLazy
        .pipe(
          debounceTime(300),
          switchMap(event => {
            this.isLoading = true;
            const pageNumber = event.first / event.rows + 1;
            const pageSize = event.rows;
            return this.supplierService.loadSuppliers(pageNumber, pageSize, this.searchTerm);
          })
        )
        .subscribe({
          next: response => {
            this.isLoading = false;
            if (response.success) {
              this.totalRecords = response.totalCount || 0;
            } else {
              this.handleApiResponse(response, '');
            }
          },
          error: (error) => {
            this.isLoading = false;
            this.handleApiError(error);
          }
        }
        )
    );

    this.subscriptions.add(
      this.searchSubject.pipe(debounceTime(300)).subscribe(searchTerm => {
        this.searchTerm = searchTerm;
        this.loadSuppliers({ first: 0, rows: 5 });
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadSuppliers(event: any) {
    this.loadLazy.next(event);
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  async exportSuppliers(): Promise<void> {
    this.isLoading = true;
    try {
      const response = await firstValueFrom(this.supplierService.exportProducts(this.searchTerm));
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'fornecedor.csv';
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
      this.isLoading = false;
      this.toastService.showSuccess(ToastMessages.SUCCESS_EXPORT);
    } catch (error) {
      this.isLoading = false;
      this.handleApiError(error);
      this.toastService.showError(ToastMessages.UNEXPECTED_ERROR);
    }
  }

  openForm(mode: FormMode.Create | FormMode.Update | FormMode.Detail, supplier?: Supplier): void {
    this.supplierForm.reset();
    this.formSubmitted = false; this.formMode = mode;
    this.selectedSupplier = supplier;
    this.displayDialog = true;
    this.initializeForm();
    if (mode === FormMode.Create) {
      this.headerText = 'Novo Fornecedor';
    } else if (mode === FormMode.Update) {
      this.headerText = 'Editar Fornecedor';
    } else {
      this.headerText = 'Detalhes do Fornecedor';
    }
  }

  initializeForm(): void {
    this.supplierForm.reset();
    if (this.selectedSupplier) {
      this.supplierForm.patchValue(this.selectedSupplier);
    }
    this.updateFormState();
  }

  updateFormState(): void {
    this.supplierForm.disable();

    const isCreate = this.formMode === FormMode.Create;
    const isUpdate = this.formMode === FormMode.Update;

    if (isCreate || isUpdate) {
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
  }

  async saveSupplier(): Promise<void> {
    this.formSubmitted = true;
    if (this.validateForm()) {
      const confirmMsg = this.formMode === FormMode.Create ? ConfirmMessages.CREATE_SUPPLIER : ConfirmMessages.UPDATE_SUPPLIER;
      const supplier = this.supplierForm.getRawValue();
      const apiCall = this.formMode === FormMode.Create
        ? firstValueFrom(this.supplierService.createSupplier(supplier))
        : firstValueFrom(this.supplierService.updateSupplier(supplier, supplier.id));
      await this.handleApiCall(apiCall, confirmMsg, ToastMessages.SUCCESS_OPERATION);
      this.hideDialog();
    }
  }

  async changeStatusSupplier(supplierId: number, supplier: Supplier): Promise<void> {
    const confirmMsg = supplier.isActive ? ConfirmMessages.DISABLE_SUPPLIER : ConfirmMessages.ACTIVATE_SUPPLIER;
    const changeSupplierIsActive = this.changeIsActive(supplier);
    const apiCall = firstValueFrom(this.supplierService.changeStatusSupplier(supplierId, changeSupplierIsActive));
    await this.handleApiCall(apiCall, confirmMsg, ToastMessages.SUCCESS_OPERATION);
  }

  async deleteSupplier(supplierId: number): Promise<void> {
    const apiCall = firstValueFrom(this.supplierService.deleteSupplier(supplierId));
    await this.handleApiCall(apiCall, ConfirmMessages.DELETE_SUPPLIER, ToastMessages.SUCCESS_OPERATION);
  }

  private validateForm(): boolean {
    return this.validateFormAndShowErrors(this.supplierForm, this.formHelperService, this.formLabels);
  }

  async searchCep(): Promise<void> {
    this.isLoading = true;
    const success = await this.formHelperService.bindAddressByCep(this.supplierForm, this.toastService);
    this.updateFormState();
    this.isLoading = false;
    if (success) {
      document.getElementById('number')?.focus();
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
}
