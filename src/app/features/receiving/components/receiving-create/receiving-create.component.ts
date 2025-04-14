import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
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
import { Table } from 'primeng/table';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ApiResponse } from '../../../../shared/interfaces/apiResponse';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmMessages, ToastMessages } from '../../../../shared/constants/messages.constants';
import { ToastSeverities, ToastSummaries } from '../../../../shared/constants/toast.constants';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ConfirmMode } from '../../../../shared/enums/confirm-mode.enum';
import { HttpStatus } from '../../../../shared/enums/http-status.enum';
import { StatusOptions } from '../../../../shared/constants/status-options.constants';
import { ReceivingService } from '../../services/receiving.service';
import { Receiving } from '../../interfaces/receiving';
import { firstValueFrom } from 'rxjs';
import { SupplierService } from '../../../supplier/services/supplier.service';
import { EmployeeService } from '../../../employee/services/employee.service';
import { ProductService } from '../../../product/services/product.service';
import { SelectOptions } from '../../../../shared/interfaces/select-options';

@Component({
  selector: 'app-receiving-create',
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
    DatePickerModule,
    InputNumberModule,
    ToastComponent,
    SpinnerComponent,
    ConfirmDialogComponent
  ],
  providers: [MessageService],
  templateUrl: './receiving-create.component.html',
  styleUrl: './receiving-create.component.scss'
})
export class ReceivingCreateComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(SpinnerComponent) spinnerComponent!: SpinnerComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Almoxarifado' }, { label: 'Entradas' }, { label: 'Nova' }];

  receivingForm: FormGroup;
  supplierOptions: SelectOptions<number>[] = [];
  userOptions: SelectOptions<number>[] = [];
  productOptions: SelectOptions<number>[] = [];

  FormMode = FormMode;
  ConfirmMode = ConfirmMode;
  statusOptions = StatusOptions;

  formMode: FormMode.Create | FormMode.Update | FormMode.Detail = FormMode.Create;

  displayDialog = false;
  formSubmitted = false;

  confirmMode: ConfirmMode.Create | ConfirmMode.Update | null = null;
  confirmMessage = '';

  constructor(
    private fb: FormBuilder,
    private receivingService: ReceivingService,
    private supplierService: SupplierService,
    private employeeService: EmployeeService,
    private productService: ProductService) {
    this.receivingForm = this.fb.group({
      id: [{ value: null, disabled: true }],
      invoiceNumber: ['', Validators.required],
      observations: [''],
      receivingDate: [new Date(), Validators.required],
      supplierId: [null],
      responsibleId: [null],
      accountId: [null],
      receivedItems: this.fb.array([]),
    });
  }

  async ngOnInit(): Promise<void> {
    this.addReceivedItem();
    this.loadSupplierNames();
    this.loadUserNames();
    this.loadProductsNames();
  }

  get receivedItems(): FormArray {
    return this.receivingForm.get('receivedItems') as FormArray;
  }

  addReceivedItem(): void {
    this.receivedItems.push(
      this.fb.group({
        productId: [null, Validators.required],
        quantity: [0, Validators.required],
        batch: [''],
        expiryDate: [new Date()],
        manufacturingDate: [new Date()],
      })
    );
  }

  removeReceivedItem(index: number): void {
    this.receivedItems.removeAt(index);
  }

  async saveReceiving(): Promise<void> {
    this.formSubmitted = true;
    if (this.receivingForm.valid) {
      if (this.formMode === FormMode.Create) {
        this.confirmMessage = ConfirmMessages.CREATE_RECEIVING;
        this.confirmMode = ConfirmMode.Create;
      } else if (this.formMode === FormMode.Update) {
        this.confirmMessage = ConfirmMessages.UPDATE_RECEIVING;
        this.confirmMode = ConfirmMode.Update;
      }
      this.confirmDialog.message = this.confirmMessage;
      this.confirmDialog.show();

      try {
        await firstValueFrom(this.confirmDialog.confirmed);
        this.spinnerComponent.loading = true;
        const receiving: Receiving = this.receivingForm.getRawValue();
        let response: any = null;
        if (this.confirmMode === ConfirmMode.Create) {
          response = await this.receivingService.createReceiving(receiving);
        } else if (this.confirmMode === ConfirmMode.Update) {
          // response = await this.receivingService.createReceiving(receiving, receiving.id);
        }
        this.spinnerComponent.loading = false;
        if (response && (response.statusCode === HttpStatus.Ok || response.statusCode === HttpStatus.Created)) {
          this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, response.message);
          // this.getAllUsers();
          // this.hideDialog();
        } else if (response) {
          this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, response.message);
        }
        this.confirmMode = null;
      } catch (error: any) {
        this.spinnerComponent.loading = false;
        if (error && error.error && error.error.message) {
          this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, error.error.message);
        } else {
          this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, ToastMessages.UNEXPECTED_ERROR);
        }
        this.confirmMode = null;

        try {
          await firstValueFrom(this.confirmDialog.rejected);
          this.confirmMode = null;
        } catch (rejectError) {
          this.confirmMode = null;
        }
      }
    } else {
      this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, ToastMessages.REQUIRED_FIELDS);
    }
  }

  async loadSupplierNames(): Promise<void> {
    try {
      const response: ApiResponse<any[]> = await this.supplierService.getAllSupplierNames();
      console.log('loadSupplierNames', response);
      if (response && response.data) {
        this.supplierOptions = response.data.map((destination) => ({
          label: destination.name,
          value: destination.id,
        }));
      }
    } catch (error) {
      console.error(ToastMessages.ERROR_LOADING_NAMES, error);
    }
  }

  async loadUserNames(): Promise<void> {
    try {
      const response: ApiResponse<any[]> = await this.employeeService.getAllEmployeeNames();
      console.log('loadUserNames', response);
      if (response && response.data) {
        this.userOptions = response.data.map((destination) => ({
          label: destination.name,
          value: destination.id,
        }));
      }
    } catch (error) {
      console.error(ToastMessages.ERROR_LOADING_NAMES, error);
    }
  }

  async loadProductsNames(): Promise<void> {
    try {
      const response: ApiResponse<any[]> = await this.productService.getAllProductNames();
      console.log('loadProductsNames', response);
      if (response && response.data) {
        this.productOptions = response.data.map((destination) => ({
          label: destination.name,
          value: destination.id,
        }));
      }
    } catch (error) {
      console.error(ToastMessages.ERROR_LOADING_NAMES, error);
    }
  }
}
