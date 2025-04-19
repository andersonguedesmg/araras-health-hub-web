import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';
import { Column, ExportColumn } from '../../../../shared/utils/p-table.utils';
import { ApiResponse } from '../../../../shared/interfaces/apiResponse';
import { ToastMessages } from '../../../../shared/constants/messages.constants';
import { ToastSeverities, ToastSummaries } from '../../../../shared/constants/toast.constants';
import { HttpStatus } from '../../../../shared/enums/http-status.enum';
import { StockService } from '../../services/stock.service';
import { Stock } from '../../interfaces/stock';

@Component({
  selector: 'app-stock-list',
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
    DialogModule,
    SelectModule,
    ToastComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
  ],
  providers: [MessageService],
  templateUrl: './stock-list.component.html',
  styleUrl: './stock-list.component.scss'
})
export class StockListComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(SpinnerComponent) spinnerComponent!: SpinnerComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Almoxarifado' }, { label: 'Estoque' }];

  stocks: Stock[] = [];

  cols!: Column[];
  selectedColumns!: Column[];
  exportColumns!: ExportColumn[];

  constructor(private cd: ChangeDetectorRef, private stockService: StockService, private fb: FormBuilder) { }

  ngOnInit() {
    this.loadTableData();
  }

  ngAfterViewInit(): void {
    this.getStock();
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  loadTableData() {
    this.cd.markForCheck();

    this.cols = [
      { field: 'product.name', header: 'ID', customExportHeader: 'PRODUTO' },
      { field: 'total', header: 'TOTAL' },
      { field: 'quantity', header: 'QUANTIDADE' },
      { field: 'product.dosageForm', header: 'UNIDADE DE MEDIDA' },
      { field: 'batch', header: 'LOTE' },
      { field: 'product.description', header: 'DESCRIÇÃO' },
    ];

    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));

    this.selectedColumns = this.cols;
  }

  getTotalQuantity(productName: string): number {
    return this.stocks
      .filter((s) => s.product.name === productName)
      .reduce((total, item) => total + item.quantity, 0);
  }

  async getStock(): Promise<void> {
    this.stocks = [];
    this.spinnerComponent.loading = true;

    try {
      const response: ApiResponse<Stock[]> = await this.stockService.getStock();
      this.spinnerComponent.loading = false;
      console.log('getStock', response);
      if (response.statusCode === HttpStatus.Ok) {
        this.stocks = response.data;
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
}
