import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { AccountService } from '../../services/account.service';
import { Account } from '../../interfaces/account';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ConfirmMode } from '../../../../shared/enums/confirm-mode.enum';
import { Column } from '../../../../shared/utils/p-table.utils';
import { getSeverity, getStatus } from '../../../../shared/utils/status.utils';
import { StatusOptions } from '../../../../shared/constants/status-options.constants';
import { ConfirmMessages, ToastMessages } from '../../../../shared/constants/messages.constants';
import { SelectOptions } from '../../../../shared/interfaces/select-options';
import { debounceTime, firstValueFrom, Observable, Subject, Subscription, switchMap } from 'rxjs';
import { DropdownDataService } from '../../../../shared/services/dropdown-data.service';
import { HasRoleDirective } from '../../../../core/directives/has-role.directive';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { TableHeaderComponent } from '../../../../shared/components/table-header/table-header.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { getRoleSeverity, getRoleValue } from '../../../../shared/utils/roles.utils';
import { BaseComponent } from '../../../../core/components/base/base.component';
import { FormHelperService } from '../../../../core/services/form-helper.service';
import { getScopeSeverity, getScopeValue } from '../../../../shared/utils/scope.utils';
import { ScopeOptions } from '../../../../shared/enums/scope.enum';

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
    BreadcrumbComponent,
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
export class AccountListComponent extends BaseComponent implements OnInit, OnDestroy {
  FormMode = FormMode;
  ConfirmMode = ConfirmMode;
  statusOptions = StatusOptions;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Administração' }, { label: 'Contas' }];
  title: string = 'Contas';

  accounts$!: Observable<Account[]>;
  selectedAccount?: Account;
  accountForm: FormGroup;
  formMode: FormMode.Update | FormMode.Detail = FormMode.Detail;

  displayDialog = false;
  formSubmitted = false;

  confirmMode: ConfirmMode.Update | null = null;
  confirmMessage = '';
  headerText = '';

  facilityOptions: SelectOptions<number>[] = [];
  rolesOptions: SelectOptions<string>[] = [];
  scopeOptions = ScopeOptions;

  displayPasswordDialog = false;
  passwordResetForm: FormGroup;
  selectedAccountForPasswordReset?: Account;

  cols!: Column[];

  private formLabels: { [key: string]: string; } = {
    userName: 'Nome',
    facilityId: 'Unidade',
    role: 'Função',
    scope: 'Escopo',
  };

  getSeverity = getSeverity;
  getStatus = getStatus;
  getRoleSeverity = getRoleSeverity;
  getRoleValue = getRoleValue;
  getScopeSeverity = getScopeSeverity;
  getScopeValue = getScopeValue;

  private searchTerm: string = '';
  private searchSubject = new Subject<string>();

  private loadLazy = new Subject<any>();
  private subscriptions: Subscription = new Subscription();
  totalRecords = 0;

