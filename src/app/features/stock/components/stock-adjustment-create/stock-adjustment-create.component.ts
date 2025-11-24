import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmMessages, ToastMessages } from '../../../../shared/constants/messages.constants';
import { ToastSeverities, ToastSummaries } from '../../../../shared/constants/toast.constants';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ConfirmMode } from '../../../../shared/enums/confirm-mode.enum';
import { StatusOptions } from '../../../../shared/constants/status-options.constants';
import { combineLatest, firstValueFrom, Subscription } from 'rxjs';
import { SelectOptions } from '../../../../shared/interfaces/select-options';
import { AuthService } from '../../../../core/services/auth.service';
import { TextareaModule } from 'primeng/textarea';
import { DropdownDataService } from '../../../../shared/services/dropdown-data.service';
import { TableModule } from 'primeng/table';
import { StockService } from '../../services/stock.service';
import { BaseComponent } from '../../../../core/components/base/base.component';
import { FormHelperService } from '../../../../core/services/form-helper.service';

@Component({
  selector: 'app-stock-adjustment-create',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    ToastModule,
    ToolbarModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
    InputNumberModule,
    TextareaModule,
    TooltipModule,
    DatePickerModule,
    DialogModule,
    SelectModule,
    BreadcrumbComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
  ],
  providers: [MessageService],
  templateUrl: './stock-adjustment-create.component.html',
  styleUrl: './stock-adjustment-create.component.scss'
})
export class StockAdjustmentCreateComponent extends BaseComponent implements OnInit, OnDestroy {
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(SpinnerComponent) spinnerComponent!: SpinnerComponent;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Almoxarifado' }, { label: 'Movimentações' }, { label: 'Novo Ajuste Manual' }];
  title: string = 'Novo Ajuste Manual';

  stockAdjustmentForm: FormGroup;

  employeeOptions: SelectOptions<number>[] = [];
  productOptions: SelectOptions<number>[] = [];
  typeStockAdjustmentOptions: SelectOptions<number>[] = [];

  FormMode = FormMode;
  ConfirmMode = ConfirmMode;
  statusOptions = StatusOptions;

  formMode: FormMode.Create | FormMode.Update | FormMode.Detail = FormMode.Create;

  stockAdjustmentFormSubmitted = false;

  confirmMode: ConfirmMode.Create | ConfirmMode.Update | null = null;
  confirmMessage = '';

  private stockAdjustmentFormLabels: { [key: string]: string; } = {
    type: 'Tipo do Ajuste',
    reason: 'Motivo do Ajuste',
    responsibleId: 'Responsável',
    adjustmentDate: 'Data',
    adjustmentItems: 'Itens do Ajuste',
    productId: 'Produto',
    quantity: 'Quantidade',
    batch: 'Lote',
    brand: 'Marca',
    expiryDate: 'Data de Validade',
  };

  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dropdownDataService: DropdownDataService,
    private stockService: StockService,
    private formHelperService: FormHelperService
  ) {
    super();
    this.stockAdjustmentForm = this.fb.group({
      id: [{ value: null, disabled: true }],
      type: [null, Validators.required],
      reason: ['', Validators.required],
      observation: [''],
      adjustmentDate: [new Date(), Validators.required],
      responsibleId: [null, Validators.required],
      accountId: this.authService.getUserId(),
      adjustmentItems: this.fb.array([], Validators.minLength(1)),
    });
  }

  async ngOnInit(): Promise<void> {
    this.isLoading = true;
    try {
      const [employeeOpts, productOpts] = await Promise.all([
        this.dropdownDataService.getEmployeeOptions(),
        this.dropdownDataService.getProductOptions(),
      ]);
      this.employeeOptions = employeeOpts;
      this.productOptions = productOpts;

      this.typeStockAdjustmentOptions = [
        { label: 'Entrada', value: 1 },
        { label: 'Saída', value: 2 },
      ];

      this.addAdjustmentItem();

    } catch (error) {
      this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, 'Erro ao carregar dados iniciais. Por favor, tente novamente.');
    } finally {
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get adjustmentItems(): FormArray {
    return this.stockAdjustmentForm.get('adjustmentItems') as FormArray;
  }

  addAdjustmentItem(): void {
    const itemGroup = this.fb.group({
      productId: [null, Validators.required],
      quantity: [null, [Validators.required, Validators.min(0.01)]],
      unitValue: [null,],
      totalValue: [{ value: null, disabled: true }],
      batch: ['', Validators.required],
      brand: ['', Validators.required],
      expiryDate: [null, Validators.required],
    });

    this.adjustmentItems.push(itemGroup);

    const quantityCtrl = itemGroup.get('quantity');
    const unitValueCtrl = itemGroup.get('unitValue');

    if (quantityCtrl && unitValueCtrl) {
      const sub = combineLatest([
        quantityCtrl.valueChanges,
        unitValueCtrl.valueChanges
      ]).subscribe(() => {
        this.calculateTotalValue(itemGroup);
      });
      this.subscriptions.add(sub);
    }
  }

  removeStockAdjustmentItem(index: number): void {
    this.confirmDialog.message = `Tem certeza que deseja remover o item ${index + 1}?`;
    this.confirmDialog.show();

    firstValueFrom(this.confirmDialog.confirmed)
      .then(() => {
        if (this.adjustmentItems.length > 1) {
          this.adjustmentItems.removeAt(index);
          this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, `Item ${index + 1} removido com sucesso.`);
        }
      })
      .catch(() => {
        this.toastComponent.showMessage(ToastSeverities.INFO, ToastSummaries.INFO, 'Remoção cancelada.');
      });
  }


  private calculateTotalValue(itemGroup: FormGroup): void {
    const quantity = parseFloat(itemGroup.get('quantity')?.value || 0);
    const unitValue = parseFloat(itemGroup.get('unitValue')?.value || 0);
    const total = (quantity * unitValue).toFixed(2);

    const totalValueCtrl = itemGroup.get('totalValue');
    if (totalValueCtrl) {
      const wasDisabled = totalValueCtrl.disabled;
      if (wasDisabled) {
        totalValueCtrl.enable({ emitEvent: false });
      }
      totalValueCtrl.setValue(parseFloat(total), { emitEvent: false });
      if (wasDisabled) {
        totalValueCtrl.disable({ emitEvent: false });
      }
    }
  }

  async saveStockAdjustment(): Promise<void> {
    this.stockAdjustmentFormSubmitted = true;
    if (this.validateForm()) {
      const confirmMsg = this.formMode === FormMode.Create ? ConfirmMessages.CREATE_STOCK_ADJUSTMENT : ConfirmMessages.UPDATE_STOCK_ADJUSTMENT;
      const stockAdjustment = this.stockAdjustmentForm.getRawValue();
      const apiCall = this.formMode === FormMode.Create
        ? firstValueFrom(this.stockService.createStockAdjustment(stockAdjustment))
        : firstValueFrom(this.stockService.createStockAdjustment(stockAdjustment));
      await this.handleApiCall(apiCall, confirmMsg, ToastMessages.SUCCESS_OPERATION);
      this.resetStockAdjustmentForm();
    }
  }

  public resetStockAdjustmentForm(): void {
    this.stockAdjustmentForm.reset({
      adjustmentDate: new Date(),
      accountId: this.authService.getUserId(),
    });
    this.adjustmentItems.clear();
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
    this.addAdjustmentItem();
    this.stockAdjustmentFormSubmitted = false;
  }

  private validateForm(): boolean {
    return this.validateFormAndShowErrors(this.stockAdjustmentForm, this.formHelperService, this.stockAdjustmentFormLabels);
  }
}
