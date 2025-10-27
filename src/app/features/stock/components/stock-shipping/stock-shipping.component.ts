import { Component, OnDestroy, OnInit } from '@angular/core';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
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
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ConfirmMode } from '../../../../shared/enums/confirm-mode.enum';
import { getSeverity, getStatus } from '../../../../shared/utils/status.utils';
import { StatusOptions } from '../../../../shared/constants/status-options.constants';
import { debounceTime, Observable, Subject, Subscription, switchMap } from 'rxjs';
import { StockShipping } from '../../interfaces/stock-shipping';
import { StockMovementService } from '../../services/stock-movement.service';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { TableHeaderComponent } from '../../../../shared/components/table-header/table-header.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { SelectOptions } from '../../../../shared/interfaces/select-options';
import { DropdownDataService } from '../../../../shared/services/dropdown-data.service';
import { BaseComponent } from '../../../../core/components/base/base.component';

@Component({
  selector: 'app-stock-shipping',
  imports: [
    CommonModule,
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
  ],
  providers: [MessageService],
  templateUrl: './stock-shipping.component.html',
  styleUrl: './stock-shipping.component.scss'
})
export class StockShippingComponent extends BaseComponent implements OnInit, OnDestroy {
  FormMode = FormMode;
  ConfirmMode = ConfirmMode;
  statusOptions = StatusOptions;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Almoxarifado' }, { label: 'Saídas' }, { label: 'Histórico' }];
  title: string = 'Histórico de Saídas';

  stockShippings$!: Observable<StockShipping[]>;
  selectedShipping?: StockShipping;
  shippingForm: FormGroup;
  formMode: FormMode.Create | FormMode.Update | FormMode.Detail = FormMode.Create;

  supplierOptions: SelectOptions<number>[] = [];
  employeeOptions: SelectOptions<number>[] = [];

  displayDialog = false;
  formSubmitted = false;

  confirmMode: ConfirmMode.Create | ConfirmMode.Update | null = null;
  confirmMessage = '';
  headerText = '';

  getSeverity = getSeverity;
  getStatus = getStatus;

  private loadLazy = new Subject<any>();
  private subscriptions: Subscription = new Subscription();
  totalRecords = 0;

  constructor(
    private stockMovementService: StockMovementService,
    private dropdownDataService: DropdownDataService,
    private fb: FormBuilder,
  ) {
    super();
    this.shippingForm = this.fb.group({
      id: [{ value: null, disabled: true }],
      supplierId: ['', Validators.required],
      supplyAuthorization: ['', Validators.required],
      receivingDate: ['', Validators.required],
      invoiceNumber: ['', Validators.required],
      totalValue: ['', Validators.required],
      responsibleId: ['', Validators.required],
      observation: [''],
    });
  }

  ngOnInit() {
    this.loadSuppliersOptions();
    this.loadEmployeesOptions();
    this.stockShippings$ = this.stockMovementService.stockShippings$;
    this.subscriptions.add(
      this.loadLazy
        .pipe(
          debounceTime(300),
          switchMap(event => {
            this.isLoading = true;
            const pageNumber = event.first / event.rows + 1;
            const pageSize = event.rows;
            return this.stockMovementService.loadStockShippings(pageNumber, pageSize);
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

  loadShippings(event: any) {
    this.loadLazy.next(event);
  }

  async loadSuppliersOptions(): Promise<void> {
    try {
      this.supplierOptions = await this.dropdownDataService.getSupplierOptions();
    } catch (error: any) {
      if (error.message !== 'cancel') {
        this.handleApiError(error);
      }
    }
  }

  async loadEmployeesOptions(): Promise<void> {
    try {
      this.employeeOptions = await this.dropdownDataService.getEmployeeOptions();
    } catch (error: any) {
      if (error.message !== 'cancel') {
        this.handleApiError(error);
      }
    }
  }

  openForm(mode: FormMode.Create | FormMode.Update | FormMode.Detail, shipping?: StockShipping): void {
    this.shippingForm.reset();
    this.formSubmitted = false; this.formMode = mode;
    this.selectedShipping = shipping;
    this.displayDialog = true;
    this.initializeForm();
    if (mode === FormMode.Create) {
      this.headerText = 'Nova Saída';
    } else if (mode === FormMode.Update) {
      this.headerText = 'Editar Saída';
    } else {
      this.headerText = 'Detalhes da Saída';
    }
  }

  initializeForm(): void {
    this.shippingForm.reset();
    if (this.selectedShipping) {
      this.shippingForm.patchValue(this.selectedShipping);
    }
    this.updateFormState();
  }

  updateFormState(): void {
    this.shippingForm.disable();
    this.shippingForm.get('supplierId')?.disable();
    this.shippingForm.get('receivingDate')?.disable();
    this.shippingForm.get('invoiceNumber')?.disable();
    this.shippingForm.get('totalValue')?.disable();
    this.shippingForm.get('supplyAuthorization')?.disable();
    this.shippingForm.get('responsibleId')?.disable();
    this.shippingForm.get('observation')?.disable();
  }

  hideDialog(): void {
    this.displayDialog = false;
    this.selectedShipping = undefined;
  }

  exportCSV(dt: Table) {
    dt.exportCSV();
  }
}
