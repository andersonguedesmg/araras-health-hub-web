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
import { Product } from '../../interfaces/product';
import { ProductService } from '../../services/product.service';
import { ProductDrawerFormComponent } from '../product-drawer-form/product-drawer-form.component';
import { ProductTableComponent } from '../product-table/product-table.component';

@Component({
  selector: 'app-product-container',
  standalone: true,
  imports: [
    ProductTableComponent,
    ProductDrawerFormComponent,
    BreadcrumbComponent,
    PageHeaderComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './product-container.component.html',
  styleUrl: './product-container.component.scss',
})
export class ProductContainerComponent {
  private readonly productService = inject(ProductService);
  private readonly toastService = inject(ToastService);

  private readonly confirmDialog =
    viewChild<ConfirmDialogComponent>('confirmDialog');

  protected readonly FormMode = FormMode;
  protected readonly title = 'Itens';
  protected readonly description =
    'Cadastro e controle do catálogo de suprimentos da rede municipal de saúde.';

  protected readonly itemsBreadcrumb = signal([
    { label: 'Administração', routerLink: '/administracao' },
    { label: 'Itens', routerLink: '/administracao/suprimentos/itens' },
  ]);

  protected selectedProduct?: Product;
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

  private readonly productsResource = rxResource({
    request: () => this.queryParams(),
    loader: ({ request }) => {
      return this.productService.loadProducts(
        request.page,
        request.rows,
        request.searchTerm,
      );
    },
  });

  protected readonly products = computed(
    () => this.productsResource.value()?.data ?? [],
  );
  protected readonly totalRecords = computed(
    () => this.productsResource.value()?.totalCount ?? 0,
  );

  private readonly isActionLoading = signal<boolean>(false);
  protected readonly isLoading = computed(
    () => this.productsResource.isLoading() || this.isActionLoading(),
  );

  protected loadProducts(event: TableLazyLoadEvent): void {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 5);
  }

  protected onSearch(value: string): void {
    this.searchTerm.set(value);
    this.first.set(0);
  }

  protected openForm(mode: FormMode, product?: Product): void {
    this.formMode = mode;
    this.selectedProduct = product;
    this.displayDrawer = true;
  }

  protected generatePdfReport(): void {
    this.toastService.showInfo(
      'A exportação para PDF está em desenvolvimento e estará disponível em breve!',
    );
  }

  protected async saveProduct(formValue: Product): Promise<void> {
    this.isActionLoading.set(true);
    const operation$ =
      this.formMode === FormMode.Create
        ? this.productService.createProduct(formValue)
        : this.productService.updateProduct(formValue, formValue.id);

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

  protected async changeStatusProduct(product: Product): Promise<void> {
    const dialog = this.confirmDialog();
    if (!dialog) return;

    const isActivating = !product.isActive;
    const actionText = product.isActive ? 'desativar' : 'ativar';
    const msg = `Deseja realmente ${actionText} o produto "${product.name}"?`;
    const title = product.isActive
      ? 'Confirmar Desativação'
      : 'Confirmar Ativação';

    const confirmed = await firstValueFrom(dialog.show(msg, title));
    if (!confirmed) return;

    this.isActionLoading.set(true);
    const alteredProduct = { ...product, isActive: isActivating };

    try {
      await firstValueFrom(
        this.productService.changeStatusProduct(product.id, alteredProduct),
      );

      const successMessage = `Produto ${isActivating ? 'ativado' : 'desativado'} com sucesso!`;
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
