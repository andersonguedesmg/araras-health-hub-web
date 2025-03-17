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
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { InputMask } from 'primeng/inputmask';
import { getSeverity, getStatus } from '../../../../shared/utils/status.utils';
import { Column, ExportColumn } from '../../../../shared/utils/p-table.utils';

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
    Tag,
    DialogModule,
    DropdownModule,
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

  itemsBreadcrumb: MenuItem[] = [{ label: 'Administração' }, { label: 'Fornecedores' }];

  suppliers: Supplier[] = [];
  selectedSupplier?: Supplier;
  supplierForm: FormGroup;
  formMode: 'create' | 'update' | 'detail' = 'create';
  displayDialog = false;
  formSubmitted = false;

  confirmMode: 'create' | 'update' | null = null;
  confirmMessage = '';

  statusOptions: any[] = [
    { label: 'Ativo', value: true },
    { label: 'Inativo', value: false },
  ];

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

  getAllSuppliers(): void {
    this.spinnerComponent.loading = true;
    this.supplierService.getAllSuppliers().subscribe({
      next: (response: ApiResponse<Supplier[]>) => {
        this.spinnerComponent.loading = false;
        if (response.statusCode === 200) {
          this.suppliers = response.data;
        } else {
          this.toastComponent.showMessage('error', 'Erro', response.message);
        }
      }, error: (error) => {
        this.spinnerComponent.loading = false;
        this.toastComponent.showMessage('error', 'Erro', error);
      },
    });
  }

  openForm(mode: 'create' | 'update' | 'detail', supplier?: Supplier): void {
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
    const isDetail = this.formMode === 'detail';
    const isUpdate = this.formMode === 'update';

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

    if (this.formMode === 'create') {
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

  saveSupplier(): void {
    this.formSubmitted = true;
    if (this.supplierForm.valid) {
      if (this.formMode === 'create') {
        this.confirmMessage = 'Tem certeza que deseja cadastrar este fornecedor?';
        this.confirmMode = 'create';
      } else if (this.formMode === 'update') {
        this.confirmMessage = 'Tem certeza que deseja atualizar este fornecedor?';
        this.confirmMode = 'update';
      }
      this.confirmDialog.message = this.confirmMessage;
      this.confirmDialog.confirmed.subscribe(() => {
        this.spinnerComponent.loading = true;
        const supplier: Supplier = this.supplierForm.getRawValue();
        if (this.confirmMode === 'create') {
          this.supplierService.createSupplier(supplier).subscribe(this.handleResponse());
        } else if (this.confirmMode === 'update') {
          this.supplierService.updateSupplier(supplier, supplier.id).subscribe(this.handleResponse());
        }
      });
      this.confirmDialog.rejected.subscribe(() => {
        this.confirmMode = null;
      });
      this.confirmDialog.show();
    } else {
      this.toastComponent.showMessage('error', 'Erro', 'Preencha todos os campos obrigatórios.');
    }
  }

  changeStatusSupplier(supplierId: number, supplier: Supplier): void {
    this.confirmDialog.message = 'Tem certeza que deseja excluir este fornecedor?';
    this.confirmDialog.confirmed.subscribe(() => {
      this.spinnerComponent.loading = true;
      let changeSupplierIsActive = this.changeIsActive(supplier);
      this.supplierService.changeStatusSupplier(supplierId, changeSupplierIsActive).subscribe({
        next: (response: ApiResponse<Supplier[]>) => {
          this.spinnerComponent.loading = false;
          if (response.statusCode === 200) {
            this.toastComponent.showMessage('success', 'Sucesso', response.message);
            this.getAllSuppliers();
          } else {
            this.toastComponent.showMessage('error', 'Erro', response.message);
          }
        }, error: (error) => {
          this.spinnerComponent.loading = false;
          this.toastComponent.showMessage('error', 'Erro', error);
        },
      });
    });
    this.confirmDialog.rejected.subscribe(() => {
      this.toastComponent.showMessage('info', 'Cancelado', 'Exclusão cancelada.');
    });
    this.confirmDialog.show();
  }

  changeIsActive(objeto: any) {
    if (objeto && typeof objeto === 'object' && 'isActive' in objeto) {
      objeto.isActive = !objeto.isActive;
    }
    return objeto;
  }

  deleteSupplier(supplierId: number): void {
    this.confirmDialog.message = 'Tem certeza que deseja excluir este fornecedor?';
    this.confirmDialog.confirmed.subscribe(() => {
      this.spinnerComponent.loading = true;
      this.supplierService.deleteSupplier(supplierId).subscribe({
        next: () => {
          this.toastComponent.showMessage('success', 'Sucesso', 'Fornecedor excluído com sucesso.');
          this.getAllSuppliers();
        },
        error: (error) => {
          this.toastComponent.showMessage('error', 'Erro', 'Erro ao excluir fornecedor.');
          this.spinnerComponent.loading = false;
        },
      });
    });
    this.confirmDialog.rejected.subscribe(() => {
      this.toastComponent.showMessage('info', 'Cancelado', 'Exclusão cancelada.');
    });
    this.confirmDialog.show();
  }

  handleResponse(): any {
    return {
      next: () => {
        this.spinnerComponent.loading = false;
        this.toastComponent.showMessage('success', 'Sucesso', `Fornecedor ${this.formMode === 'create' ? 'cadastrado' : 'atualizado'} com sucesso.`);
        this.getAllSuppliers();
        this.hideDialog();
      }, error: (error: any) => {
        this.spinnerComponent.loading = false;
        this.toastComponent.showMessage('error', 'Erro', `Erro ao ${this.formMode === 'create' ? 'cadastrar' : 'atualizar'} fornecedor.`);
        console.error(`Erro ao ${this.formMode === 'create' ? 'cadastrar' : 'atualizar'} fornecedor:`, error);
      },
    };
  }
}
