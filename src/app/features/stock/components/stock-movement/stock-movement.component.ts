import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { StockMovementService } from '../../services/stock-movement.service';
import { debounceTime, Observable, Subject, Subscription, switchMap } from 'rxjs';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { TagModule } from 'primeng/tag';
import { TableHeaderComponent } from '../../../../shared/components/table-header/table-header.component';
import { StockMovement } from '../../interfaces/stock-movement';
import { StockMovementTypePipe } from "../../../../shared/pipe/stock-movement-type.pipe";
import { BaseComponent } from '../../../../core/components/base/base.component';

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

  private searchTerm: string = '';
  private searchSubject = new Subject<string>();

  private loadLazy = new Subject<any>();
  private subscriptions: Subscription = new Subscription();
  totalRecords = 0;

  constructor(
    private stockMovementService: StockMovementService,
  ) {
    super();
  }

  ngOnInit() {
    this.stockMovements$ = this.stockMovementService.stockMovements$;
    this.subscriptions.add(
      this.loadLazy
        .pipe(
          debounceTime(300),
          switchMap(event => {
            this.isLoading = true;
            const pageNumber = event.first / event.rows + 1;
            const pageSize = event.rows;
            return this.stockMovementService.loadStockMovements(pageNumber, pageSize, this.searchTerm);
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

  loadStocks(event: any) {
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
}
