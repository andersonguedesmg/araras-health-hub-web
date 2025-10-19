import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
import { Column } from '../../../../shared/utils/p-table.utils';
import { getSeverity, getStatus } from '../../../../shared/utils/status.utils';
import { StatusOptions } from '../../../../shared/constants/status-options.constants';
import { debounceTime, Observable, Subject, Subscription, switchMap } from 'rxjs';
import { ReceivingService } from '../../services/receiving.service';
import { Receiving } from '../../interfaces/receiving';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { TableHeaderComponent } from '../../../../shared/components/table-header/table-header.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { SelectOptions } from '../../../../shared/interfaces/select-options';
import { DropdownDataService } from '../../../../shared/services/dropdown-data.service';
import { BaseComponent } from '../../../../core/components/base/base.component';
import { FormHelperService } from '../../../../core/services/form-helper.service';

@Component({
  selector: 'app-receiving-list',
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
  ],
  providers: [MessageService],
  templateUrl: './receiving-list.component.html',
  styleUrl: './receiving-list.component.scss'
})
export class ReceivingListComponent extends BaseComponent implements OnInit, OnDestroy {
  FormMode = FormMode;
  ConfirmMode = ConfirmMode;
  statusOptions = StatusOptions;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Almoxarifado' }, { label: 'Entradas' }, { label: 'Histórico' }];
  title: string = 'Histórico de Entradas';

  receivings$!: Observable<Receiving[]>;
  selectedReceiving?: Receiving;
  receivingForm: FormGroup;
  formMode: FormMode.Create | FormMode.Update | FormMode.Detail = FormMode.Create;

  supplierOptions: SelectOptions<number>[] = [];
  employeeOptions: SelectOptions<number>[] = [];

  displayDialog = false;
  formSubmitted = false;

  confirmMode: ConfirmMode.Create | ConfirmMode.Update | null = null;
  confirmMessage = '';
  headerText = '';

  cols!: Column[];

  getSeverity = getSeverity;
  getStatus = getStatus;

  private loadLazy = new Subject<any>();
  private subscriptions: Subscription = new Subscription();
  totalRecords = 0;

  constructor(
    private cd: ChangeDetectorRef,
    private receivingService: ReceivingService,
    private dropdownDataService: DropdownDataService,
    private fb: FormBuilder,
    private router: Router,
    private formHelperService: FormHelperService,
  ) {
    super();
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

  ngOnInit() {
    this.loadTableData();
    this.loadSuppliersOptions();
    this.loadEmployeesOptions();
    this.receivings$ = this.receivingService.receivings$;
    this.subscriptions.add(
      this.loadLazy
        .pipe(
          debounceTime(300),
          switchMap(event => {
            this.isLoading = true;
            const pageNumber = event.first / event.rows + 1;
            const pageSize = event.rows;
            return this.receivingService.loadReceivings(pageNumber, pageSize);
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
  }

  loadReceivings(event: any) {
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

  openForm(mode: FormMode.Create | FormMode.Update | FormMode.Detail, supplier?: Receiving): void {
    this.receivingForm.reset();
    this.formSubmitted = false; this.formMode = mode;
    this.selectedReceiving = supplier;
    this.displayDialog = true;
    this.initializeForm();
    if (mode === FormMode.Create) {
      this.headerText = 'Nova Entrada';
    } else if (mode === FormMode.Update) {
      this.headerText = 'Editar Entrada';
    } else {
      this.headerText = 'Detalhes da Entrada';
    }
  }

  initializeForm(): void {
    this.receivingForm.reset();
    if (this.selectedReceiving) {
      this.receivingForm.patchValue(this.selectedReceiving);
    }
    this.updateFormState();
  }

  updateFormState(): void {
    this.receivingForm.disable();
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

  exportCSV(dt: Table) {
    dt.exportCSV();
  }

}
