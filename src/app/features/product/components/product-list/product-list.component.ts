import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ConfirmMode } from '../../../../shared/enums/confirm-mode.enum';
import { getSeverity, getStatus } from '../../../../shared/utils/status.utils';
import { Product } from '../../interfaces/product';
import { ProductService } from '../../services/product.service';
import { StatusOptions } from '../../../../shared/constants/status-options.constants';
import { ConfirmMessages, ToastMessages } from '../../../../shared/constants/messages.constants';
import { debounceTime, firstValueFrom, Observable, Subject, Subscription, switchMap } from 'rxjs';
import { HasRoleDirective } from '../../../../core/directives/has-role.directive';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { TableHeaderComponent } from '../../../../shared/components/table-header/table-header.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { BaseComponent } from '../../../../core/components/base/base.component';
import { FormHelperService } from '../../../../core/services/form-helper.service';

@Component({
  selector: 'app-product-list',
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
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent extends BaseComponent implements OnInit, OnDestroy {
  itemsBreadcrumb: MenuItem[] = [{ label: 'Administração' }, { label: 'Produtos' }];
  title: string = 'Produtos';

  FormMode = FormMode;
  ConfirmMode = ConfirmMode;
  statusOptions = StatusOptions;

  products$!: Observable<Product[]>;
  selectedProduct?: Product;
  productForm: FormGroup;
  formMode: FormMode.Create | FormMode.Update | FormMode.Detail = FormMode.Create;

  displayDialog = false;
  formSubmitted = false;

  confirmMode: ConfirmMode.Create | ConfirmMode.Update | null = null;
  confirmMessage = '';
  headerText = '';

  private formLabels: { [key: string]: string; } = {
    name: 'Nome do Produto',
    description: 'Descrição',
    mainCategory: 'Categoria Principal',
    subCategory: 'Subcategoria',
    presentationForm: 'Forma de Apresentação',
  };

  getSeverity = getSeverity;
  getStatus = getStatus;

  private searchTerm: string = '';
  private searchSubject = new Subject<string>();

  private loadLazy = new Subject<any>();
  private subscriptions: Subscription = new Subscription();
  totalRecords = 0;

  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
    private formHelperService: FormHelperService,
  ) {
    super();
    this.productForm = this.fb.group({
      id: [{ value: null, disabled: true }],
      name: ['', Validators.required],
      description: ['', Validators.required],
      mainCategory: ['', Validators.required],
      subCategory: ['', Validators.required],
      presentationForm: ['', Validators.required],
      isActive: [{ value: false, disabled: true }],
    });
  }

  ngOnInit() {
    this.products$ = this.productService.products$;
    this.subscriptions.add(
      this.loadLazy
        .pipe(
          debounceTime(300),
          switchMap(event => {
            this.isLoading = true;
            const pageNumber = event.first / event.rows + 1;
            const pageSize = event.rows;
            return this.productService.loadProducts(pageNumber, pageSize, this.searchTerm);
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
        this.loadProducts({ first: 0, rows: 5 });
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadProducts(event: any) {
    this.loadLazy.next(event);
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  async exportProducts(): Promise<void> {
    await this.exportData(
      (searchTerm) => this.productService.exportProducts(searchTerm),
      'produtos.csv',
      this.searchTerm
    );
  }

  openForm(mode: FormMode.Create | FormMode.Update | FormMode.Detail, product?: Product): void {
    this.productForm.reset();
    this.formSubmitted = false; this.formMode = mode;
    this.selectedProduct = product;
    this.displayDialog = true;
    this.initializeForm();
    if (mode === FormMode.Create) {
      this.headerText = 'Novo Produto';
    } else if (mode === FormMode.Update) {
      this.headerText = 'Editar Produto';
    } else {
      this.headerText = 'Detalhes do Produto';
    }
  }

  initializeForm(): void {
    this.productForm.reset();
    if (this.selectedProduct) {
      this.productForm.patchValue(this.selectedProduct);
    }
    this.updateFormState();
  }

  updateFormState(): void {
    this.productForm.disable();

    const isCreate = this.formMode === FormMode.Create;
    const isUpdate = this.formMode === FormMode.Update;

    if (isCreate || isUpdate) {
      this.productForm.get('name')?.enable();
      this.productForm.get('description')?.enable();
      this.productForm.get('mainCategory')?.enable();
      this.productForm.get('subCategory')?.enable();
      this.productForm.get('presentationForm')?.enable();
    }

    if (isCreate) {
      this.productForm.get('isActive')?.setValue(true);
      this.productForm.get('isActive')?.disable();
    }
  }

  hideDialog(): void {
    this.displayDialog = false;
    this.selectedProduct = undefined;
  }

  async saveProduct(): Promise<void> {
    this.formSubmitted = true;
    if (this.validateForm()) {
      const confirmMsg = this.formMode === FormMode.Create ? ConfirmMessages.CREATE_PRODUCT : ConfirmMessages.UPDATE_PRODUCT;
      const product = this.productForm.getRawValue();
      const apiCall = this.formMode === FormMode.Create
        ? firstValueFrom(this.productService.createProduct(product))
        : firstValueFrom(this.productService.updateProduct(product, product.id));
      await this.handleApiCall(apiCall, confirmMsg, ToastMessages.SUCCESS_OPERATION);
      this.hideDialog();
    }
  }

  async changeStatusProduct(productId: number, product: Product): Promise<void> {
    const confirmMsg = product.isActive ? ConfirmMessages.DISABLE_PRODUCT : ConfirmMessages.ACTIVATE_PRODUCT;
    const changeProductIsActive = this.changeIsActive(product);
    const apiCall = firstValueFrom(this.productService.changeStatusProduct(productId, changeProductIsActive));
    await this.handleApiCall(apiCall, confirmMsg, ToastMessages.SUCCESS_OPERATION);
  }

  async deleteProduct(productId: number): Promise<void> {
    const apiCall = firstValueFrom(this.productService.deleteProduct(productId));
    await this.handleApiCall(apiCall, ConfirmMessages.DELETE_PRODUCT, ToastMessages.SUCCESS_OPERATION);
  }

  private validateForm(): boolean {
    return this.validateFormAndShowErrors(this.productForm, this.formHelperService, this.formLabels);
  }
}
