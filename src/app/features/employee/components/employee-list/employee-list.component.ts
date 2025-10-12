import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
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
import { ToastComponent } from '../../../../shared/components/toast/toast.component';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ConfirmMode } from '../../../../shared/enums/confirm-mode.enum';
import { Column } from '../../../../shared/utils/p-table.utils';
import { getSeverity, getStatus } from '../../../../shared/utils/status.utils';
import { StatusOptions } from '../../../../shared/constants/status-options.constants';
import { ConfirmMessages, ToastMessages } from '../../../../shared/constants/messages.constants';
import { ToastSeverities, ToastSummaries } from '../../../../shared/constants/toast.constants';
import { debounceTime, firstValueFrom, Observable, Subject, Subscription, switchMap } from 'rxjs';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../interfaces/employee';
import { HasRoleDirective } from '../../../../core/directives/has-role.directive';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { TableHeaderComponent } from '../../../../shared/components/table-header/table-header.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { InputMask } from 'primeng/inputmask';
import { FormHelperService } from '../../../../core/services/form-helper.service';
import { BaseComponent } from '../../../../core/components/base/base.component';
import { cpfValidator } from '../../../../core/validators/cpf-cnpj.validator';

@Component({
  selector: 'app-employee-list',
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
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss'
})
export class EmployeeListComponent extends BaseComponent implements OnInit, OnDestroy {
  itemsBreadcrumb: MenuItem[] = [{ label: 'Administração' }, { label: 'Funcionários' }];
  title: string = 'Funcionários';

  FormMode = FormMode;
  ConfirmMode = ConfirmMode;
  statusOptions = StatusOptions;

  employees$!: Observable<Employee[]>;
  selectedEmployee?: Employee;
  employeeForm: FormGroup;
  formMode: FormMode.Create | FormMode.Update | FormMode.Detail = FormMode.Create;

  displayDialog = false;
  formSubmitted = false;

  confirmMode: ConfirmMode.Create | ConfirmMode.Update | null = null;
  confirmMessage = '';
  headerText = '';

  cols!: Column[];

  private formLabels: { [key: string]: string; } = {
    name: 'Nome do Produto',
    cpf: 'CPF',
    function: 'Função',
    phone: 'Telefone'
  };

  getSeverity = getSeverity;
  getStatus = getStatus;

  private searchTerm: string = '';
  private searchSubject = new Subject<string>();

  private loadLazy = new Subject<any>();
  private subscriptions: Subscription = new Subscription();
  totalRecords = 0;

  constructor(
    private cd: ChangeDetectorRef,
    private employeeService: EmployeeService,
    private fb: FormBuilder,
    private formHelperService: FormHelperService,
  ) {
    super();
    this.employeeForm = this.fb.group({
      id: [{ value: null, disabled: true }],
      name: ['', Validators.required],
      cpf: ['', [Validators.required, cpfValidator()]],
      function: ['', Validators.required],
      phone: ['', Validators.required],
      isActive: [{ value: false, disabled: true }],
    });
  }

