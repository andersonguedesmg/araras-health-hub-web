import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  inject,
  viewChild,
} from '@angular/core';
import { Subject, Subscription, firstValueFrom } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ToastService } from '../../../../shared/services/toast.service';
import { Employee } from '../../interfaces/employee';
import { EmployeeService } from '../../services/employee.service';
import { EmployeeDrawerFormComponent } from '../employee-drawer-form/employee-drawer-form.component';
import { EmployeeTableComponent } from '../employee-table/employee-table.component';

@Component({
  selector: 'app-employee-container',
  standalone: true,
  imports: [
    CommonModule,
    EmployeeTableComponent,
    EmployeeDrawerFormComponent,
    BreadcrumbComponent,
    PageHeaderComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './employee-container.component.html',
  styleUrl: './employee-container.component.scss',
})
export class EmployeeContainerComponent implements OnInit, OnDestroy {
  private readonly employeeService = inject(EmployeeService);
  private readonly toastService = inject(ToastService);

  protected readonly employees = this.employeeService.employees;
  private readonly confirmDialog =
    viewChild<ConfirmDialogComponent>('confirmDialog');

  readonly FormMode = FormMode;
  readonly title = 'Funcionários';
  readonly description =
    'Cadastro e controle de colaboradores da rede municipal de saúde.';

  readonly itemsBreadcrumb = [
    { label: 'Administração', routerLink: '/administracao' },
    { label: 'Funcionários', routerLink: '/administracao/funcionarios' },
  ];

  selectedEmployee?: Employee;
  formMode: FormMode = FormMode.Create;

  displayDrawer = false;
  isLoading = false;
  totalRecords = 0;
  rows = 5;
  first = 0;

  private searchTerm = '';
  private readonly loadLazy = new Subject<any>();
  private lastLazyEvent = { first: 0, rows: 5 };
  private readonly subscriptions = new Subscription();

  ngOnInit(): void {
    this.subscriptions.add(
      this.loadLazy
        .pipe(
          debounceTime(300),
          switchMap((event) => {
            this.isLoading = true;

            this.first = event.first;
            this.rows = event.rows;

            const page = event.first / event.rows + 1;
            return this.employeeService.loadEmployees(
              page,
              event.rows,
              this.searchTerm,
            );
          }),
        )
        .subscribe({
          next: (response) => {
            this.isLoading = false;

            if (response && response.totalCount !== undefined) {
              this.totalRecords = response.totalCount;
            }
          },
          error: (error) => {
            this.isLoading = false;
            this.toastService.handleApiError(error);
          },
        }),
    );

    this.loadLazy.next(this.lastLazyEvent);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadEmployees(event: any): void {
    this.lastLazyEvent = event;
    this.loadLazy.next(event);
  }

  onSearch(value: string): void {
    this.searchTerm = value;
    this.loadEmployees({ first: 0, rows: this.lastLazyEvent.rows });
  }

  openForm(mode: FormMode, employee?: Employee): void {
    this.formMode = mode;
    this.selectedEmployee = employee;
    this.displayDrawer = true;
  }

  async saveEmployee(formValue: Employee): Promise<void> {
    this.isLoading = true;
    const operation$ =
      this.formMode === FormMode.Create
        ? this.employeeService.createEmployee(formValue)
        : this.employeeService.updateEmployee(formValue, formValue.id);

    try {
      const response = await firstValueFrom(operation$);
      if (response) {
        this.displayDrawer = false;
        this.loadLazy.next(this.lastLazyEvent);
      }
    } catch (error) {
      this.toastService.handleApiError(error);
    } finally {
      this.isLoading = false;
    }
  }

  async changeStatusEmployee(employee: Employee): Promise<void> {
    const dialog = this.confirmDialog();
    if (!dialog) return;

    const isActivating = !employee.isActive;
    const actionText = employee.isActive ? 'desativar' : 'ativar';
    const msg = `Deseja realmente ${actionText} o funcionário "${employee.name}"?`;
    const title = employee.isActive
      ? 'Confirmar Desativação'
      : 'Confirmar Ativação';

    const confirmed = await firstValueFrom(dialog.show(msg, title));
    if (!confirmed) return;

    this.isLoading = true;
    const alteredEmployee = { ...employee, isActive: isActivating };

    try {
      await firstValueFrom(
        this.employeeService.changeStatusEmployee(employee.id, alteredEmployee),
      );

      const successMessage = `Funcionário ${isActivating ? 'ativado' : 'desativado'} com sucesso!`;
      this.toastService.showSuccess(successMessage);
      this.loadLazy.next(this.lastLazyEvent);
    } catch (error) {
      this.toastService.handleApiError(error);
    } finally {
      this.isLoading = false;
    }
  }
}
