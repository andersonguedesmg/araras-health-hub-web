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
import { Table } from 'primeng/table';
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
  formMode: FormMode.Create | FormMode.Update | FormMode.Detail = FormMode.Create;

  displayDialog = false;
  formSubmitted = false;

  confirmMode: ConfirmMode.Create | ConfirmMode.Update | null = null;
  confirmMessage = '';
  headerText = '';

  facilityOptions: SelectOptions<number>[] = [];

  cols!: Column[];

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
    private formHelperService: FormHelperService,
  ) {
    super();
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
      const confirmMsg = this.formMode === FormMode.Create ? ConfirmMessages.CREATE_ACCOUNT : ConfirmMessages.UPDATE_ACCOUNT;
      const account = this.accountForm.getRawValue();
      const apiCall = this.formMode === FormMode.Create
        ? firstValueFrom(this.accountService.registerAccount(account))
        : firstValueFrom(this.accountService.updateAccount(account, account.id));
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

  exportCSV(dt: Table) {
    dt.exportCSV();
  }

  navigateToRegister(): void {
    this.router.navigate(['/registrar']);
  }
}
