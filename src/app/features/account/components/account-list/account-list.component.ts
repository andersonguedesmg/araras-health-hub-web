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
import { AccountService } from '../../services/account.service';
import { Account } from '../../interfaces/account';
import { ApiResponse } from '../../../../shared/interfaces/apiResponse';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { getSeverity, getStatus } from '../../../../shared/utils/status.utils';
import { Column, ExportColumn } from '../../../../shared/utils/p-table.utils';

@Component({
  selector: 'app-account-list',
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
    Tag,
    DialogModule,
    DropdownModule,
    ToastComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
  ],
  providers: [MessageService],
  templateUrl: './account-list.component.html',
  styleUrl: './account-list.component.scss'
})
export class AccountListComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(SpinnerComponent) spinnerComponent!: SpinnerComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Administração' }, { label: 'Clientes' }];

  accounts: Account[] = [];
  selectedAccount?: Account;
  accountForm: FormGroup;
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

  constructor(private cd: ChangeDetectorRef, private accountService: AccountService, private fb: FormBuilder) {
    this.accountForm = this.fb.group({
      id: [{ value: null, disabled: true }],
      userName: ['', Validators.required],
      destinationId: ['', Validators.required],
      isActive: [{ value: false, disabled: true }],
    });
  }

  ngOnInit() {
    this.loadDemoData();
  }

  ngAfterViewInit(): void {
    this.getAllAccounts();
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  loadDemoData() {
    this.cd.markForCheck();

    this.cols = [
      { field: 'id', header: 'ID', customExportHeader: 'CÓDIGO DO CLIENTE' },
      { field: 'userName', header: 'NOME' },
      { field: 'destinationId', header: 'DESTINO' },
      { field: 'isActive', header: 'STATUS' },
    ];

    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));

    this.selectedColumns = this.cols;
  }

  getAllAccounts(): void {
    this.spinnerComponent.loading = true;
    this.accountService.getAllAccounts().subscribe({
      next: (response: ApiResponse<Account[]>) => {
        this.spinnerComponent.loading = false;
        if (response.statusCode === 200) {
          this.accounts = response.data;
        } else {
          this.toastComponent.showMessage('error', 'Erro', response.message);
        }
      }, error: (error) => {
        this.spinnerComponent.loading = false;
        this.toastComponent.showMessage('error', 'Erro', error);
      },
    });
  }

  openForm(mode: 'create' | 'update' | 'detail', user?: Account): void {
    this.formMode = mode;
    this.selectedAccount = user;
    this.displayDialog = true;
    this.initializeForm();
  }

  initializeForm(): void {
    this.accountForm.reset();
    if (this.selectedAccount) {
      this.accountForm.patchValue(this.selectedAccount);
    }
    this.updateFormState();
  }

  updateFormState(): void {
    const isDetail = this.formMode === 'detail';
    const isUpdate = this.formMode === 'update';

    this.accountForm.get('userName')?.disable();
    this.accountForm.get('destinationId')?.disable();
    this.accountForm.get('isActive')?.disable();

    if (this.formMode === 'create') {
      this.accountForm.get('isActive')?.setValue(true);
      this.accountForm.get('isActive')?.disable();
      this.accountForm.get('userName')?.enable();
    } else if (isUpdate) {
      this.accountForm.get('userName')?.enable();
    }

    if (!isDetail && !isUpdate) {
      this.accountForm.get('isActive')?.disable();
    }
    if (isDetail) {
      this.accountForm.get('isActive')?.disable();
    }
  }

  hideDialog(): void {
    this.displayDialog = false;
    this.selectedAccount = undefined;
  }

  saveAccount(): void {
    this.formSubmitted = true;
    if (this.accountForm.valid) {
      if (this.formMode === 'create') {
        this.confirmMessage = 'Tem certeza que deseja cadastrar este cliente?';
        this.confirmMode = 'create';
      } else if (this.formMode === 'update') {
        this.confirmMessage = 'Tem certeza que deseja atualizar este cliente?';
        this.confirmMode = 'update';
      }
      this.confirmDialog.message = this.confirmMessage;
      this.confirmDialog.confirmed.subscribe(() => {
        this.spinnerComponent.loading = true;
        const account: Account = this.accountForm.getRawValue();
        if (this.confirmMode === 'create') {
          this.accountService.createAccount(account).subscribe(this.handleResponse());
        } else if (this.confirmMode === 'update') {
          this.accountService.updateAccount(account, account.id).subscribe(this.handleResponse());
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

  changeStatusAccount(accountId: string, account: Account): void {
    this.confirmDialog.message = 'Tem certeza que deseja excluir este cliente?';
    this.confirmDialog.confirmed.subscribe(() => {
      this.spinnerComponent.loading = true;
      let changeAccountIsActive = this.changeIsActive(account);
      this.accountService.changeStatusAccount(accountId, changeAccountIsActive).subscribe({
        next: (response: ApiResponse<Account[]>) => {
          this.spinnerComponent.loading = false;
          if (response.statusCode === 200) {
            this.toastComponent.showMessage('success', 'Sucesso', response.message);
            this.getAllAccounts();
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

  deleteUser(accountId: string): void {
    this.confirmDialog.message = 'Tem certeza que deseja excluir este cliente?';
    this.confirmDialog.confirmed.subscribe(() => {
      this.spinnerComponent.loading = true;
      this.accountService.deleteAccount(accountId).subscribe({
        next: () => {
          this.toastComponent.showMessage('success', 'Sucesso', 'Cliente excluído com sucesso.');
          this.getAllAccounts();
        },
        error: (error) => {
          this.toastComponent.showMessage('error', 'Erro', 'Erro ao excluir cliente.');
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
        this.toastComponent.showMessage('success', 'Sucesso', `Cliente ${this.formMode === 'create' ? 'cadastrado' : 'atualizado'} com sucesso.`);
        this.getAllAccounts();
        this.hideDialog();
      }, error: (error: any) => {
        this.spinnerComponent.loading = false;
        this.toastComponent.showMessage('error', 'Erro', `Erro ao ${this.formMode === 'create' ? 'cadastrar' : 'atualizar'} cliente.`);
        console.error(`Erro ao ${this.formMode === 'create' ? 'cadastrar' : 'atualizar'} cliente:`, error);
      },
    };
  }
}
