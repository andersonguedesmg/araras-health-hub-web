import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { Tag } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Table } from 'primeng/table';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ApiResponse } from '../../../../shared/interfaces/apiResponse';
import { Supplier } from '../../interfaces/supplier';
import { SupplierService } from '../../services/supplier.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { InputMask } from 'primeng/inputmask';
import { getSeverity, getStatus } from '../../../../shared/utils/status.utils';
import { Column, ExportColumn } from '../../../../shared/utils/p-table.utils';
import { ConfirmMessages, ToastMessages } from '../../../../shared/constants/messages.constants';
import { ToastSeverities, ToastSummaries } from '../../../../shared/constants/toast.constants';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ConfirmMode } from '../../../../shared/enums/confirm-mode.enum';
import { HttpStatus } from '../../../../shared/enums/http-status.enum';
import { StatusOptions } from '../../../../shared/constants/status-options.constants';
import { firstValueFrom } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-supplier-list',
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
    InputMask,
    TooltipModule,
    Tag,
    DialogModule,
    SelectModule,
    ToastComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
  ],
  providers: [MessageService],
  templateUrl: './supplier-list.component.html',
  styleUrl: './supplier-list.component.scss'
})
export class SupplierListComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(SpinnerComponent) spinnerComponent!: SpinnerComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  FormMode = FormMode;
  ConfirmMode = ConfirmMode;
  statusOptions = StatusOptions;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Administração' }, { label: 'Fornecedores' }];

  suppliers: Supplier[] = [];
  selectedSupplier?: Supplier;
  supplierForm: FormGroup;
  formMode: FormMode.Create | FormMode.Update | FormMode.Detail = FormMode.Create;
  displayDialog = false;
  formSubmitted = false;

  confirmMode: ConfirmMode.Create | ConfirmMode.Update | null = null;
  confirmMessage = '';

  cols!: Column[];
  selectedColumns!: Column[];
  exportColumns!: ExportColumn[];

  getSeverity = getSeverity;
  getStatus = getStatus;

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
  }

  ngAfterViewInit(): void {
    this.getAllSuppliers();
  }

  exportCSV() {
    this.dt.exportCSV();
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

  async getAllSuppliers(): Promise<void> {
    this.suppliers = [];
    this.spinnerComponent.loading = true;

    try {
      const response: ApiResponse<Supplier[]> = await this.supplierService.getAllSuppliers();
      this.spinnerComponent.loading = false;
      if (response.statusCode === HttpStatus.Ok) {
        this.suppliers = response.data;
      } else {
        this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, response.message);
      }
    } catch (error: any) {
      this.spinnerComponent.loading = false;
      if (error.error && error.error.statusCode === HttpStatus.NotFound) {
        this.toastComponent.showMessage(ToastSeverities.INFO, ToastSummaries.INFO, error.error.message);
      } else if (error.error && error.error.message) {
        this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, error.error.message);
      } else {
        this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, ToastMessages.UNEXPECTED_ERROR);
      }
    }
  }

  openForm(mode: FormMode.Create | FormMode.Update | FormMode.Detail, supplier?: Supplier): void {
    this.formMode = mode;
    this.selectedSupplier = supplier;
    this.displayDialog = true;
    this.initializeForm();
  }

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
          this.getAllSuppliers();
          this.hideDialog();
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

  async changeStatusSupplier(supplierId: number, supplier: Supplier): Promise<void> {
    if (supplier.isActive) {
      this.confirmDialog.message = ConfirmMessages.DISABLE_SUPPLIER;
    } else {
      this.confirmDialog.message = ConfirmMessages.ACTIVATE_SUPPLIER;
    }
    this.confirmDialog.show();

    try {
      await firstValueFrom(this.confirmDialog.confirmed);
      this.spinnerComponent.loading = true;
      let changeSupplierIsActive = this.changeIsActive(supplier);

      const response: ApiResponse<Supplier> = await this.supplierService.changeStatusSupplier(supplierId, changeSupplierIsActive);
      this.spinnerComponent.loading = false;

      if (response && response.statusCode === HttpStatus.Ok) {
        this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, response.message);
        this.getAllSuppliers();
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
    }
    this.confirmMode = null;

    try {
      await firstValueFrom(this.confirmDialog.rejected);
      if (supplier.isActive) {
        this.toastComponent.showMessage(ToastSeverities.INFO, ToastSummaries.CANCELED, ToastMessages.DEACTIVATION_DELETION);
        this.confirmMode = null;
      } else {
        this.toastComponent.showMessage(ToastSeverities.INFO, ToastSummaries.CANCELED, ToastMessages.ACTIVATION_DELETION);
        this.confirmMode = null;
      }
    } catch (rejectError) {
      this.confirmMode = null;
    }
  }

  changeIsActive(objeto: any) {
    if (objeto && typeof objeto === 'object' && 'isActive' in objeto) {
      objeto.isActive = !objeto.isActive;
    }
    return objeto;
  }

  async deleteSupplier(supplierId: number): Promise<void> {
    this.confirmDialog.message = ConfirmMessages.DELETE_SUPPLIER;
    this.confirmDialog.show();

    try {
      await firstValueFrom(this.confirmDialog.confirmed);
      this.spinnerComponent.loading = true;

      const response: ApiResponse<Supplier> = await this.supplierService.deleteSupplier(supplierId);
      this.spinnerComponent.loading = false;

      if (response && response.statusCode === HttpStatus.Ok) {
        this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, response.message);
        this.getAllSuppliers();
      } else if (response) {
        this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, response.message);
      }
      this.confirmMode = null;
    } catch (error: any) {
      this.spinnerComponent.loading = false;
      if (error && error.error && error.error.message) {
        this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, error.error.message);
        this.confirmMode = null;
      } else {
        this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, ToastMessages.UNEXPECTED_ERROR);
        this.confirmMode = null;
      }
    }
    this.confirmMode = null;
    try {
      await firstValueFrom(this.confirmDialog.rejected);
      this.toastComponent.showMessage(ToastSeverities.INFO, ToastSummaries.CANCELED, ToastMessages.CANCELED_DELETION);
    } catch (rejectError) {
      this.confirmMode = null;
    }
  }
}
