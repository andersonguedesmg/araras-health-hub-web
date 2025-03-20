import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
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
import { Table, TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
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
import { Product } from '../../interfaces/product';
import { ProductService } from '../../services/product.service';
import { StatusOptions } from '../../../../shared/constants/status-options.constants';
import { ApiResponse } from '../../../../shared/interfaces/apiResponse';
import { ConfirmMessages, ToastMessages } from '../../../../shared/constants/messages.constants';
import { ToastSeverities, ToastSummaries } from '../../../../shared/constants/toast.constants';
import { HttpStatus } from '../../../../shared/enums/http-status.enum';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-product-list',
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
    Tag,
    DialogModule,
    SelectModule,
    ToastComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
  ],
  providers: [MessageService],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(SpinnerComponent) spinnerComponent!: SpinnerComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Administração' }, { label: 'Produtos' }];

  FormMode = FormMode;
  ConfirmMode = ConfirmMode;
  statusOptions = StatusOptions;

  products: Product[] = [];
  selectedProduct?: Product;
  productForm: FormGroup;
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

  constructor(private cd: ChangeDetectorRef, private productService: ProductService, private fb: FormBuilder) {
    this.productForm = this.fb.group({
      id: [{ value: null, disabled: true }],
      name: ['', Validators.required],
      description: ['', Validators.required],
      manufacturer: ['', Validators.required],
      measure: ['', Validators.required],
      category: ['', Validators.required],
      isActive: [{ value: false, disabled: true }],
    });
  }

  ngOnInit() {
    this.loadTableData();
  }

  ngAfterViewInit(): void {
    this.getAllProducts();
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  loadTableData() {
    this.cd.markForCheck();

    this.cols = [
      { field: 'id', header: 'ID', customExportHeader: 'CÓDIGO DO USUÁRIO' },
      { field: 'name', header: 'NOME' },
      { field: 'description', header: 'DESCRIÇÃO' },
      { field: 'manufacturer', header: 'FABRICANTE' },
      { field: 'measure', header: 'MEDIDA' },
      { field: 'category', header: 'TELEFONE' },
      { field: 'isActive', header: 'CATEGORIA' },
    ];

    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));

    this.selectedColumns = this.cols;
  }

  async getAllProducts(): Promise<void> {
    this.products = [];
    this.spinnerComponent.loading = true;

    try {
      const response: ApiResponse<Product[]> = await this.productService.getAllProducts();
      this.spinnerComponent.loading = false;
      console.log('getAllProducts', response);
      if (response.statusCode === HttpStatus.Ok) {
        this.products = response.data;
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

  openForm(mode: FormMode.Create | FormMode.Update | FormMode.Detail, product?: Product): void {
    this.formMode = mode;
    this.selectedProduct = product;
    this.displayDialog = true;
    this.initializeForm();
  }

  initializeForm(): void {
    this.productForm.reset();
    if (this.selectedProduct) {
      this.productForm.patchValue(this.selectedProduct);
    }
    this.updateFormState();
  }

  updateFormState(): void {
    const isDetail = this.formMode === FormMode.Detail;
    const isUpdate = this.formMode === FormMode.Update;

    this.productForm.get('name')?.disable();
    this.productForm.get('description')?.disable();
    this.productForm.get('manufacturer')?.disable();
    this.productForm.get('measure')?.disable();
    this.productForm.get('category')?.disable();
    this.productForm.get('isActive')?.disable();

    if (this.formMode === FormMode.Create) {
      this.productForm.get('isActive')?.setValue(true);
      this.productForm.get('isActive')?.disable();
      this.productForm.get('name')?.enable();
      this.productForm.get('description')?.enable();
      this.productForm.get('manufacturer')?.enable();
      this.productForm.get('measure')?.enable();
      this.productForm.get('category')?.enable();
    } else if (isUpdate) {
      this.productForm.get('name')?.enable();
      this.productForm.get('description')?.enable();
      this.productForm.get('manufacturer')?.enable();
      this.productForm.get('measure')?.enable();
      this.productForm.get('category')?.enable();
    }

    if (!isDetail && !isUpdate) {
      this.productForm.get('isActive')?.disable();
    }
    if (isDetail) {
      this.productForm.get('isActive')?.disable();
    }
  }

  hideDialog(): void {
    this.displayDialog = false;
    this.selectedProduct = undefined;
  }

  async saveProduct(): Promise<void> {
    this.formSubmitted = true;
    if (this.productForm.valid) {
      if (this.formMode === FormMode.Create) {
        this.confirmMessage = ConfirmMessages.CREATE_PRODUCT;
        this.confirmMode = ConfirmMode.Create;
      } else if (this.formMode === FormMode.Update) {
        this.confirmMessage = ConfirmMessages.UPDATE_PRODUCT;
        this.confirmMode = ConfirmMode.Update;
      }
      this.confirmDialog.message = this.confirmMessage;
      this.confirmDialog.show();

      try {
        await firstValueFrom(this.confirmDialog.confirmed);
        this.spinnerComponent.loading = true;
        const product: Product = this.productForm.getRawValue();
        let response: any = null;
        if (this.confirmMode === ConfirmMode.Create) {
          response = await this.productService.createProduct(product);
        } else if (this.confirmMode === ConfirmMode.Update) {
          response = await this.productService.updateProduct(product, product.id);
        }
        this.spinnerComponent.loading = false;
        if (response && (response.statusCode === HttpStatus.Ok || response.statusCode === HttpStatus.Created)) {
          this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, response.message);
          this.getAllProducts();
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

  async changeStatusProduct(productId: number, product: Product): Promise<void> {
    if (product.isActive) {
      this.confirmDialog.message = ConfirmMessages.DISABLE_PRODUCT;
    } else {
      this.confirmDialog.message = ConfirmMessages.ACTIVATE_PRODUCT;
    }
    this.confirmDialog.show();

    try {
      await firstValueFrom(this.confirmDialog.confirmed);
      this.spinnerComponent.loading = true;
      let changeProductIsActive = this.changeIsActive(product);

      const response: ApiResponse<Product> = await this.productService.changeStatusProduct(productId, changeProductIsActive);
      this.spinnerComponent.loading = false;

      if (response && response.statusCode === HttpStatus.Ok) {
        this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, response.message);
        this.getAllProducts();
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
      if (product.isActive) {
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

  async deleteProduct(productId: number): Promise<void> {
    this.confirmDialog.message = ConfirmMessages.DELETE_PRODUCT;
    this.confirmDialog.show();

    try {
      await firstValueFrom(this.confirmDialog.confirmed);
      this.spinnerComponent.loading = true;

      const response: ApiResponse<Product> = await this.productService.deleteProduct(productId);
      this.spinnerComponent.loading = false;

      if (response && response.statusCode === HttpStatus.Ok) {
        this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, response.message);
        this.getAllProducts();
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
