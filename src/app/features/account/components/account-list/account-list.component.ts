import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
import { AccountService } from '../../services/account.service';
import { Account } from '../../interfaces/account';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ConfirmMode } from '../../../../shared/enums/confirm-mode.enum';
import { Column, ExportColumn } from '../../../../shared/utils/p-table.utils';
import { getSeverity, getStatus } from '../../../../shared/utils/status.utils';
import { StatusOptions } from '../../../../shared/constants/status-options.constants';
import { ApiResponse } from '../../../../shared/interfaces/api-response';
import { ConfirmMessages, ToastMessages } from '../../../../shared/constants/messages.constants';
import { SelectOptions } from '../../../../shared/interfaces/select-options';
import { ToastSeverities, ToastSummaries } from '../../../../shared/constants/toast.constants';
import { HttpStatus } from '../../../../shared/enums/http-status.enum';
import { debounceTime, firstValueFrom, Observable, Subject, Subscription, switchMap } from 'rxjs';
import { DropdownDataService } from '../../../../shared/services/dropdown-data.service';
import { HasRoleDirective } from '../../../../core/directives/has-role.directive';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { TableHeaderComponent } from '../../../../shared/components/table-header/table-header.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { InputMask } from 'primeng/inputmask';
import { getRoleSeverity, getRoleValue } from '../../../../shared/utils/roles.utils';

@Component({
  selector: 'app-account-list',
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
    // InputMask,
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
  templateUrl: './account-list.component.html',
  styleUrl: './account-list.component.scss'
})
export class AccountListComponent implements OnInit, OnDestroy {
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  isLoading = false;

  FormMode = FormMode;
  ConfirmMode = ConfirmMode;
  statusOptions = StatusOptions;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Administração' }, { label: 'Contas' }];
  title: string = 'Contas';

  accounts$!: Observable<Account[]>;
  selectedAccount?: Account;
  accountForm: FormGroup;
  formMode: FormMode.Create | FormMode.Update | FormMode.Detail = FormMode.Create;

  displayDialog = false;
  formSubmitted = false;

  confirmMode: ConfirmMode.Create | ConfirmMode.Update | null = null;
  confirmMessage = '';
  headerText = '';

  facilityOptions: SelectOptions<number>[] = [];

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
  getRoleSeverity = getRoleSeverity;
  getRoleValue = getRoleValue;

  private loadLazy = new Subject<any>();
  private subscriptions: Subscription = new Subscription();
  totalRecords = 0;

  constructor(
    private cd: ChangeDetectorRef,
    private accountService: AccountService,
    private fb: FormBuilder,
    private dropdownDataService: DropdownDataService,
    private router: Router,
  ) {
    this.accountForm = this.fb.group({
      userId: [{ value: null, disabled: true }],
      userName: ['', Validators.required],
      password: [],
      facilityId: [],
      isActive: [{ value: false, disabled: true }],
    });
  }

  ngOnInit() {
    this.loadTableData();
    this.loadFacilitiesOptions();
    this.accounts$ = this.accountService.accounts$;
    this.subscriptions.add(
      this.loadLazy
        .pipe(
          debounceTime(300),
          switchMap(event => {
            this.isLoading = true;
            const pageNumber = event.first / event.rows + 1;
            const pageSize = event.rows;
            return this.accountService.loadAccounts(pageNumber, pageSize);
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
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  async loadFacilitiesOptions(): Promise<void> {
    try {
      this.facilityOptions = await this.dropdownDataService.getFacilitiesOptions();
    } catch (error: any) {
      if (error.message !== 'cancel') {
        this.handleApiError(error);
      }
    }
  }

  loadTableData() {
    this.cd.markForCheck();
    this.cols = [
      { field: 'userId', header: 'ID', customExportHeader: 'CÓDIGO DA CONTA' },
      { field: 'userName', header: 'NOME' },
      { field: 'facilityId', header: 'UNIDADE' },
      { field: 'isActive', header: 'STATUS' },
    ];
    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    this.selectedColumns = this.cols;
  }

  loadAccounts(event: any) {
    console.log('loadAccounts', event);
    this.loadLazy.next(event);
  }

  openForm(mode: FormMode.Create | FormMode.Update | FormMode.Detail, account?: Account): void {
    this.accountForm.reset();
    this.formSubmitted = false; this.formMode = mode;
    this.selectedAccount = account;
    this.displayDialog = true;
    this.initializeForm();
    if (mode === FormMode.Create) {
      this.headerText = 'Nova Conta';
    } else if (mode === FormMode.Update) {
      this.headerText = 'Editar Conta';
    } else {
      this.headerText = 'Detalhes do Conta';
    }
  }

  initializeForm(): void {
    this.accountForm.reset();
    if (this.selectedAccount) {
      this.accountForm.patchValue(this.selectedAccount);
    }
    this.updateFormState();
  }

  updateFormState(): void {
    this.accountForm.disable();

    const isCreate = this.formMode === FormMode.Create;
    const isUpdate = this.formMode === FormMode.Update;

    if (isCreate || isUpdate) {
      this.accountForm.get('userName')?.enable();
      this.accountForm.get('facilityId')?.enable();
      this.accountForm.get('password')?.enable();
    }

    if (isCreate) {
      this.accountForm.get('isActive')?.setValue(true);
      this.accountForm.get('isActive')?.disable();
    }
  }

  hideDialog(): void {
    this.displayDialog = false;
    this.selectedAccount = undefined;
  }

  async saveAccount(): Promise<void> {
    this.formSubmitted = true;
    if (this.validateForm()) {
      this.confirmMessage = this.formMode === FormMode.Create ? ConfirmMessages.CREATE_ACCOUNT : ConfirmMessages.UPDATE_ACCOUNT;
      this.confirmDialog.message = this.confirmMessage;
      this.confirmDialog.show();

      try {
        await firstValueFrom(this.confirmDialog.confirmed);
        this.isLoading = true;
        const account: Account = this.accountForm.getRawValue();

        const apiCall$ = this.formMode === FormMode.Create
          ? this.accountService.registerAccount(account)
          : this.accountService.updateAccount(account, account.userId);

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

  async changeStatusAccount(accountId: number, account: Account): Promise<void> {
    this.confirmMessage = account.isActive ? ConfirmMessages.DISABLE_ACCOUNT : ConfirmMessages.ACTIVATE_ACCOUNT;
    this.confirmDialog.message = this.confirmMessage;
    this.confirmDialog.show();

    try {
      await firstValueFrom(this.confirmDialog.confirmed);
      this.isLoading = true;

      const changeAccountIsActive = this.changeIsActive(account);
      const response = await firstValueFrom(this.accountService.changeStatusAccount(accountId, changeAccountIsActive));

      this.isLoading = false;
      this.handleApiResponse(response, ToastMessages.SUCCESS_OPERATION);

    } catch (error: any) {
      this.isLoading = false;
      if (error.message !== 'cancel') {
        this.handleApiError(error);
      }
    }
  }

  async deleteAccount(accountId: number): Promise<void> {
    this.confirmDialog.message = ConfirmMessages.DELETE_ACCOUNT;
    this.confirmDialog.show();

    try {
      await firstValueFrom(this.confirmDialog.confirmed);
      this.isLoading = true;

      const response = await firstValueFrom(this.accountService.deleteAccount(accountId));

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
    if (this.accountForm.valid) {
      return true;
    }

    const invalidControls = this.findInvalidControlsRecursive(this.accountForm);
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

  navigateToRegister(): void {
    this.router.navigate(['/registrar']);
  }
}
