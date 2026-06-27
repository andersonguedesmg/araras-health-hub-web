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
import { Product } from '../../interfaces/product';
import { ProductService } from '../../services/product.service';
import { ProductDrawerFormComponent } from '../product-drawer-form/product-drawer-form.component';
import { ProductTableComponent } from '../product-table/product-table.component';

@Component({
  selector: 'app-product-container',
  standalone: true,
  imports: [
    CommonModule,
    ProductTableComponent,
    ProductDrawerFormComponent,
    BreadcrumbComponent,
    PageHeaderComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './product-container.component.html',
  styleUrl: './product-container.component.scss',
})
export class ProductContainerComponent implements OnInit, OnDestroy {
  private readonly productService = inject(ProductService);
  private readonly toastService = inject(ToastService);

  protected readonly products = this.productService.products;
  private readonly confirmDialog =
    viewChild<ConfirmDialogComponent>('confirmDialog');

  readonly FormMode = FormMode;
  readonly title = 'Produtos e Insumos';
  readonly description =
    'Cadastro e controle do catálogo de suprimentos da rede municipal de saúde.';

  readonly itemsBreadcrumb = [
    { label: 'Administração', routerLink: '/administracao' },
    { label: 'Produtos', routerLink: '/administracao/produtos' },
  ];

  selectedProduct?: Product;
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
            return this.productService.loadProducts(
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

  loadProducts(event: any): void {
    this.lastLazyEvent = event;
    this.loadLazy.next(event);
  }

  onSearch(value: string): void {
    this.searchTerm = value;
    this.loadProducts({ first: 0, rows: this.lastLazyEvent.rows });
  }

  openForm(mode: FormMode, product?: Product): void {
    this.formMode = mode;
    this.selectedProduct = product;
    this.displayDrawer = true;
  }

  generatePdfReport(): void {
    this.toastService.showInfo(
      'A exportação para PDF está em desenvolvimento e estará disponível em breve!',
    );
  }

  async saveProduct(formValue: Product): Promise<void> {
    this.isLoading = true;
    const operation$ =
      this.formMode === FormMode.Create
        ? this.productService.createProduct(formValue)
        : this.productService.updateProduct(formValue, formValue.id);

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

  async changeStatusProduct(product: Product): Promise<void> {
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

    this.isLoading = true;
    const alteredProduct = { ...product, isActive: isActivating };

    try {
      await firstValueFrom(
        this.productService.changeStatusProduct(product.id, alteredProduct),
      );

      const successMessage = `Produto ${isActivating ? 'ativado' : 'desativado'} com sucesso!`;
      this.toastService.showSuccess(successMessage);
      this.loadLazy.next(this.lastLazyEvent);
    } catch (error) {
      this.toastService.handleApiError(error);
    } finally {
      this.isLoading = false;
    }
  }
}
