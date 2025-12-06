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
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ConfirmMode } from '../../../../shared/enums/confirm-mode.enum';
import { getOrderSeverity, getOrderStatus } from '../../../../shared/utils/order-status.utils';
import { OrderService } from '../../services/order.service';
import { StatusOptions } from '../../../../shared/constants/status-options.constants';
import { debounceTime, Observable, Subject, Subscription, switchMap } from 'rxjs';
import { HasRoleDirective } from '../../../../core/directives/has-role.directive';
import { TableHeaderComponent } from '../../../../shared/components/table-header/table-header.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { Order } from '../../interfaces/order';
import { OrderActionModalComponent } from '../order-action-modal/order-action-modal.component';
import { OrderActionType } from '../../../../shared/enums/order-action-type.enum';
import { DropdownDataService } from '../../../../shared/services/dropdown-data.service';
import { SelectOptions } from '../../../../shared/interfaces/select-options';
import { OrderStatusId } from '../../../../shared/enums/order-status-id.enum';
import { BaseComponent } from '../../../../core/components/base/base.component';

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
export class OrderApproveComponent extends BaseComponent implements OnInit, OnDestroy {
  FormMode = FormMode;
  ConfirmMode = ConfirmMode;
  statusOptions = StatusOptions;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Pedidos' }, { label: 'Aprovar' }];
  title: string = 'Pedidos para Aprovação';

  orders$!: Observable<Order[]>;
  selectedOrder?: Order;
  formMode: FormMode.Create | FormMode.Update | FormMode.Detail = FormMode.Create;

  employeeOptions: SelectOptions<number>[] = [];

  displayDialog = false;
  formSubmitted = false;

  displayActionModal = false;
  selectedOrderForAction!: Order;
  orderActionType = OrderActionType;
  actionType!: OrderActionType;

  confirmMode: ConfirmMode.Create | ConfirmMode.Update | null = null;
  confirmMessage = '';
  headerText = '';

  getOrderSeverity = getOrderSeverity;
  getOrderStatus = getOrderStatus;

  private loadLazy = new Subject<any>();
  private lastLazyEvent: any = { first: 0, rows: 5 };
  private subscriptions: Subscription = new Subscription();
  totalRecords = 0;

  constructor(
    private orderService: OrderService,
    private dropdownDataService: DropdownDataService,
  ) {
    super();
  }

  ngOnInit() {
    this.loadEmployeesOptions();
    this.orders$ = this.orderService.orders$;
    this.subscriptions.add(
      this.loadLazy
        .pipe(
          debounceTime(300),
          switchMap(event => {
            this.isLoading = true;
            const pageNumber = (event.first / event.rows) + 1;
            const pageSize = event.rows;
            return this.orderService.loadOrders(pageNumber, pageSize, OrderStatusId.PendingApproval);
          })
        )
        .subscribe({
          next: response => {
            this.isLoading = false;
            console.log('loadOrders response', response);
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
    this.loadLazy.next(this.lastLazyEvent);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadOrders(event: any) {
    this.lastLazyEvent = event;
    this.loadLazy.next(event);
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

  onApproveClick(order: Order) {
    this.selectedOrderForAction = order;
    this.displayActionModal = true;
  }

  handleActionComplete(updatedOrder: Order) {
    this.displayActionModal = false;
    this.loadLazy.next(this.lastLazyEvent);
  }

  exportCSV(dt: Table) {
    dt.exportCSV();
  }
}
