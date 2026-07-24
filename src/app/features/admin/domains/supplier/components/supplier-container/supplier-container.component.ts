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
import { Supplier } from '../../interfaces/supplier';
import { SupplierService } from '../../services/supplier.service';
import { SupplierDrawerFormComponent } from '../supplier-drawer-form/supplier-drawer-form.component';
import { SupplierTableComponent } from '../supplier-table/supplier-table.component';

@Component({
  selector: 'app-supplier-container',
  standalone: true,
  imports: [
    SupplierTableComponent,
    SupplierDrawerFormComponent,
    BreadcrumbComponent,
    PageHeaderComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './supplier-container.component.html',
  styleUrl: './supplier-container.component.scss',
})
export class SupplierContainerComponent {
  private readonly supplierService = inject(SupplierService);
  private readonly toastService = inject(ToastService);

  private readonly confirmDialog =
    viewChild<ConfirmDialogComponent>('confirmDialog');

  protected readonly FormMode = FormMode;
  protected readonly title = 'Fornecedores';
  protected readonly description =
    'Cadastro e controle de parceiros comerciais da rede municipal de saúde.';

  protected readonly itemsBreadcrumb = signal([
    { label: 'Administração', routerLink: '/administracao' },
    { label: 'Fornecedores', routerLink: '/administracao/fornecedores' },
  ]);

  protected selectedSupplier?: Supplier;
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

  private readonly suppliersResource = rxResource({
    request: () => this.queryParams(),
    loader: ({ request }) => {
      return this.supplierService.loadSuppliers(
        request.page,
        request.rows,
        request.searchTerm,
      );
    },
  });

  protected readonly suppliers = computed(
    () => this.suppliersResource.value()?.data ?? [],
  );
  protected readonly totalRecords = computed(
    () => this.suppliersResource.value()?.totalCount ?? 0,
  );

  private readonly isActionLoading = signal<boolean>(false);
  protected readonly isLoading = computed(
    () => this.suppliersResource.isLoading() || this.isActionLoading(),
  );

  protected loadSuppliers(event: TableLazyLoadEvent): void {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 5);
  }

  protected onSearch(value: string): void {
    this.searchTerm.set(value);
    this.first.set(0);
  }

  protected openForm(mode: FormMode, supplier?: Supplier): void {
    this.formMode = mode;
    this.selectedSupplier = supplier;
    this.displayDrawer = true;
  }

  protected generatePdfReport(): void {
    this.toastService.showInfo(
      'A exportação para PDF está em desenvolvimento e estará disponível em breve!',
    );
  }

  protected async saveSupplier(formValue: Supplier): Promise<void> {
    this.isActionLoading.set(true);
    const operation$ =
      this.formMode === FormMode.Create
        ? this.supplierService.createSupplier(formValue)
        : this.supplierService.updateSupplier(formValue, formValue.id);

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

  protected async changeStatusSupplier(supplier: Supplier): Promise<void> {
    const dialog = this.confirmDialog();
    if (!dialog) return;

    const isActivating = !supplier.isActive;
    const actionText = supplier.isActive ? 'desativar' : 'ativar';
    const supplierName = supplier.tradeName || supplier.legalName || '';
    const msg = `Deseja realmente ${actionText} o fornecedor "${supplierName}"?`;
    const title = supplier.isActive
      ? 'Confirmar Desativação'
      : 'Confirmar Ativação';

    const confirmed = await firstValueFrom(dialog.show(msg, title));
    if (!confirmed) return;

    this.isActionLoading.set(true);
    const alteredSupplier = { ...supplier, isActive: isActivating };

    try {
      await firstValueFrom(
        this.supplierService.changeStatusSupplier(supplier.id, alteredSupplier),
      );

      const successMessage = `Fornecedor ${isActivating ? 'ativado' : 'desativado'} com sucesso!`;
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
