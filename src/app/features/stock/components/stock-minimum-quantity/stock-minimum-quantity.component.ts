import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BaseComponent } from '../../../../core/components/base/base.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ToastMessages } from '../../../../shared/constants/messages.constants';
import { debounceTime, firstValueFrom, Observable, Subject, Subscription, switchMap, tap } from 'rxjs';
import { TableHeaderComponent } from '../../../../shared/components/table-header/table-header.component';
import { StockMinQuantity } from '../../interfaces/stock-minimum-quantity';
import { StockService } from '../../services/stock.service';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-stock-minimum-quantity',
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
    InputNumberModule,
    IconFieldModule,
    TooltipModule,
    TagModule,
    DialogModule,
    SelectModule,
    TableModule,
    BreadcrumbComponent,
    TableHeaderComponent,
    SpinnerComponent,
  ],
  providers: [MessageService],
  templateUrl: './stock-minimum-quantity.component.html',
  styleUrl: './stock-minimum-quantity.component.scss'
})
export class StockMinimumQuantityComponent extends BaseComponent implements OnInit, OnDestroy {
  itemsBreadcrumb: MenuItem[] = [{ label: 'Almoxarifado' }, { label: 'Configurações' }, { label: 'Estoque Mínimo' }];
  title: string = 'Estoque Mínimo';

  stockMinQuantities$!: Observable<StockMinQuantity[]>;
  totalRecords = 0;

  private loadLazy = new Subject<any>();
  private subscriptions: Subscription = new Subscription();
  private searchTerm: string = '';
  private searchSubject = new Subject<string>();

  public lastLazyEvent: any = { first: 0, rows: 5 };

  clonedQuantities: { [productId: number]: number; } = {};

  constructor(
    private cd: ChangeDetectorRef,
    private stockService: StockService,
  ) {
    super();
  }

  ngOnInit() {
    this.stockMinQuantities$ = this.stockService.stockMinQuantities$;

    this.setupLazyLoadSubscription();
    this.setupSearchSubscription();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.searchSubject.complete();
    this.loadLazy.complete();
  }

  private setupLazyLoadSubscription(): void {
    this.subscriptions.add(
      this.loadLazy
        .pipe(
          debounceTime(300),
          tap(event => this.lastLazyEvent = event),
          switchMap(event => {
            this.isLoading = true;
            const pageNumber = event.first / event.rows + 1;
            const pageSize = event.rows;

            return this.stockService.loadStockMinQuantities(pageNumber, pageSize, this.searchTerm);
          })
        )
        .subscribe({
          next: response => {
            this.isLoading = false;
            if (response.success) {
              this.totalRecords = response.totalCount || 0;
            } else {
              this.handleApiResponse(response, 'Falha ao carregar dados de estoque.');
            }
            this.cd.markForCheck();
          },
          error: (error) => {
            this.isLoading = false;
            this.handleApiError(error);
            this.cd.markForCheck();
          }
        })
    );
  }

  private setupSearchSubscription(): void {
    this.subscriptions.add(
      this.searchSubject.pipe(debounceTime(300)).subscribe(searchTerm => {
        this.searchTerm = searchTerm;
        this.loadMinQuantities({ first: 0, rows: this.lastLazyEvent.rows });
      })
    );
  }

  loadMinQuantities(event: any): void {
    this.loadLazy.next(event);
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  onEditInit(event: any): void {
    const stock = event.data;
    this.clonedQuantities[stock.productId] = stock.minQuantity;
  }

  async onEditComplete(event: any): Promise<void> {
    const stock = event.data;
    const oldQuantity = this.clonedQuantities[stock.productId];

    this.clonedQuantities[stock.productId] = oldQuantity !== undefined ? oldQuantity : stock.minQuantity;
    if (event.field !== 'minQuantity') return;

    if (stock.minQuantity < 0 || isNaN(stock.minQuantity)) {
      this.toastService.showError(ToastMessages.MINIMUM_QUANTITY_MUST_BE_POSITIVE);
      this.revertQuantity(stock, event.index, oldQuantity);
      return;
    }

    if (oldQuantity === stock.minQuantity) {
      delete this.clonedQuantities[stock.productId];
      return;
    }

    this.isLoading = true;
    try {
      const apiCall = firstValueFrom(this.stockService.updateMinQuantity(stock.productId, stock.minQuantity));
      const response = await apiCall;

      if (response.success) {
        this.toastService.showSuccess(`Estoque mínimo de ${stock.productName} atualizado com sucesso!`, ToastMessages.SUCCESS_OPERATION);
      } else {
        this.handleApiResponse(response, 'Falha ao salvar. Revertendo valor.');
        this.revertQuantity(stock, event.index, oldQuantity);
      }
    } catch (error) {
      this.handleApiError(error);
      this.revertQuantity(stock, event.index, oldQuantity);
    } finally {
      this.isLoading = false;
      delete this.clonedQuantities[stock.productId];
      this.cd.markForCheck();
    }
  }

  private revertQuantity(stock: StockMinQuantity, index: number, originalQuantity: number | undefined): void {
    if (originalQuantity === undefined) return;
    const stockMinQuantitySubject = this.stockService.stockMinQuantitySubjectGetter;
    const currentList = stockMinQuantitySubject.getValue();
    currentList[index].minQuantity = originalQuantity;
    stockMinQuantitySubject.next([...currentList]);
    this.cd.markForCheck();
  }
}
