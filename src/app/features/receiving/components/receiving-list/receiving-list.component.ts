import { Component, OnDestroy, OnInit } from '@angular/core';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem, MessageService } from 'primeng/api';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
import { ReceivingService } from '../../services/receiving.service';
import { Receiving } from '../../interfaces/receiving';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { TableHeaderComponent } from '../../../../shared/components/table-header/table-header.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { SelectOptions } from '../../../../shared/interfaces/select-options';
import { DropdownDataService } from '../../../../shared/services/dropdown-data.service';
import { BaseComponent } from '../../../../core/components/base/base.component';
import { TableModule } from 'primeng/table';

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
    TableModule,
    BreadcrumbComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
    TableComponent,
    DialogComponent,
    TableHeaderComponent,
  ],
  providers: [MessageService, DatePipe, CurrencyPipe],
  templateUrl: './receiving-list.component.html',
  styleUrl: './receiving-list.component.scss'
})
export class ReceivingListComponent extends BaseComponent implements OnInit, OnDestroy {
  FormMode = FormMode;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Almoxarifado' }, { label: 'Entradas' }, { label: 'Histórico' }];
  title: string = 'Histórico de Entradas';

  receivings$!: Observable<Receiving[]>;
  selectedReceiving?: Receiving;
  receivingForm: FormGroup;
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
    private receivingService: ReceivingService,
    private dropdownDataService: DropdownDataService,
    private fb: FormBuilder,
    private router: Router,
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe,
  ) {
    super();
    this.receivingForm = this.fb.group({
      id: [{ value: null, disabled: true }],
      supplierId: [{ value: null, disabled: true }],
      supplyAuthorization: [{ value: '', disabled: true }],
      receivingDate: [{ value: '', disabled: true }],
      invoiceNumber: [{ value: '', disabled: true }],
      totalValue: [{ value: '', disabled: true }],
      responsibleId: [{ value: null, disabled: true }],
      observation: [{ value: '', disabled: true }],
    });
  }

  ngOnInit() {
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
            return this.receivingService.loadReceivings(pageNumber, pageSize, this.searchTerm);
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
        this.loadReceivings({ first: 0, rows: 5 });
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadReceivings(event: any) {
    this.loadLazy.next(event);
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  async exportReceivings(): Promise<void> {
    await this.exportData(
      (searchTerm) => this.receivingService.exportReceivings(searchTerm),
      'entradas.csv',
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

  openForm(receiving?: Receiving): void {
    this.receivingForm.reset();
    this.selectedReceiving = receiving;
    this.displayDialog = true;
    this.initializeForm();
    this.headerText = 'Detalhes da Entrada';
  }

  initializeForm(): void {
    this.receivingForm.reset();
    if (this.selectedReceiving) {
      const formattedReceiving: any = { ...this.selectedReceiving };
      if (this.formMode === FormMode.Detail) {
        formattedReceiving.receivingDate = this.datePipe.transform(
          this.selectedReceiving.receivingDate,
          'dd/MM/yyyy HH:mm:ss'
        );

        formattedReceiving.totalValue = this.currencyPipe.transform(
          this.selectedReceiving.totalValue,
          'BRL',
          'symbol',
          '1.2-2'
        );
      }
      this.receivingForm.patchValue(formattedReceiving);
    }
  }

  hideDialog(): void {
    this.displayDialog = false;
    this.selectedReceiving = undefined;
    this.receivingForm.reset();
  }

  navigateToCreateReceiving(): void {
    this.router.navigate(['/almoxarifado/movimentacoes/entradas/nova']);
  }
}
