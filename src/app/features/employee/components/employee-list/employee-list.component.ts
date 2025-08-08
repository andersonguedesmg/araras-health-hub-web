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
import { StatusOptions } from '../../../../shared/constants/status-options.constants';
import { ApiResponse } from '../../../../shared/interfaces/apiResponse';
import { ConfirmMessages, ToastMessages } from '../../../../shared/constants/messages.constants';
import { ToastSeverities, ToastSummaries } from '../../../../shared/constants/toast.constants';
import { HttpStatus } from '../../../../shared/enums/http-status.enum';
import { debounceTime, firstValueFrom, Observable, Subject, Subscription, switchMap } from 'rxjs';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../interfaces/employee';
import { HasRoleDirective } from '../../../../core/directives/has-role.directive';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { TableHeaderComponent } from '../../../../shared/components/table-header/table-header.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { InputMask } from 'primeng/inputmask';

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
export class EmployeeListComponent implements OnInit, OnDestroy {
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Administração' }, { label: 'Funcionários' }];

  isLoading = false;

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
  selectedColumns!: Column[];
  exportColumns!: ExportColumn[];

  private formLabels: { [key: string]: string; } = {
    name: 'Nome do Produto',
    description: 'Descrição',
    dosageForm: 'Unidade de Medida',
    category: 'Categoria'
  };

  getSeverity = getSeverity;
  getStatus = getStatus;

  private loadLazy = new Subject<any>();
  private subscriptions: Subscription = new Subscription();
  totalRecords = 0;

  constructor(private cd: ChangeDetectorRef, private employeeService: EmployeeService, private fb: FormBuilder) {
    this.employeeForm = this.fb.group({
      id: [{ value: null, disabled: true }],
      name: ['', Validators.required],
      cpf: ['', Validators.required],
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
            return this.employeeService.loadEmployees(pageNumber, pageSize);
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
    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    this.selectedColumns = this.cols;
  }

  loadEmployees(event: any) {
    this.loadLazy.next(event);
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
      this.confirmMessage = this.formMode === FormMode.Create ? ConfirmMessages.CREATE_EMPLOYEE : ConfirmMessages.UPDATE_EMPLOYEE;
      this.confirmDialog.message = this.confirmMessage;
      this.confirmDialog.show();

      try {
        await firstValueFrom(this.confirmDialog.confirmed);
        this.isLoading = true;
        const employees: Employee = this.employeeForm.getRawValue();

        const apiCall$ = this.formMode === FormMode.Create
          ? this.employeeService.createEmployee(employees)
          : this.employeeService.updateEmployee(employees, employees.id);

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

  async changeStatusEmployee(employeeId: number, employees: Employee): Promise<void> {
    this.confirmMessage = employees.isActive ? ConfirmMessages.DISABLE_EMPLOYEE : ConfirmMessages.ACTIVATE_EMPLOYEE;
    this.confirmDialog.message = this.confirmMessage;
    this.confirmDialog.show();

    try {
      await firstValueFrom(this.confirmDialog.confirmed);
      this.isLoading = true;

      const changeEmployeeIsActive = this.changeIsActive(employees);
      const response = await firstValueFrom(this.employeeService.changeStatusEmployee(employeeId, changeEmployeeIsActive));

      this.isLoading = false;
      this.handleApiResponse(response, ToastMessages.SUCCESS_OPERATION);

    } catch (error: any) {
      this.isLoading = false;
      if (error.message !== 'cancel') {
        this.handleApiError(error);
      }
    }
  }

  async deleteEmployee(employeeId: number): Promise<void> {
    this.confirmDialog.message = ConfirmMessages.DELETE_EMPLOYEE;
    this.confirmDialog.show();

    try {
      await firstValueFrom(this.confirmDialog.confirmed);
      this.isLoading = true;

      const response = await firstValueFrom(this.employeeService.deleteEmployee(employeeId));

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
    if (this.employeeForm.valid) {
      return true;
    }

    const invalidControls = this.findInvalidControlsRecursive(this.employeeForm);
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
