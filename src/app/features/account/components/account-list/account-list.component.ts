import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
import { getRoleSeverity, getRoleValue } from '../../../../shared/utils/roles.utils';
import { SelectOptions } from '../../../../shared/interfaces/select-options';
import { FacilityService } from '../../../facility/services/facility.service';
import { firstValueFrom } from 'rxjs';

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

  itemsBreadcrumb: MenuItem[] = [{ label: 'Administração' }, { label: 'Contas' }];

  accounts: Account[] = [];
  selectedAccount?: Account;
  accountForm: FormGroup;
  formMode: FormMode.Create | FormMode.Update | FormMode.Detail = FormMode.Create;
  displayDialog = false;
  formSubmitted = false;

  confirmMode: ConfirmMode.Create | ConfirmMode.Update | null = null;
  confirmMessage = '';

  facilityOptions: SelectOptions<number>[] = [];

  cols!: Column[];
  selectedColumns!: Column[];
  exportColumns!: ExportColumn[];

  getSeverity = getSeverity;
  getStatus = getStatus;
  getRoleSeverity = getRoleSeverity;
  getRoleValue = getRoleValue;

  constructor(private cd: ChangeDetectorRef, private accountService: AccountService, private fb: FormBuilder, private facilityService: FacilityService, private router: Router) {
    this.accountForm = this.fb.group({
      id: [{ value: null, disabled: true }],
      userName: ['', Validators.required],
      password: [],
      facilityId: [],
      isActive: [{ value: false, disabled: true }],
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadFacilitiesNames();
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
      { field: 'id', header: 'ID', customExportHeader: 'CÓDIGO DA CONTA' },
      { field: 'userName', header: 'NOME' },
      { field: 'facilityId', header: 'UNIDADE' },
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

  async loadFacilitiesNames(): Promise<void> {
    try {
      const response: ApiResponse<any[]> = await this.facilityService.getAllFacilitiesNames();
      if (response && response.data) {
        this.facilityOptions = response.data.map((facility) => ({
          label: facility.name,
          value: facility.id,
        }));
      }
    } catch (error) {
      console.error(ToastMessages.ERROR_LOADING_NAMES, error);
    }
  }

  openForm(mode: FormMode.Create | FormMode.Update | FormMode.Detail, account?: Account): void {
    this.formMode = mode;
    this.selectedAccount = account;
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
    this.accountForm.get('facilityId')?.disable();
    this.accountForm.get('isActive')?.disable();

    if (this.formMode === FormMode.Create) {
      this.accountForm.get('isActive')?.setValue(true);
      this.accountForm.get('isActive')?.disable();
      this.accountForm.get('userName')?.enable();
      this.accountForm.get('facilityId')?.enable();
      this.accountForm.get('password')?.enable();
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

  async saveAccount(): Promise<void> {
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
      this.confirmDialog.show();

      try {
        await firstValueFrom(this.confirmDialog.confirmed);
        this.spinnerComponent.loading = true;
        const account: Account = this.accountForm.getRawValue();
        let response: any = null;
        if (this.confirmMode === ConfirmMode.Create) {
          response = await this.accountService.createAccount(account);
        } else if (this.confirmMode === ConfirmMode.Update) {
          response = await this.accountService.updateAccount(account);
        }
        this.spinnerComponent.loading = false;
        if (response && (response.statusCode === HttpStatus.Ok || response.statusCode === HttpStatus.Created)) {
          this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, response.message);
          this.getAllAccounts();
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

  async changeStatusAccount(account: Account): Promise<void> {
    if (account.isActive) {
      this.confirmDialog.message = ConfirmMessages.DISABLE_ACCOUNT;
    } else {
      this.confirmDialog.message = ConfirmMessages.ACTIVATE_ACCOUNT;
    }
    this.confirmDialog.show();

    try {
      await firstValueFrom(this.confirmDialog.confirmed);
      this.spinnerComponent.loading = true;
      let changeAccountIsActive = this.changeIsActive(account);

      const response: ApiResponse<Account> = await this.accountService.changeStatusAccount(changeAccountIsActive);
      this.spinnerComponent.loading = false;

      if (response && response.statusCode === HttpStatus.Ok) {
        this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, response.message);
        this.getAllAccounts();
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
      if (account.isActive) {
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

  navigateToRegister(): void {
    this.router.navigate(['/registrar']);
  }

  changeIsActive(objeto: any) {
    if (objeto && typeof objeto === 'object' && 'isActive' in objeto) {
      objeto.isActive = !objeto.isActive;
    }
    return objeto;
  }
}
