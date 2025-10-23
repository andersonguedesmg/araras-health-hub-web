import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
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
import { Table } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { Column } from '../../../../shared/utils/p-table.utils';
import { StockService } from '../../services/stock.service';
import { Stock } from '../../interfaces/stock';
import { debounceTime, firstValueFrom, Observable, Subject, Subscription, switchMap } from 'rxjs';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { TagModule } from 'primeng/tag';
import { TableHeaderComponent } from '../../../../shared/components/table-header/table-header.component';
import { BaseComponent } from '../../../../core/components/base/base.component';
import { FormHelperService } from '../../../../core/services/form-helper.service';
import { ToastMessages } from '../../../../shared/constants/messages.constants';

@Component({
  selector: 'app-stock-list',
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
    TableHeaderComponent,
  ],
  providers: [MessageService],
  templateUrl: './stock-list.component.html',
  styleUrl: './stock-list.component.scss'
})
export class StockListComponent extends BaseComponent implements OnInit, OnDestroy {
  itemsBreadcrumb: MenuItem[] = [{ label: 'Almoxarifado' }, { label: 'Estoque' }, { label: 'Geral' }];
  title: string = 'Estoque Geral';

  stocks$!: Observable<Stock[]>;
  selectedStock?: Stock;

  cols!: Column[];

  private searchTerm: string = '';
  private searchSubject = new Subject<string>();

  private loadLazy = new Subject<any>();
  private subscriptions: Subscription = new Subscription();
  totalRecords = 0;

  constructor(
    private cd: ChangeDetectorRef,
    private stockService: StockService,
    private fb: FormBuilder,
    private formHelperService: FormHelperService,
  ) {
    super();
  }

  ngOnInit() {
    this.loadTableData();
    this.stocks$ = this.stockService.stocks$;
    this.subscriptions.add(
      this.loadLazy
        .pipe(
          debounceTime(300),
          switchMap(event => {
            this.isLoading = true;
            const pageNumber = event.first / event.rows + 1;
            const pageSize = event.rows;
            return this.stockService.loadStocks(pageNumber, pageSize, this.searchTerm);
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
        this.loadStocks({ first: 0, rows: 5 });
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadTableData() {
    this.cd.markForCheck();
    this.cols = [
      { field: 'product.name', header: 'PRODUTO', customExportHeader: 'PRODUTO' },
      { field: 'product.description', header: 'DESCRIÇÃO' },
      { field: 'product.mainCategory', header: 'CATEGORIA PRINCIPAL' },
      { field: 'product.subCategory', header: 'SUBCATEGORIA' },
      { field: 'product.presentationForm', header: 'FORMA DE APRESENTAÇÃO' },
      { field: 'currentQuantity', header: 'QUANTIDADE ATUAL' },
      { field: 'minQuantity', header: 'QUANTIDADE MÍNIMA' },
    ];
  }

  loadStocks(event: any) {
    this.loadLazy.next(event);
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  async exportStocks(): Promise<void> {
    this.isLoading = true;
    try {
      const response = await firstValueFrom(this.stockService.exportStocks(this.searchTerm));
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'estoque.csv';
      if (contentDisposition) {
        const matches = /filename\*?="?([^;"]+)"?/.exec(contentDisposition);
        if (matches && matches.length > 1) {
          filename = decodeURIComponent(matches[1].replace(/\+/g, ' '));
        }
      }

      const blob = response.body;
      if (!blob) {
        throw new Error('O corpo da resposta está vazio.');
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
      this.isLoading = false;
      this.toastService.showSuccess(ToastMessages.SUCCESS_EXPORT);
    } catch (error) {
      this.isLoading = false;
      this.handleApiError(error);
      this.toastService.showError(ToastMessages.UNEXPECTED_ERROR);
    }
  }
}
