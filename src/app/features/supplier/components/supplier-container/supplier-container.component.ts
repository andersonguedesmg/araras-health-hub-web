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
import { Supplier } from '../../interfaces/supplier';
import { SupplierService } from '../../services/supplier.service';
import { SupplierDrawerFormComponent } from '../supplier-drawer-form/supplier-drawer-form.component';
import { SupplierTableComponent } from '../supplier-table/supplier-table.component';

@Component({
  selector: 'app-supplier-container',
  standalone: true,
  imports: [
    CommonModule,
    SupplierTableComponent,
    SupplierDrawerFormComponent,
    BreadcrumbComponent,
    PageHeaderComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './supplier-container.component.html',
  styleUrl: './supplier-container.component.scss',
})
export class SupplierContainerComponent implements OnInit, OnDestroy {
  private readonly supplierService = inject(SupplierService);
  private readonly toastService = inject(ToastService);

  protected readonly suppliers = this.supplierService.suppliers;
  private readonly confirmDialog =
    viewChild<ConfirmDialogComponent>('confirmDialog');

  readonly FormMode = FormMode;
  readonly title = 'Fornecedores';
  readonly description =
    'Cadastro e controle de parceiros comerciais da rede municipal de saúde.';

  readonly itemsBreadcrumb = [
    { label: 'Administração', routerLink: '/administracao' },
    { label: 'Fornecedores', routerLink: '/administracao/fornecedores' },
  ];

  selectedSupplier?: Supplier;
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
            return this.supplierService.loadSuppliers(
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

  loadSuppliers(event: any): void {
    this.lastLazyEvent = event;
    this.loadLazy.next(event);
  }

  onSearch(value: string): void {
    this.searchTerm = value;
    this.loadSuppliers({ first: 0, rows: this.lastLazyEvent.rows });
  }

  openForm(mode: FormMode, supplier?: Supplier): void {
    this.formMode = mode;
    this.selectedSupplier = supplier;
    this.displayDrawer = true;
  }

  async saveSupplier(formValue: Supplier): Promise<void> {
    this.isLoading = true;
    const operation$ =
      this.formMode === FormMode.Create
        ? this.supplierService.createSupplier(formValue)
        : this.supplierService.updateSupplier(formValue, formValue.id);

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

  async changeStatusSupplier(supplier: Supplier): Promise<void> {
    const dialog = this.confirmDialog();
    if (!dialog) return;

    const isActivating = !supplier.isActive;
    const actionText = supplier.isActive ? 'desativar' : 'ativar';
    const msg = `Deseja realmente ${actionText} o fornecedor "${supplier.tradeName || supplier.legalName}"?`;
    const title = supplier.isActive
      ? 'Confirmar Desativação'
      : 'Confirmar Ativação';

    const confirmed = await firstValueFrom(dialog.show(msg, title));
    if (!confirmed) return;

    this.isLoading = true;
    const alteredSupplier = { ...supplier, isActive: isActivating };

    try {
      await firstValueFrom(
        this.supplierService.changeStatusSupplier(supplier.id, alteredSupplier),
      );

      const successMessage = `Fornecedor ${isActivating ? 'ativado' : 'desativado'} com sucesso!`;
      this.toastService.showSuccess(successMessage);
      this.loadLazy.next(this.lastLazyEvent);
    } catch (error) {
      this.toastService.handleApiError(error);
    } finally {
      this.isLoading = false;
    }
  }
}
