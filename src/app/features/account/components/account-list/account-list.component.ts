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
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { getSeverity, getStatus } from '../../../../shared/utils/status.utils';
import { Column, ExportColumn } from '../../../../shared/utils/p-table.utils';
import { ConfirmMessages, ToastMessages } from '../../../../shared/constants/messages.constants';
import { ToastSeverities, ToastSummaries } from '../../../../shared/constants/toast.constants';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ConfirmMode } from '../../../../shared/enums/confirm-mode.enum';
import { HttpStatus } from '../../../../shared/enums/http-status.enum';
import { StatusOptions } from '../../../../shared/constants/status-options.constants';

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
    SelectModule,
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

  FormMode = FormMode;
  ConfirmMode = ConfirmMode;
  statusOptions = StatusOptions;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Administração' }, { label: 'Clientes' }];

  accounts: Account[] = [];
  selectedAccount?: Account;
  accountForm: FormGroup;
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

  constructor(private cd: ChangeDetectorRef, private accountService: AccountService, private fb: FormBuilder) {
    this.accountForm = this.fb.group({
      id: [{ value: null, disabled: true }],
      userName: ['', Validators.required],
      destinationId: ['', Validators.required],
      isActive: [{ value: false, disabled: true }],
    });
  }

  ngOnInit() {
    this.loadTableData();
  }

  ngAfterViewInit(): void {
    this.getAllAccounts();
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  loadTableData() {
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
        if (response.statusCode === HttpStatus.Ok) {
          this.accounts = response.data;
        } else {
          this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, response.message);
        }
      }, error: (error) => {
        this.spinnerComponent.loading = false;
        this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, error);
      },
    });
  }

  openForm(mode: FormMode.Create | FormMode.Update | FormMode.Detail, user?: Account): void {
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
    const isDetail = this.formMode === FormMode.Detail;
    const isUpdate = this.formMode === FormMode.Update;

    this.accountForm.get('userName')?.disable();
    this.accountForm.get('destinationId')?.disable();
    this.accountForm.get('isActive')?.disable();

    if (this.formMode === FormMode.Create) {
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
      if (this.formMode === FormMode.Create) {
        this.confirmMessage = ConfirmMessages.CREATE_ACCOUNT;
        this.confirmMode = ConfirmMode.Create;
      } else if (this.formMode === FormMode.Update) {
        this.confirmMessage = ConfirmMessages.UPDATE_ACCOUNT;
        this.confirmMode = ConfirmMode.Update;
      }
      this.confirmDialog.message = this.confirmMessage;
      this.confirmDialog.confirmed.subscribe(() => {
        this.spinnerComponent.loading = true;
        const account: Account = this.accountForm.getRawValue();
        if (this.confirmMode === ConfirmMode.Create) {
          this.accountService.createAccount(account).subscribe(this.handleResponse());
        } else if (this.confirmMode === ConfirmMode.Update) {
          this.accountService.updateAccount(account, account.id).subscribe(this.handleResponse());
        }
      });
      this.confirmDialog.rejected.subscribe(() => {
        this.confirmMode = null;
      });
      this.confirmDialog.show();
    } else {
      this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, ToastMessages.REQUIRED_FIELDS);
    }
  }

  changeStatusAccount(accountId: string, account: Account): void {
    if (account.isActive) {
      this.confirmDialog.message = ConfirmMessages.DISABLE_ACCOUNT;
    } else {
      this.confirmDialog.message = ConfirmMessages.ACTIVATE_ACCOUNT;
    }
    this.confirmDialog.confirmed.subscribe(() => {
      this.spinnerComponent.loading = true;
      let changeAccountIsActive = this.changeIsActive(account);
      this.accountService.changeStatusAccount(accountId, changeAccountIsActive).subscribe({
        next: (response: ApiResponse<Account[]>) => {
          this.spinnerComponent.loading = false;
          if (response.statusCode === HttpStatus.Ok) {
            this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, response.message);
            this.getAllAccounts();
          } else {
            this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, response.message);
          }
        }, error: (error) => {
          this.spinnerComponent.loading = false;
          this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, error);
        },
      });
    });
    this.confirmDialog.rejected.subscribe(() => {
      this.toastComponent.showMessage(ToastSeverities.INFO, ToastSummaries.CANCELED, ToastMessages.CANCELED_DELETION);
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
    this.confirmDialog.message = ConfirmMessages.DELETE_ACCOUNT;
    this.confirmDialog.confirmed.subscribe(() => {
      this.spinnerComponent.loading = true;
      this.accountService.deleteAccount(accountId).subscribe({
        next: (response: ApiResponse<Account[]>) => {
          this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, response.message);
          this.getAllAccounts();
        },
        error: (error) => {
          this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, error);
          this.spinnerComponent.loading = false;
        },
      });
    });
    this.confirmDialog.rejected.subscribe(() => {
      this.toastComponent.showMessage(ToastSeverities.INFO, ToastSummaries.CANCELED, ToastMessages.CANCELED_DELETION);
    });
    this.confirmDialog.show();
  }

  handleResponse(): any {
    return {
      next: () => {
        this.spinnerComponent.loading = false;
        this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, `Cliente ${this.formMode === FormMode.Create ? 'cadastrado' : 'atualizado'} com sucesso.`);
        this.getAllAccounts();
        this.hideDialog();
      }, error: (error: any) => {
        this.spinnerComponent.loading = false;
        this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, `Erro ao ${this.formMode === FormMode.Create ? 'cadastrar' : 'atualizar'} cliente.`);
        console.error(`Erro ao ${this.formMode === FormMode.Create ? 'cadastrar' : 'atualizar'} cliente:`, error);
      },
    };
  }
}
