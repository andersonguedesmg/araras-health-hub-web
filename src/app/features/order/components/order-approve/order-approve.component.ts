import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
import { getOrderSeverity, getOrderStatus } from '../../../../shared/utils/order-status.utils';
import { OrderService } from '../../services/order.service';
import { StatusOptions } from '../../../../shared/constants/status-options.constants';
import { ApiResponse } from '../../../../shared/interfaces/api-response';
import { ConfirmMessages, ToastMessages } from '../../../../shared/constants/messages.constants';
import { ToastSeverities, ToastSummaries } from '../../../../shared/constants/toast.constants';
import { HttpStatus } from '../../../../shared/enums/http-status.enum';
import { debounceTime, firstValueFrom, Observable, Subject, Subscription, switchMap } from 'rxjs';
import { HasRoleDirective } from '../../../../core/directives/has-role.directive';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { TableHeaderComponent } from '../../../../shared/components/table-header/table-header.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { InputMask } from 'primeng/inputmask';
import { Order } from '../../interfaces/order';
import { OrderActionModalComponent } from '../order-action-modal/order-action-modal.component';
import { OrderActionType } from '../../../../shared/enums/order-action-type.enum';
import { DropdownDataService } from '../../../../shared/services/dropdown-data.service';
import { SelectOptions } from '../../../../shared/interfaces/select-options';

@Component({
  selector: 'app-order-approve',
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
    OrderActionModalComponent,
    HasRoleDirective,
  ],
  templateUrl: './order-approve.component.html',
  styleUrl: './order-approve.component.scss'
})
export class OrderApproveComponent implements OnInit, OnDestroy {
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  isLoading = false;

  FormMode = FormMode;
  ConfirmMode = ConfirmMode;
  statusOptions = StatusOptions;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Pedido' }, { label: 'Aprovar' }];

  orders$!: Observable<Order[]>;
  selectedOrder?: Order;
  formMode: FormMode.Create | FormMode.Update | FormMode.Detail = FormMode.Create;

  displayDialog = false;
  formSubmitted = false;

  displayActionModal = false;
  selectedOrderForAction!: Order;
  OrderActionType = OrderActionType;

  confirmMode: ConfirmMode.Create | ConfirmMode.Update | null = null;
  confirmMessage = '';
  headerText = '';

  cols!: Column[];
  selectedColumns!: Column[];
  exportColumns!: ExportColumn[];

  getOrderSeverity = getOrderSeverity;
  getOrderStatus = getOrderStatus;

  private loadLazy = new Subject<any>();
  private subscriptions: Subscription = new Subscription();
  totalRecords = 0;

  constructor(private cd: ChangeDetectorRef, private orderService: OrderService, private fb: FormBuilder, private dropdownDataService: DropdownDataService,) { }

  ngOnInit() {
    this.loadTableData();
    this.loadddd()
    this.orders$ = this.orderService.orders$;
    this.subscriptions.add(
      this.loadLazy
        .pipe(
          debounceTime(300),
          switchMap(event => {
            this.isLoading = true;
            const pageNumber = event.first / event.rows + 1;
            const pageSize = event.rows;
            return this.orderService.loadOrders(pageNumber, pageSize);
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
      { field: 'id', header: 'ID', customExportHeader: 'CÓDIGO DO PEDIDO' },
      { field: 'createdAt', header: 'DATA DE PEDIDO' },
      { field: 'createdByAccount.facility.namee', header: 'UNIDADE' },
      { field: 'createdByAccount.userName', header: 'CONTA' },
      { field: 'createdByEmployee.name', header: 'RESPONSÁVEL' },
      { field: 'orderItems.length', header: 'ITENS' },
      { field: 'orderStatus.description', header: 'STATUS' },
    ];
    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    this.selectedColumns = this.cols;
  }

  loadOrders(event: any) {
    this.loadLazy.next(event);
  }
  employeeOptions: SelectOptions<number>[] = [];

  async loadddd(): Promise<void> {
    try {
      this.employeeOptions = await this.dropdownDataService.getEmployeeOptions();
      console.log('this.employeeOptions', this.employeeOptions);

    } catch (error) {
      console.error('Erro ao carregar opções de funcionário:', error);
      this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, 'Erro ao carregar responsáveis. Por favor, tente novamente.');
    } finally {
    }
  }

  actionType!: OrderActionType;

  onApproveClick(order: Order) {
    this.selectedOrderForAction = order;
    this.displayActionModal = true;
  }

  handleActionComplete(updatedOrder: Order) {
    this.displayActionModal = false;
    this.loadLazy.next({});
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

  exportCSV(dt: Table) {
    dt.exportCSV();
  }
}
