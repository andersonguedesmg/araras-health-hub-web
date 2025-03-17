import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { Tag } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Table } from 'primeng/table';
import { ApiResponse } from '../../../../shared/interfaces/apiResponse';
import { Destination } from '../../interfaces/destination';
import { DestinationService } from '../../services/destination.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { InputMask } from 'primeng/inputmask';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { getSeverity, getStatus } from '../../../../shared/utils/status.utils';
import { Column, ExportColumn } from '../../../../shared/utils/p-table.utils';
import { ConfirmMessages, ToastMessages } from '../../../../shared/constants/messages.constants';
import { ToastSeverities, ToastSummaries } from '../../../../shared/constants/toast.constants';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ConfirmMode } from '../../../../shared/enums/confirm-mode.enum';
import { HttpStatus } from '../../../../shared/enums/http-status.enum';

@Component({
  selector: 'app-destination-list',
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
    InputMask,
    Tag,
    DialogModule,
    DropdownModule,
    ToastComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
  ],
  providers: [MessageService],
  templateUrl: './destination-list.component.html',
  styleUrl: './destination-list.component.scss'
})
export class DestinationListComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(SpinnerComponent) spinnerComponent!: SpinnerComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  FormMode = FormMode;
  ConfirmMode = ConfirmMode;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Administração' }, { label: 'Destinos' }];

  destinations: Destination[] = [];
  selectedDestinations?: Destination;
  destinationForm: FormGroup;
  formMode: FormMode.Create | FormMode.Update | FormMode.Detail = FormMode.Create;
  displayDialog = false;
  formSubmitted = false;

  confirmMode: ConfirmMode.Create | ConfirmMode.Update | null = null;
  confirmMessage = '';

  statusOptions: any[] = [
    { label: 'Ativo', value: true },
    { label: 'Inativo', value: false },
  ];

  cols!: Column[];
  selectedColumns!: Column[];
  exportColumns!: ExportColumn[];

  getSeverity = getSeverity;
  getStatus = getStatus;

  constructor(private cd: ChangeDetectorRef, private destinationService: DestinationService, private fb: FormBuilder) {
    this.destinationForm = this.fb.group({
      id: [{ value: null, disabled: true }],
      name: ['', Validators.required],
      address: ['', Validators.required],
      number: ['', Validators.required],
      neighborhood: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      cep: ['', Validators.required],
      email: ['', Validators.required],
      phone: ['', Validators.required],
      isActive: [{ value: false, disabled: true }],
    });
  }

  ngOnInit() {
    this.loadTableData();
  }

  ngAfterViewInit(): void {
    this.getAllDestinations();
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  loadTableData() {
    this.cd.markForCheck();

    this.cols = [
      { field: 'id', header: 'ID', customExportHeader: 'CÓDIGO DO DESTINO' },
      { field: 'name', header: 'NOME' },
      { field: 'address', header: 'ENDEREÇO' },
      { field: 'number', header: 'NÚMERO' },
      { field: 'neighborhood', header: 'BAIRRO' },
      { field: 'city', header: 'CIDADE' },
      { field: 'state', header: 'ESTADO' },
      { field: 'cep', header: 'CEP' },
      { field: 'email', header: 'E-MAIL' },
      { field: 'phone', header: 'TELEFONE' },
      { field: 'isActive', header: 'STATUS' },
    ];

    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));

    this.selectedColumns = this.cols;
  }

  getAllDestinations(): void {
    this.spinnerComponent.loading = true;
    this.destinationService.getAllDestinations().subscribe({
      next: (response: ApiResponse<Destination[]>) => {
        this.spinnerComponent.loading = false;
        if (response.statusCode === HttpStatus.Ok) {
          this.destinations = response.data;
        } else {
          this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, response.message);
        }
      }, error: (error) => {
        this.spinnerComponent.loading = false;
        this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, error);
      },
    });
  }

  openForm(mode: FormMode.Create | FormMode.Update | FormMode.Detail, destination?: Destination): void {
    this.formMode = mode;
    this.selectedDestinations = destination;
    this.displayDialog = true;
    this.initializeForm();
  }

  initializeForm(): void {
    this.destinationForm.reset();
    if (this.selectedDestinations) {
      this.destinationForm.patchValue(this.selectedDestinations);
    }
    this.updateFormState();
  }

  updateFormState(): void {
    const isDetail = this.formMode === FormMode.Detail;
    const isUpdate = this.formMode === FormMode.Update;

    this.destinationForm.get('name')?.disable();
    this.destinationForm.get('address')?.disable();
    this.destinationForm.get('number')?.disable();
    this.destinationForm.get('neighborhood')?.disable();
    this.destinationForm.get('city')?.disable();
    this.destinationForm.get('state')?.disable();
    this.destinationForm.get('cep')?.disable();
    this.destinationForm.get('email')?.disable();
    this.destinationForm.get('phone')?.disable();
    this.destinationForm.get('isActive')?.disable();

    if (this.formMode === 'create') {
      this.destinationForm.get('isActive')?.setValue(true);
      this.destinationForm.get('isActive')?.disable();
      this.destinationForm.get('name')?.enable();
      this.destinationForm.get('address')?.enable();
      this.destinationForm.get('number')?.enable();
      this.destinationForm.get('neighborhood')?.enable();
      this.destinationForm.get('city')?.enable();
      this.destinationForm.get('state')?.enable();
      this.destinationForm.get('cep')?.enable();
      this.destinationForm.get('email')?.enable();
      this.destinationForm.get('phone')?.enable();
    } else if (isUpdate) {
      this.destinationForm.get('name')?.enable();
      this.destinationForm.get('address')?.enable();
      this.destinationForm.get('number')?.enable();
      this.destinationForm.get('neighborhood')?.enable();
      this.destinationForm.get('city')?.enable();
      this.destinationForm.get('state')?.enable();
      this.destinationForm.get('cep')?.enable();
      this.destinationForm.get('email')?.enable();
      this.destinationForm.get('phone')?.enable();
    }

    if (!isDetail && !isUpdate) {
      this.destinationForm.get('isActive')?.disable();
    }
    if (isDetail) {
      this.destinationForm.get('isActive')?.disable();
    }
  }

  hideDialog(): void {
    this.displayDialog = false;
    this.selectedDestinations = undefined;
  }

  saveDestination(): void {
    this.formSubmitted = true;
    if (this.destinationForm.valid) {
      if (this.formMode === FormMode.Create) {
        this.confirmMessage = ConfirmMessages.CREATE_DESTINATION;
        this.confirmMode = ConfirmMode.Create;
      } else if (this.formMode === FormMode.Update) {
        this.confirmMessage = ConfirmMessages.UPDATE_DESTINATION;
        this.confirmMode = ConfirmMode.Update;
      }
      this.confirmDialog.message = this.confirmMessage;
      this.confirmDialog.confirmed.subscribe(() => {
        this.spinnerComponent.loading = true;
        const destination: Destination = this.destinationForm.getRawValue();
        if (this.confirmMode === ConfirmMode.Create) {
          this.destinationService.createDestination(destination).subscribe(this.handleResponse());
        } else if (this.confirmMode === ConfirmMode.Update) {
          this.destinationService.updateDestination(destination, destination.id).subscribe(this.handleResponse());
        }
      });
      this.confirmDialog.rejected.subscribe(() => {
        this.confirmMode = null;
      });
      this.confirmDialog.show();
    } else {
      this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, ToastMessages.REQUIRED_FIELDS);
    }
  }

  changeStatusDestination(destinationId: number, destination: Destination): void {
    this.confirmDialog.message = ConfirmMessages.UPDATE_DESTINATION;
    this.confirmDialog.confirmed.subscribe(() => {
      this.spinnerComponent.loading = true;
      let changeDestinationIsActive = this.changeIsActive(destination);
      this.destinationService.changeStatusDestination(destinationId, changeDestinationIsActive).subscribe({
        next: (response: ApiResponse<Destination[]>) => {
          this.spinnerComponent.loading = false;
          if (response.statusCode === HttpStatus.Ok) {
            this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, response.message);
            this.getAllDestinations();
          } else {
            this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, response.message);
          }
        }, error: (error) => {
          this.spinnerComponent.loading = false;
          this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, error);
        },
      });
    });
    this.confirmDialog.rejected.subscribe(() => {
      this.toastComponent.showMessage(ToastSeverities.INFO, ToastSummaries.CANCELED, ToastMessages.CANCELED_DELETION);
    });
    this.confirmDialog.show();
  }

  changeIsActive(objeto: any) {
    if (objeto && typeof objeto === 'object' && 'isActive' in objeto) {
      objeto.isActive = !objeto.isActive;
    }
    return objeto;
  }

  deleteDestination(destinationId: number): void {
    this.confirmDialog.message = ConfirmMessages.DELETE_DESTINATION;
    this.confirmDialog.confirmed.subscribe(() => {
      this.spinnerComponent.loading = true;
      this.destinationService.deleteDestination(destinationId).subscribe({
        next: (response: ApiResponse<Destination[]>) => {
          this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, response.message);
          this.getAllDestinations();
        },
        error: (error) => {
          this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, error);
          this.spinnerComponent.loading = false;
        },
      });
    });
    this.confirmDialog.rejected.subscribe(() => {
      this.toastComponent.showMessage(ToastSeverities.INFO, ToastSummaries.CANCELED, ToastMessages.CANCELED_DELETION);
    });
    this.confirmDialog.show();
  }

  handleResponse(): any {
    return {
      next: () => {
        this.spinnerComponent.loading = false;
        this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, `Destino ${this.formMode === 'create' ? 'cadastrado' : 'atualizado'} com sucesso.`);
        this.getAllDestinations();
        this.hideDialog();
      }, error: (error: any) => {
        this.spinnerComponent.loading = false;
        this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, `Erro ao ${this.formMode === 'create' ? 'cadastrar' : 'atualizar'} destino.`);
        console.error(`Erro ao ${this.formMode === 'create' ? 'cadastrar' : 'atualizar'} destino:`, error);
      },
    };
  }
}
