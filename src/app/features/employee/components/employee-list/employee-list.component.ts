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
import { DialogModule } from 'primeng/dialog';
import { InputMask } from 'primeng/inputmask';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { Table } from 'primeng/table';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ApiResponse } from '../../../../shared/interfaces/apiResponse';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { getSeverity, getStatus } from '../../../../shared/utils/status.utils';
import { Column, ExportColumn } from '../../../../shared/utils/p-table.utils';
import { ConfirmMessages, ToastMessages } from '../../../../shared/constants/messages.constants';
import { ToastSeverities, ToastSummaries } from '../../../../shared/constants/toast.constants';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ConfirmMode } from '../../../../shared/enums/confirm-mode.enum';
import { HttpStatus } from '../../../../shared/enums/http-status.enum';
import { StatusOptions } from '../../../../shared/constants/status-options.constants';
import { firstValueFrom } from 'rxjs';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../interfaces/employee';
import { HasRoleDirective } from '../../../../core/directives/has-role.directive';

@Component({
  selector: 'app-employee-list',
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
    InputMask,
    Tag,
    DialogModule,
    SelectModule,
    ToastComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
    HasRoleDirective,
  ],
  providers: [MessageService],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss'
})
export class EmployeeListComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(SpinnerComponent) spinnerComponent!: SpinnerComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Administração' }, { label: 'Funcionários' }];

  FormMode = FormMode;
  ConfirmMode = ConfirmMode;
  statusOptions = StatusOptions;

  employees: Employee[] = [];
  selectedEmployee?: Employee;
  employeeForm: FormGroup;
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
  }

  async ngAfterViewInit(): Promise<void> {
    await this.getAllEmployees();
  }

  exportCSV() {
    this.dt.exportCSV();
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

  async getAllEmployees(): Promise<void> {
    this.employees = [];
    this.spinnerComponent.loading = true;

    try {
      const response: ApiResponse<Employee[]> = await this.employeeService.getAllEmployees();
      this.spinnerComponent.loading = false;
      if (response.statusCode === HttpStatus.Ok) {
        this.employees = response.data;
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

  openForm(mode: FormMode.Create | FormMode.Update | FormMode.Detail, employee?: Employee): void {
    this.formMode = mode;
    this.selectedEmployee = employee;
    this.displayDialog = true;
    this.initializeForm();
  }

  initializeForm(): void {
    this.employeeForm.reset();
    if (this.selectedEmployee) {
      this.employeeForm.patchValue(this.selectedEmployee);
    }
    this.updateFormState();
  }

  updateFormState(): void {
    const isDetail = this.formMode === FormMode.Detail;
    const isUpdate = this.formMode === FormMode.Update;

    this.employeeForm.get('name')?.disable();
    this.employeeForm.get('cpf')?.disable();
    this.employeeForm.get('function')?.disable();
    this.employeeForm.get('phone')?.disable();
    this.employeeForm.get('isActive')?.disable();

    if (this.formMode === FormMode.Create) {
      this.employeeForm.get('isActive')?.setValue(true);
      this.employeeForm.get('isActive')?.disable();
      this.employeeForm.get('name')?.enable();
      this.employeeForm.get('cpf')?.enable();
      this.employeeForm.get('function')?.enable();
      this.employeeForm.get('phone')?.enable();
    } else if (isUpdate) {
      this.employeeForm.get('name')?.enable();
      this.employeeForm.get('cpf')?.enable();
      this.employeeForm.get('function')?.enable();
      this.employeeForm.get('phone')?.enable();
    }

    if (!isDetail && !isUpdate) {
      this.employeeForm.get('isActive')?.disable();
    }
    if (isDetail) {
      this.employeeForm.get('isActive')?.disable();
    }
  }

  hideDialog(): void {
    this.displayDialog = false;
    this.selectedEmployee = undefined;
  }

  async saveEmployee(): Promise<void> {
    this.formSubmitted = true;
    if (this.employeeForm.valid) {
      if (this.formMode === FormMode.Create) {
        this.confirmMessage = ConfirmMessages.CREATE_EMPLOYEE;
        this.confirmMode = ConfirmMode.Create;
      } else if (this.formMode === FormMode.Update) {
        this.confirmMessage = ConfirmMessages.UPDATE_EMPLOYEE;
        this.confirmMode = ConfirmMode.Update;
      }
      this.confirmDialog.message = this.confirmMessage;
      this.confirmDialog.show();

      try {
        await firstValueFrom(this.confirmDialog.confirmed);
        this.spinnerComponent.loading = true;
        const employee: Employee = this.employeeForm.getRawValue();
        let response: any = null;
        if (this.confirmMode === ConfirmMode.Create) {
          response = await this.employeeService.createEmployee(employee);
        } else if (this.confirmMode === ConfirmMode.Update) {
          response = await this.employeeService.updateEmployee(employee, employee.id);
        }
        this.spinnerComponent.loading = false;
        if (response && (response.statusCode === HttpStatus.Ok || response.statusCode === HttpStatus.Created)) {
          this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, response.message);
          this.getAllEmployees();
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

  async changeStatusEmployee(employeeId: number, employee: Employee): Promise<void> {
    if (employee.isActive) {
      this.confirmDialog.message = ConfirmMessages.DISABLE_EMPLOYEE;
    } else {
      this.confirmDialog.message = ConfirmMessages.ACTIVATE_EMPLOYEE;
    }
    this.confirmDialog.show();

    try {
      await firstValueFrom(this.confirmDialog.confirmed);
      this.spinnerComponent.loading = true;
      let changeEmployeeIsActive = this.changeIsActive(employee);

      const response: ApiResponse<Employee> = await this.employeeService.changeStatusEmployee(employeeId, changeEmployeeIsActive);
      this.spinnerComponent.loading = false;

      if (response && response.statusCode === HttpStatus.Ok) {
        this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, response.message);
        this.getAllEmployees();
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
      if (employee.isActive) {
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

  async deleteEmployee(employeeId: number): Promise<void> {
    this.confirmDialog.message = ConfirmMessages.DELETE_EMPLOYEE;
    this.confirmDialog.show();

    try {
      await firstValueFrom(this.confirmDialog.confirmed);
      this.spinnerComponent.loading = true;

      const response: ApiResponse<Employee> = await this.employeeService.deleteEmployee(employeeId);
      this.spinnerComponent.loading = false;

      if (response && response.statusCode === HttpStatus.Ok) {
        this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, response.message);
        this.getAllEmployees();
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
