import { Component, OnDestroy, OnInit } from '@angular/core';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem, MessageService } from 'primeng/api';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder } from '@angular/forms';
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
import { debounceTime, Observable, Subject, Subscription, switchMap } from 'rxjs';
import { StockMovementService } from '../../services/stock-movement.service';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { TableHeaderComponent } from '../../../../shared/components/table-header/table-header.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { SelectOptions } from '../../../../shared/interfaces/select-options';
import { DropdownDataService } from '../../../../shared/services/dropdown-data.service';
import { BaseComponent } from '../../../../core/components/base/base.component';
import { StockAdjustment } from '../../interfaces/stock-adjustment';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-stock-adjustment',
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
    TableModule,
    BreadcrumbComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
    TableComponent,
    DialogComponent,
    TableHeaderComponent,
  ],
  providers: [MessageService, DatePipe],
  templateUrl: './stock-adjustment.component.html',
  styleUrl: './stock-adjustment.component.scss'
})
export class StockAdjustmentComponent extends BaseComponent implements OnInit, OnDestroy {
  FormMode = FormMode;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Almoxarifado' }, { label: 'Movimentações' }, { label: 'Ajustes' }];
  title: string = 'Histórico de Ajustes Manuais';

  stockAdjustments$!: Observable<StockAdjustment[]>;
  selectedAdjustments?: StockAdjustment;
  adjustmentForm: FormGroup;
  formMode: FormMode.Detail = FormMode.Detail;

  supplierOptions: SelectOptions<number>[] = [];
  employeeOptions: SelectOptions<number>[] = [];

  displayDialog = false;
  confirmMessage = '';
  headerText = '';

  private searchTerm: string = '';
  private searchSubject = new Subject<string>();

  private loadLazy = new Subject<any>();
  private subscriptions: Subscription = new Subscription();
  totalRecords = 0;

  constructor(
    private stockMovementService: StockMovementService,
    private dropdownDataService: DropdownDataService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
  ) {
    super();
    this.adjustmentForm = this.fb.group({
      id: [{ value: null, disabled: true }],
      type: [{ value: null, disabled: true }],
      adjustmentDate: [{ value: '', disabled: true }],
      reason: [{ value: '', disabled: true }],
      responsibleName: [{ value: '', disabled: true }],
      observation: [{ value: '', disabled: true }],
    });
  }

  ngOnInit() {
    this.loadSuppliersOptions();
    this.loadEmployeesOptions();
    this.stockAdjustments$ = this.stockMovementService.stockAdjustments$;
    this.subscriptions.add(
      this.loadLazy
        .pipe(
          debounceTime(300),
          switchMap(event => {
            this.isLoading = true;
            const pageNumber = event.first / event.rows + 1;
            const pageSize = event.rows;
            return this.stockMovementService.loadStockAdjustments(pageNumber, pageSize, this.searchTerm);
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
        this.loadStockAdjustments({ first: 0, rows: 5 });
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadStockAdjustments(event: any) {
    this.loadLazy.next(event);
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  async exportAdjustments(): Promise<void> {
    await this.exportData(
      (searchTerm) => this.stockMovementService.exportAdjustments(searchTerm),
      'ajustes-manuais.csv',
      this.searchTerm
    );
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

  openForm(adjustment?: StockAdjustment): void {
    this.adjustmentForm.reset();
    this.selectedAdjustments = adjustment;
    this.displayDialog = true;
    this.initializeForm();
    this.headerText = 'Detalhes do Ajuste Manual';
  }

  initializeForm(): void {
    this.adjustmentForm.reset();
    if (this.selectedAdjustments) {
      const formattedAdjustment: any = { ...this.selectedAdjustments };
      if (this.formMode === FormMode.Detail) {
        formattedAdjustment.adjustmentDate = this.datePipe.transform(
          this.selectedAdjustments.adjustmentDate,
          'dd/MM/yyyy HH:mm:ss'
        );
      }
      this.adjustmentForm.patchValue(formattedAdjustment);
    }
  }

  hideDialog(): void {
    this.displayDialog = false;
    this.selectedAdjustments = undefined;
    this.adjustmentForm.reset();
  }
}
