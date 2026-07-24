import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TableLazyLoadEvent } from 'primeng/table';
import { firstValueFrom } from 'rxjs';
import { BreadcrumbComponent } from '../../../../../../shared/components/breadcrumb/breadcrumb.component';
import { ConfirmDialogComponent } from '../../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PageHeaderComponent } from '../../../../../../shared/components/page-header/page-header.component';
import { SpinnerComponent } from '../../../../../../shared/components/spinner/spinner.component';
import { FormMode } from '../../../../../../shared/enums/form-mode.enum';
import { ToastService } from '../../../../../../shared/services/toast/toast.service';
import { Employee } from '../../interfaces/employee';
import { EmployeeService } from '../../services/employee/employee.service';
import { EmployeeDrawerFormComponent } from '../employee-drawer-form/employee-drawer-form.component';
import { EmployeeTableComponent } from '../employee-table/employee-table.component';

@Component({
  selector: 'app-employee-container',
  standalone: true,
  imports: [
    EmployeeTableComponent,
    EmployeeDrawerFormComponent,
    BreadcrumbComponent,
    PageHeaderComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './employee-container.component.html',
  styleUrl: './employee-container.component.scss',
})
export class EmployeeContainerComponent {
  private readonly employeeService = inject(EmployeeService);
  private readonly toastService = inject(ToastService);

  private readonly confirmDialog =
    viewChild<ConfirmDialogComponent>('confirmDialog');

  protected readonly FormMode = FormMode;
  protected readonly title = 'Funcionários';
  protected readonly description =
    'Cadastro e controle de colaboradores da rede municipal de saúde.';

  protected readonly itemsBreadcrumb = signal([
    { label: 'Administração', routerLink: '/administracao' },
    { label: 'Funcionários', routerLink: '/administracao/funcionarios' },
  ]);

  protected selectedEmployee?: Employee;
  protected formMode: FormMode = FormMode.Create;
  protected displayDrawer = false;

  protected readonly first = signal<number>(0);
  protected readonly rows = signal<number>(5);
  protected readonly searchTerm = signal<string>('');

  private readonly refreshTrigger = signal<number>(0);

  private readonly queryParams = computed(() => ({
    page: Math.floor(this.first() / this.rows()) + 1,
    rows: this.rows(),
    searchTerm: this.searchTerm(),
    refresh: this.refreshTrigger(),
  }));

  private readonly employeesResource = rxResource({
    request: () => this.queryParams(),
    loader: ({ request }) => {
      return this.employeeService.loadEmployees(
        request.page,
        request.rows,
        request.searchTerm,
      );
    },
  });

  protected readonly employees = computed(
    () => this.employeesResource.value()?.data ?? [],
  );
  protected readonly totalRecords = computed(
    () => this.employeesResource.value()?.totalCount ?? 0,
  );

  private readonly isActionLoading = signal<boolean>(false);
  protected readonly isLoading = computed(
    () => this.employeesResource.isLoading() || this.isActionLoading(),
  );

  protected loadEmployees(event: TableLazyLoadEvent): void {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 5);
  }

  protected onSearch(value: string): void {
    this.searchTerm.set(value);
    this.first.set(0);
  }

  protected openForm(mode: FormMode, employee?: Employee): void {
    this.formMode = mode;
    this.selectedEmployee = employee;
    this.displayDrawer = true;
  }

  protected generatePdfReport(): void {
    this.toastService.showInfo(
      'A exportação para PDF está em desenvolvimento e estará disponível em breve!',
    );
  }

  protected async saveEmployee(formValue: Employee): Promise<void> {
    this.isActionLoading.set(true);
    const operation$ =
      this.formMode === FormMode.Create
        ? this.employeeService.createEmployee(formValue)
        : this.employeeService.updateEmployee(formValue, formValue.id);

    try {
      const response = await firstValueFrom(operation$);
      if (response) {
        this.displayDrawer = false;
        this.refreshList();
      }
    } catch (error) {
      this.toastService.handleApiError(error);
    } finally {
      this.isActionLoading.set(false);
    }
  }

  protected async changeStatusEmployee(employee: Employee): Promise<void> {
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

    this.isActionLoading.set(true);
    const alteredEmployee = { ...employee, isActive: isActivating };

    try {
      await firstValueFrom(
        this.employeeService.changeStatusEmployee(employee.id, alteredEmployee),
      );

      const successMessage = `Funcionário ${isActivating ? 'ativado' : 'desativado'} com sucesso!`;
      this.toastService.showSuccess(successMessage);
      this.refreshList();
    } catch (error) {
      this.toastService.handleApiError(error);
    } finally {
      this.isActionLoading.set(false);
    }
  }

  private refreshList(): void {
    this.refreshTrigger.update((n) => n + 1);
  }
}
