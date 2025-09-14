import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { ToastComponent } from '../../../../shared/components/toast/toast.component';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ConfirmMode } from '../../../../shared/enums/confirm-mode.enum';
import { Column, ExportColumn } from '../../../../shared/utils/p-table.utils';
import { getSeverity, getStatus } from '../../../../shared/utils/status.utils';
import { StatusOptions } from '../../../../shared/constants/status-options.constants';
import { ApiResponse } from '../../../../shared/interfaces/api-response';
import { ToastMessages } from '../../../../shared/constants/messages.constants';
import { ToastSeverities, ToastSummaries } from '../../../../shared/constants/toast.constants';
import { HttpStatus } from '../../../../shared/enums/http-status.enum';
import { debounceTime, Observable, Subject, Subscription, switchMap } from 'rxjs';
import { ShippingService } from '../../services/shipping.service';
import { Shipping } from '../../interfaces/shipping';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { TableHeaderComponent } from '../../../../shared/components/table-header/table-header.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { SelectOptions } from '../../../../shared/interfaces/select-options';
import { DropdownDataService } from '../../../../shared/services/dropdown-data.service';

@Component({
  selector: 'app-shipping-list',
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
    ToastComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
    TableComponent,
    DialogComponent,
    TableHeaderComponent,
  ],
  providers: [MessageService],
  templateUrl: './shipping-list.component.html',
  styleUrl: './shipping-list.component.scss'
})
export class ShippingListComponent implements OnInit, OnDestroy {
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  isLoading = false;

  FormMode = FormMode;
  ConfirmMode = ConfirmMode;
  statusOptions = StatusOptions;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Almoxarifado' }, { label: 'Saídas' }, { label: 'Histórico' }];
  title: string = 'Histórico de Saídas';

  shippings$!: Observable<Shipping[]>;
  selectedShipping?: Shipping;
  shippingForm: FormGroup;
  formMode: FormMode.Create | FormMode.Update | FormMode.Detail = FormMode.Create;

  supplierOptions: SelectOptions<number>[] = [];
  employeeOptions: SelectOptions<number>[] = [];

  displayDialog = false;
  formSubmitted = false;

  confirmMode: ConfirmMode.Create | ConfirmMode.Update | null = null;
  confirmMessage = '';
  headerText = '';

  cols!: Column[];
  selectedColumns!: Column[];
  exportColumns!: ExportColumn[];

  getSeverity = getSeverity;
  getStatus = getStatus;

  private loadLazy = new Subject<any>();
  private subscriptions: Subscription = new Subscription();
  totalRecords = 0;

  constructor(
    private cd: ChangeDetectorRef,
    private shippingService: ShippingService,
    private dropdownDataService: DropdownDataService,
    private fb: FormBuilder,
  ) {
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
    this.loadTableData();
    this.loadSuppliersOptions();
    this.loadEmployeesOptions();
    this.shippings$ = this.shippingService.shippings$;
    this.subscriptions.add(
      this.loadLazy
        .pipe(
          debounceTime(300),
          switchMap(event => {
            this.isLoading = true;
            const pageNumber = event.first / event.rows + 1;
            const pageSize = event.rows;
            return this.shippingService.loadShippings(pageNumber, pageSize);
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

  loadTableData() {
    this.cd.markForCheck();
    this.cols = [
      { field: 'id', header: 'ID', customExportHeader: 'CÓDIGO DA ENTRADA' },
      { field: 'invoiceNumber', header: 'NOTA FISCAL' },
      { field: 'supplyAuthorization', header: 'AUTORIZAÇÃO DE FORNECIMENTO' },
      { field: 'supplierId', header: 'FORNECEDOR' },
      { field: 'receivingDate', header: 'DATA' },
      { field: 'totalValue', header: 'VALOR DA NOTA' },
      { field: 'responsibleId', header: 'RESPONSÁVEL' },
      { field: 'observation', header: 'OBSERVAÇÃO' },
    ];
    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    this.selectedColumns = this.cols;
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

  openForm(mode: FormMode.Create | FormMode.Update | FormMode.Detail, shipping?: Shipping): void {
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

  private handleApiResponse(response: ApiResponse<any>, successMessage: string) {
    if (response.success) {
      this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, response.message || successMessage);
    } else {
      this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, response.message || ToastMessages.UNEXPECTED_ERROR);
    }
  }

  private handleApiError(error: any) {
    if (error.error && error.error.statusCode === HttpStatus.NotFound) {
      this.toastComponent.showMessage(ToastSeverities.INFO, ToastSummaries.INFO, error.error.message);
    } else if (error.error && error.error.message) {
      this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, error.error.message);
    } else {
      this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, ToastMessages.UNEXPECTED_ERROR);
    }
  }

  changeIsActive(objeto: any) {
    if (objeto && typeof objeto === 'object' && 'isActive' in objeto) {
      objeto.isActive = !objeto.isActive;
    }
    return objeto;
  }

  exportCSV(dt: Table) {
    dt.exportCSV();
  }

}
