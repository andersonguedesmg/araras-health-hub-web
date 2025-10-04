import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Table } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';
import { Column, ExportColumn } from '../../../../shared/utils/p-table.utils';
import { StockMovementService } from '../../services/stock-movement.service';
import { debounceTime, Observable, Subject, Subscription, switchMap } from 'rxjs';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { TagModule } from 'primeng/tag';
import { TableHeaderComponent } from '../../../../shared/components/table-header/table-header.component';
import { StockMovement } from '../../interfaces/stock-movement';
import { StockMovementTypePipe } from "../../../../shared/pipe/stock-movement-type.pipe";
import { BaseComponent } from '../../../../core/components/base/base.component';
import { FormHelperService } from '../../../../core/services/form-helper.service';

@Component({
  selector: 'app-stock-movement',
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
    ToastComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
    TableComponent,
    TableHeaderComponent,
    StockMovementTypePipe
  ],
  templateUrl: './stock-movement.component.html',
  styleUrl: './stock-movement.component.scss'
})
export class StockMovementComponent extends BaseComponent implements OnInit, OnDestroy {
  itemsBreadcrumb: MenuItem[] = [{ label: 'Almoxarifado' }, { label: 'Movimentações' }, { label: 'Histórico' }];
  title: string = 'Histórico de Movimentações';

  stockMovements$!: Observable<StockMovement[]>;
  selectedStock?: StockMovement;

  cols!: Column[];
  selectedColumns!: Column[];
  exportColumns!: ExportColumn[];

  private loadLazy = new Subject<any>();
  private subscriptions: Subscription = new Subscription();
  totalRecords = 0;

  constructor(
    private cd: ChangeDetectorRef,
    private stockMovementService: StockMovementService,
    private formHelperService: FormHelperService,
  ) {
    super();
  }

  ngOnInit() {
    this.loadTableData();
    this.stockMovements$ = this.stockMovementService.stockMovements$;
    this.subscriptions.add(
      this.loadLazy
        .pipe(
          debounceTime(300),
          switchMap(event => {
            this.isLoading = true;
            const pageNumber = event.first / event.rows + 1;
            const pageSize = event.rows;
            return this.stockMovementService.loadStockMovements(pageNumber, pageSize);
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
      { field: 'productName', header: 'PRODUTO', customExportHeader: 'PRODUTO' },
      { field: 'product.description', header: 'DESCRIÇÃO' },
      { field: 'product.dosageForm', header: 'UNIDADE DE MEDIDA' },
      { field: 'roduct.category', header: 'CATEGORIA' },
      { field: 'currentQuantity', header: 'QUANTIDADE ATUAL' },
      { field: 'minQuantity', header: 'QUANTIDADE MÍNIMA' },
    ];
    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    this.selectedColumns = this.cols;
  }

  loadStocks(event: any) {
    this.loadLazy.next(event);
  }

  exportCSV(dt: Table) {
    dt.exportCSV();
  }
}
