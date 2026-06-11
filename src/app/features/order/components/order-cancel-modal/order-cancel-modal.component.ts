import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { OrderService } from '../../services/order.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { Order } from '../../interfaces/order';
import { BaseComponent } from '../../../../core/components/base/base.component';
import { AuthService } from '../../../../core/services/auth.service';
import { FormHelperService } from '../../../../core/services/form-helper.service';
import { ConfirmMessages, ToastMessages } from '../../../../shared/constants/messages.constants';
import { CancelOrderCommand } from '../../interfaces/order-commands';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-order-cancel-modal',
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
    TextareaModule,
    SpinnerComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './order-cancel-modal.component.html',
  styleUrl: './order-cancel-modal.component.scss'
})
export class OrderCancelModalComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy {
  @Input() display = false;
  @Input() order: Order | undefined;
  @Input() responsibleEmployeeOptions: any[] = [];

  @Output() displayChange = new EventEmitter<boolean>();
  @Output() onCancelComplete = new EventEmitter<Order | undefined>();

  cancelForm!: FormGroup;
  formSubmitted = false;
  currentAccountId: number;

  private orderFormLabels: { [key: string]: string } = {
    canceledByEmployeeId: 'Responsável',
    cancellationReason: 'Motivo',
  };

  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private authService: AuthService,
    private formHelperService: FormHelperService,
  ) {
    super();
    const userId = 0 // this.authService.getUserId();
    this.currentAccountId = userId ? Number(userId) : 0;
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['display'] && changes['display'].currentValue && this.order) {
      this.initForm();
    }
  }

  private initForm(): void {
    this.cancelForm = this.fb.group({
      orderId: [this.order?.id],
      cancellationReason: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      canceledByAccountId: [this.currentAccountId],
      canceledByEmployeeId: [null, Validators.required],
    });
  }

  async onCancelClick(): Promise<void> {
    this.formSubmitted = true;

    if (this.validateFormAndShowErrors(this.cancelForm, this.formHelperService, this.orderFormLabels)) {
      this.isLoading = true;
      const formValue = this.cancelForm.getRawValue();
      const cancelCommand: CancelOrderCommand = {
        orderId: formValue.orderId,
        canceledByEmployeeId: formValue.canceledByEmployeeId,
        canceledByAccountId: formValue.canceledByAccountId,
        cancellationReason: formValue.cancellationReason
      };

      const apiCall = () => firstValueFrom(this.orderService.cancelOrder(cancelCommand));

      try {
        await this.handleApiCall(
          apiCall,
          ConfirmMessages.CANCEL_ORDER,
          ToastMessages.SUCCESS_OPERATION
        );

        this.onCancelComplete.emit(this.order);

      } catch (error) {

      } finally {
        this.isLoading = false;
        this.closeModal();
      }
    }
  }

  closeModal(): void {
    this.displayChange.emit(false);
    this.formSubmitted = false;
    this.cancelForm.reset();
    this.initForm();
  }
}