  ngOnInit() {
    this.loadTableData();
    this.employees$ = this.employeeService.employees$;
    this.subscriptions.add(
      this.loadLazy
        .pipe(
          debounceTime(300),
          switchMap(event => {
            this.isLoading = true;
            const pageNumber = event.first / event.rows + 1;
            const pageSize = event.rows;
            return this.employeeService.loadEmployees(pageNumber, pageSize, this.searchTerm);
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
        this.loadEmployees({ first: 0, rows: 5 });
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadTableData() {
    this.cd.markForCheck();
    this.cols = [
      { field: 'id', header: 'ID', customExportHeader: 'CÓDIGO DO USUÁRIO' },
      { field: 'name', header: 'NOME' },
      { field: 'cpf', header: 'CPF' },
      { field: 'function', header: 'FUNÇÃO' },
      { field: 'phone', header: 'TELEFONE' },
      { field: 'isActive', header: 'STATUS' },
    ];
  }

  loadEmployees(event: any) {
    this.loadLazy.next(event);
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  async exportEmployees(): Promise<void> {
    this.isLoading = true;
    try {
      const response = await firstValueFrom(this.employeeService.exportEmployees(this.searchTerm));
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'funcionario.csv';
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
      this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, ToastMessages.SUCCESS_EXPORT);
    } catch (error) {
      this.isLoading = false;
      this.handleApiError(error);
      this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, ToastMessages.UNEXPECTED_ERROR);
    }
  }

  openForm(mode: FormMode.Create | FormMode.Update | FormMode.Detail, employees?: Employee): void {
    this.employeeForm.reset();
    this.formSubmitted = false; this.formMode = mode;
    this.selectedEmployee = employees;
    this.displayDialog = true;
    this.initializeForm();
    if (mode === FormMode.Create) {
      this.headerText = 'Novo Funcionário';
    } else if (mode === FormMode.Update) {
      this.headerText = 'Editar Funcionário';
    } else {
      this.headerText = 'Detalhes do Funcionário';
    }
  }

  initializeForm(): void {
    this.employeeForm.reset();
    if (this.selectedEmployee) {
      this.employeeForm.patchValue(this.selectedEmployee);
    }
    this.updateFormState();
  }

  updateFormState(): void {
    this.employeeForm.disable();

    const isCreate = this.formMode === FormMode.Create;
    const isUpdate = this.formMode === FormMode.Update;

    if (isCreate || isUpdate) {
      this.employeeForm.get('name')?.enable();
      this.employeeForm.get('cpf')?.enable();
      this.employeeForm.get('function')?.enable();
      this.employeeForm.get('phone')?.enable();
    }

    if (isCreate) {
      this.employeeForm.get('isActive')?.setValue(true);
      this.employeeForm.get('isActive')?.disable();
    }
  }

  hideDialog(): void {
    this.displayDialog = false;
    this.selectedEmployee = undefined;
  }

  async saveEmployee(): Promise<void> {
    this.formSubmitted = true;
    if (this.validateForm()) {
      const confirmMsg = this.formMode === FormMode.Create ? ConfirmMessages.CREATE_EMPLOYEE : ConfirmMessages.UPDATE_EMPLOYEE;
      const employee = this.employeeForm.getRawValue();
      const apiCall = this.formMode === FormMode.Create
        ? firstValueFrom(this.employeeService.createEmployee(employee))
        : firstValueFrom(this.employeeService.updateEmployee(employee, employee.id));
      await this.handleApiCall(apiCall, confirmMsg, ToastMessages.SUCCESS_OPERATION);
      this.hideDialog();
    }
  }

  async changeStatusEmployee(employeeId: number, employee: Employee): Promise<void> {
    const confirmMsg = employee.isActive ? ConfirmMessages.DISABLE_EMPLOYEE : ConfirmMessages.ACTIVATE_EMPLOYEE;
    const changeEmployeeIsActive = this.changeIsActive(employee);
    const apiCall = firstValueFrom(this.employeeService.changeStatusEmployee(employeeId, changeEmployeeIsActive));
    await this.handleApiCall(apiCall, confirmMsg, ToastMessages.SUCCESS_OPERATION);
  }

  async deleteEmployee(employeeId: number): Promise<void> {
    const apiCall = firstValueFrom(this.employeeService.deleteEmployee(employeeId));
    await this.handleApiCall(apiCall, ConfirmMessages.DELETE_EMPLOYEE, ToastMessages.SUCCESS_OPERATION);
  }

  private validateForm(): boolean {
    return this.validateFormAndShowErrors(this.employeeForm, this.formHelperService, this.formLabels);
  }

  async validateCpf(): Promise<void> {
    const cpfControl = this.employeeForm.get('cpf');
    if (cpfControl?.value && cpfControl.invalid) {
      cpfControl.markAsTouched();
      cpfControl.updateValueAndValidity();
      if (cpfControl.errors?.['invalidCpf']) {
        this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, ToastMessages.CPF_INVALID);
      }
    }
  }
}
