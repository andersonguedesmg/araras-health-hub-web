import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { Table } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ApiResponse } from '../../../../shared/interfaces/apiResponse';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { getSeverity, getStatus } from '../../../../shared/utils/status.utils';
import { Column, ExportColumn } from '../../../../shared/utils/p-table.utils';
import { ToastMessages } from '../../../../shared/constants/messages.constants';
import { ToastSeverities, ToastSummaries } from '../../../../shared/constants/toast.constants';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ConfirmMode } from '../../../../shared/enums/confirm-mode.enum';
import { HttpStatus } from '../../../../shared/enums/http-status.enum';
import { StatusOptions } from '../../../../shared/constants/status-options.constants';
import { ReceivingService } from '../../services/receiving.service';
import { Receiving } from '../../interfaces/receiving';
import { SelectOptions } from '../../../../shared/interfaces/select-options';
import { DropdownDataService } from '../../../../shared/services/dropdown-data.service';

@Component({
  selector: 'app-receiving-list',
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
    TextareaModule,
    TooltipModule,
    DialogModule,
    SelectModule,
    ToastComponent,
    SpinnerComponent,
    ConfirmDialogComponent
  ],
  providers: [MessageService],
  templateUrl: './receiving-list.component.html',
  styleUrl: './receiving-list.component.scss'
})
export class ReceivingListComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(SpinnerComponent) spinnerComponent!: SpinnerComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Almoxarifado' }, { label: 'Entradas' }];

  FormMode = FormMode;
  ConfirmMode = ConfirmMode;
  statusOptions = StatusOptions;
  supplierOptions: SelectOptions<number>[] = [];
  employeeOptions: SelectOptions<number>[] = [];

  receivings: Receiving[] = [];
  selectedReceiving?: Receiving;
  receivingForm: FormGroup;
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

  constructor(
    private cd: ChangeDetectorRef,
    private receivingService: ReceivingService,
    private dropdownDataService: DropdownDataService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.receivingForm = this.fb.group({
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

  async ngOnInit(): Promise<void> {
    this.loadTableData();
    this.employeeOptions = await this.dropdownDataService.getEmployeeOptions();
    this.supplierOptions = await this.dropdownDataService.getSupplierOptions();
  }

  ngAfterViewInit(): void {
    this.getAllReceivings();
  }

  exportCSV() {
    this.dt.exportCSV();
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

  async getAllReceivings(): Promise<void> {
    this.receivings = [];
    this.spinnerComponent.loading = true;

    try {
      const response: ApiResponse<Receiving[]> = await this.receivingService.getAllReceivings();
      this.spinnerComponent.loading = false;
      console.log('getAllReceivings', response);

      if (response.statusCode === HttpStatus.Ok) {
        this.receivings = response.data;
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

  openForm(mode: FormMode.Create | FormMode.Update | FormMode.Detail, receiving?: Receiving): void {
    this.formMode = mode;
    this.selectedReceiving = receiving;
    this.displayDialog = true;
    this.initializeForm();
  }

  initializeForm(): void {
    this.receivingForm.reset();
    if (this.selectedReceiving) {
      this.receivingForm.patchValue(this.selectedReceiving);
    }
    this.updateFormState();
  }

  updateFormState(): void {
    this.receivingForm.get('supplierId')?.disable();
    this.receivingForm.get('receivingDate')?.disable();
    this.receivingForm.get('invoiceNumber')?.disable();
    this.receivingForm.get('totalValue')?.disable();
    this.receivingForm.get('supplyAuthorization')?.disable();
    this.receivingForm.get('responsibleId')?.disable();
    this.receivingForm.get('observation')?.disable();
  }

  hideDialog(): void {
    this.displayDialog = false;
    this.selectedReceiving = undefined;
  }

  navigateToCreateReceiving(): void {
    this.router.navigate(['/entrada/nova']);
  }
}
