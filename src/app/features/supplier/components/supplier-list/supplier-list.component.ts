import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Table } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ConfirmMode } from '../../../../shared/enums/confirm-mode.enum';
import { Column, ExportColumn } from '../../../../shared/utils/p-table.utils';
import { getSeverity, getStatus } from '../../../../shared/utils/status.utils';
import { Supplier } from '../../interfaces/supplier';
import { SupplierService } from '../../services/supplier.service';
import { StatusOptions } from '../../../../shared/constants/status-options.constants';
import { ApiResponse } from '../../../../shared/interfaces/api-response';
import { ConfirmMessages, ToastMessages } from '../../../../shared/constants/messages.constants';
import { ToastSeverities, ToastSummaries } from '../../../../shared/constants/toast.constants';
import { HttpStatus } from '../../../../shared/enums/http-status.enum';
import { debounceTime, firstValueFrom, Observable, Subject, Subscription, switchMap } from 'rxjs';
import { HasRoleDirective } from '../../../../core/directives/has-role.directive';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { TableHeaderComponent } from '../../../../shared/components/table-header/table-header.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { InputMask } from 'primeng/inputmask';

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
    ToastComponent,
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
export class SupplierListComponent implements OnInit, OnDestroy {
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  isLoading = false;

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

  cols!: Column[];
  selectedColumns!: Column[];
  exportColumns!: ExportColumn[];

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

  constructor(private cd: ChangeDetectorRef, private supplierService: SupplierService, private fb: FormBuilder) {
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

  ngOnInit() {
    this.loadTableData();
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

  loadTableData() {
    this.cd.markForCheck();
    this.cols = [
      { field: 'id', header: 'ID', customExportHeader: 'CÓDIGO DO FORNECEDOR' },
      { field: 'name', header: 'NOME' },
      { field: 'cnpj', header: 'CNPJ' },
      { field: 'address', header: 'ENDEREÇO' },
      { field: 'number', header: 'NÚMERO' },
      { field: 'neighborhood', header: 'BAIRRO' },
      { field: 'city', header: 'CIDADE' },
      { field: 'state', header: 'ESTADO' },
      { field: 'cep', header: 'CEP' },
      { field: 'email', header: 'E-MAIL' },
      { field: 'phone', header: 'TELEFONE' },
      { field: 'isActive', header: 'STATUS' },
    ];
    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    this.selectedColumns = this.cols;
  }

  loadSuppliers(event: any) {
    this.loadLazy.next(event);
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
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
      this.confirmMessage = this.formMode === FormMode.Create ? ConfirmMessages.CREATE_SUPPLIER : ConfirmMessages.UPDATE_SUPPLIER;
      this.confirmDialog.message = this.confirmMessage;
      this.confirmDialog.show();

      try {
        await firstValueFrom(this.confirmDialog.confirmed);
        this.isLoading = true;
        const supplier: Supplier = this.supplierForm.getRawValue();

        const apiCall$ = this.formMode === FormMode.Create
          ? this.supplierService.createSupplier(supplier)
          : this.supplierService.updateSupplier(supplier, supplier.id);

        const response = await firstValueFrom(apiCall$);

        this.isLoading = false;
        this.handleApiResponse(response, ToastMessages.SUCCESS_OPERATION);
        this.hideDialog();

      } catch (error: any) {
        this.isLoading = false;
        if (error.message !== 'cancel') {
          this.handleApiError(error);
        }
      }
    }
  }

  async changeStatusSupplier(supplierId: number, supplier: Supplier): Promise<void> {
    this.confirmMessage = supplier.isActive ? ConfirmMessages.DISABLE_SUPPLIER : ConfirmMessages.ACTIVATE_SUPPLIER;
    this.confirmDialog.message = this.confirmMessage;
    this.confirmDialog.show();

    try {
      await firstValueFrom(this.confirmDialog.confirmed);
      this.isLoading = true;

      const changeSupplierIsActive = this.changeIsActive(supplier);
      const response = await firstValueFrom(this.supplierService.changeStatusSupplier(supplierId, changeSupplierIsActive));

      this.isLoading = false;
      this.handleApiResponse(response, ToastMessages.SUCCESS_OPERATION);

    } catch (error: any) {
      this.isLoading = false;
      if (error.message !== 'cancel') {
        this.handleApiError(error);
      }
    }
  }

  async deleteSupplier(supplierId: number): Promise<void> {
    this.confirmDialog.message = ConfirmMessages.DELETE_SUPPLIER;
    this.confirmDialog.show();

    try {
      await firstValueFrom(this.confirmDialog.confirmed);
      this.isLoading = true;

      const response = await firstValueFrom(this.supplierService.deleteSupplier(supplierId));

      this.isLoading = false;
      this.handleApiResponse(response, ToastMessages.SUCCESS_OPERATION);

    } catch (error: any) {
      this.isLoading = false;
      if (error.message !== 'cancel') {
        this.handleApiError(error);
      }
    }
  }

  private validateForm(): boolean {
    if (this.supplierForm.valid) {
      return true;
    }

    const invalidControls = this.findInvalidControlsRecursive(this.supplierForm);
    const invalidFields = invalidControls.map(control => {
      const controlName = this.getFormControlName(control);
      return controlName;
    });

    const invalidFieldsMessage = invalidFields.length > 0
      ? `Por favor, preencha os seguintes campos: ${invalidFields.join(', ')}.`
      : ToastMessages.REQUIRED_FIELDS;

    this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, invalidFieldsMessage);
    return false;
  }

  private findInvalidControlsRecursive(form: FormGroup | AbstractControl): AbstractControl[] {
    const invalidControls: AbstractControl[] = [];
    if (form instanceof FormGroup) {
      for (const name in form.controls) {
        const control = form.controls[name];
        if (control.invalid) {
          invalidControls.push(control);
        } else if (control instanceof FormGroup) {
          invalidControls.push(...this.findInvalidControlsRecursive(control));
        }
      }
    }
    return invalidControls;
  }

  private getFormControlName(control: AbstractControl): string {
    const parent = control.parent;
    if (parent instanceof FormGroup) {
      const formGroup = parent as FormGroup;
      for (const name in formGroup.controls) {
        if (control === formGroup.controls[name]) {
          return this.formLabels[name] || name.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
        }
      }
    }
    return '';
  }

  private handleApiResponse(response: ApiResponse<any>, successMessage: string) {
    if (response.success) {
      this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, response.message || successMessage);
    } else {
      this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, response.message || ToastMessages.UNEXPECTED_ERROR);
    }
  }

  private handleApiError(error: any) {
    if (error.error && error.error.statusCode === HttpStatus.NotFound) {
      this.toastComponent.showMessage(ToastSeverities.INFO, ToastSummaries.INFO, error.error.message);
    } else if (error.error && error.error.message) {
      this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, error.error.message);
    } else {
      this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, ToastMessages.UNEXPECTED_ERROR);
    }
  }

  changeIsActive(objeto: any) {
    if (objeto && typeof objeto === 'object' && 'isActive' in objeto) {
      objeto.isActive = !objeto.isActive;
    }
    return objeto;
  }

  exportCSV(dt: Table) {
    dt.exportCSV();
  }
}