  constructor(
    private cd: ChangeDetectorRef,
    private accountService: AccountService,
    private fb: FormBuilder,
    private dropdownDataService: DropdownDataService,
    private router: Router,
    private formHelperService: FormHelperService,
  ) {
    super();
    this.accountForm = this.fb.group({
      userId: [{ value: null, disabled: true }],
      userName: ['', Validators.required],
      password: [],
      facilityId: [null, Validators.required],
      role: [null, Validators.required],
      scope: [null, Validators.required],
      isActive: [{ value: false, disabled: true }],
    });

    this.passwordResetForm = this.fb.group({
      userName: [{ value: '', disabled: true }],
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.loadTableData();
    this.loadFacilitiesOptions();
    this.rolesOptions = [
      { label: 'Usuário', value: 'User' },
      { label: 'Administrador', value: 'Admin' },
      { label: 'Master', value: 'Master' },
    ];
    this.accounts$ = this.accountService.accounts$;
    this.subscriptions.add(
      this.loadLazy
        .pipe(
          debounceTime(300),
          switchMap(event => {
            this.isLoading = true;
            const pageNumber = event.first / event.rows + 1;
            const pageSize = event.rows;
            return this.accountService.loadAccounts(pageNumber, pageSize, this.searchTerm);
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

    this.subscriptions.add(
      this.searchSubject.pipe(debounceTime(300)).subscribe(searchTerm => {
        this.searchTerm = searchTerm;
        this.loadAccounts({ first: 0, rows: 5 });
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  async loadFacilitiesOptions(): Promise<void> {
    try {
      this.facilityOptions = await this.dropdownDataService.getFacilitiesOptions();
    } catch (error) {
      this.handleApiError(error);
    }
  }

  loadTableData() {
    this.cd.markForCheck();
    this.cols = [
      { field: 'userId', header: 'ID', customExportHeader: 'CÓDIGO DA CONTA' },
      { field: 'userName', header: 'NOME' },
      { field: 'facilityId', header: 'UNIDADE' },
      { field: 'role', header: 'FUNÇÃO' },
      { field: 'scope', header: 'ESCOPO' },
      { field: 'isActive', header: 'STATUS' },
    ];
  }

  loadAccounts(event: any) {
    this.loadLazy.next(event);
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  async exportEmployees(): Promise<void> {
    this.isLoading = true;
    try {
      const response = await firstValueFrom(this.accountService.exportAccounts(this.searchTerm));
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'conta.csv';
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

  openForm(mode: FormMode.Update | FormMode.Detail, account?: Account): void {
    this.accountForm.reset();
    this.formSubmitted = false;
    this.formMode = mode;
    this.selectedAccount = account;
    this.displayDialog = true;
    this.initializeForm();

    if (mode === FormMode.Update) {
      this.headerText = 'Editar Conta';
    } else {
      this.headerText = 'Detalhes do Conta';
    }
  }

  initializeForm(): void {
    this.accountForm.reset();
    if (this.selectedAccount) {
      const formValue = {
        userId: this.selectedAccount.userId,
        userName: this.selectedAccount.userName,
        facilityId: this.selectedAccount.facility?.id,
        isActive: this.selectedAccount.isActive,
        role: this.selectedAccount.roles.length > 0 ? this.selectedAccount.roles[0] : null,
        scope: this.selectedAccount.scope,
        password: null,
      };

      this.accountForm.patchValue(formValue);
    }
    this.updateFormState();
  }

  updateFormState(): void {
    this.accountForm.disable();
    const isUpdate = this.formMode === FormMode.Update;

    if (isUpdate) {
      this.accountForm.get('userName')?.enable();
    }
  }

  hideDialog(): void {
    this.displayDialog = false;
    this.selectedAccount = undefined;
  }

  async saveAccount(): Promise<void> {
    this.formSubmitted = true;
    if (this.formMode === FormMode.Update && this.validateForm()) {
      const confirmMsg = ConfirmMessages.UPDATE_ACCOUNT;
      const account = this.accountForm.getRawValue();
      delete account.password;
      const apiCall = firstValueFrom(this.accountService.updateAccount(account, account.userId));
      await this.handleApiCall(apiCall, confirmMsg, ToastMessages.SUCCESS_OPERATION);
      this.hideDialog();
    }
  }

  async changeStatusAccount(accountId: number, account: Account): Promise<void> {
    const confirmMsg = account.isActive ? ConfirmMessages.DISABLE_ACCOUNT : ConfirmMessages.ACTIVATE_ACCOUNT;
    const changeAccountIsActive = this.changeIsActive(account);
    const apiCall = firstValueFrom(this.accountService.changeStatusAccount(accountId, changeAccountIsActive));
    await this.handleApiCall(apiCall, confirmMsg, ToastMessages.SUCCESS_OPERATION);
  }

  async deleteAccount(accountId: number): Promise<void> {
    const apiCall = firstValueFrom(this.accountService.deleteAccount(accountId));
    await this.handleApiCall(apiCall, ConfirmMessages.DELETE_ACCOUNT, ToastMessages.SUCCESS_OPERATION);
  }

  private validateForm(): boolean {
    return this.validateFormAndShowErrors(this.accountForm, this.formHelperService, this.formLabels);
  }

  private passwordMatchValidator(g: FormGroup): { [key: string]: any; } | null {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  openPasswordResetDialog(account: Account): void {
    this.selectedAccountForPasswordReset = account;
    this.passwordResetForm.reset();
    this.passwordResetForm.patchValue({
      userName: account.userName
    });
    this.displayPasswordDialog = true;
    this.formSubmitted = false;
  }

  hidePasswordResetDialog(): void {
    this.displayPasswordDialog = false;
    this.passwordResetForm.reset();
    this.selectedAccountForPasswordReset = undefined;
  }

  async resetPassword(): Promise<void> {
    this.formSubmitted = true;
    if (this.passwordResetForm.invalid) {
      if (this.passwordResetForm.hasError('mismatch')) {
        this.toastService.showError(ToastMessages.PASSWORD_AND_CONFIRMATION_DO_NOT_MATCH);
      } else {
        const labels = { newPassword: 'Nova Senha', confirmPassword: 'Confirmação de Senha' };
        this.validateFormAndShowErrors(this.passwordResetForm, this.formHelperService, labels);
      }
      return;
    }

    this.isLoading = true;
    const { newPassword } = this.passwordResetForm.getRawValue();
    const userName = this.selectedAccountForPasswordReset?.userName;

    if (!userName) {
      this.toastService.showError(ToastMessages.UNABLE_TO_IDENTIFY_ACCOUNT);
      this.isLoading = false;
      return;
    }

    const requestBody = { userName: userName, newPassword: newPassword };
    const apiCall = firstValueFrom(this.accountService.resetPassword(requestBody));
    await this.handleApiCall(apiCall, ConfirmMessages.RESET_PASSWORD, ToastMessages.PASSWORD_CHANGED_SUCCESSFULLY);
    this.hidePasswordResetDialog();
  }

  navigateToRegister(): void {
    this.router.navigate(['/administracao/contas/registrar']);
  }
}
