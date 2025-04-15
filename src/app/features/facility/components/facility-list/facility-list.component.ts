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
import { Facility } from '../../interfaces/facility';
import { FacilityService } from '../../services/facility.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { InputMask } from 'primeng/inputmask';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { getSeverity, getStatus } from '../../../../shared/utils/status.utils';
import { Column, ExportColumn } from '../../../../shared/utils/p-table.utils';
import { ConfirmMessages, ToastMessages } from '../../../../shared/constants/messages.constants';
import { ToastSeverities, ToastSummaries } from '../../../../shared/constants/toast.constants';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ConfirmMode } from '../../../../shared/enums/confirm-mode.enum';
import { HttpStatus } from '../../../../shared/enums/http-status.enum';
import { StatusOptions } from '../../../../shared/constants/status-options.constants';
import { firstValueFrom } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-facility-list',
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
    TooltipModule,
    Tag,
    DialogModule,
    SelectModule,
    ToastComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
  ],
  providers: [MessageService],
  templateUrl: './facility-list.component.html',
  styleUrl: './facility-list.component.scss'
})
export class FacilityListComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(SpinnerComponent) spinnerComponent!: SpinnerComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  FormMode = FormMode;
  ConfirmMode = ConfirmMode;
  statusOptions = StatusOptions;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Administração' }, { label: 'Unidades' }];

  facilities: Facility[] = [];
  selectedFacility?: Facility;
  facilityForm: FormGroup;
  formMode: FormMode.Create | FormMode.Update | FormMode.Detail = FormMode.Create;
  displayDialog = false;
  formSubmitted = false;

  confirmMode: ConfirmMode.Create | ConfirmMode.Update | null = null;
  confirmMessage = '';

  cols!: Column[];
  selectedColumns!: Column[];
  exportColumns!: ExportColumn[];

  getSeverity = getSeverity;
  getStatus = getStatus;

  constructor(private cd: ChangeDetectorRef, private facilityService: FacilityService, private fb: FormBuilder) {
    this.facilityForm = this.fb.group({
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
    this.getAllFacilities();
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  loadTableData() {
    this.cd.markForCheck();

    this.cols = [
      { field: 'id', header: 'ID', customExportHeader: 'CÓDIGO DA UNIDADE' },
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

  async getAllFacilities(): Promise<void> {
    this.facilities = [];
    this.spinnerComponent.loading = true;

    try {
      const response: ApiResponse<Facility[]> = await this.facilityService.getAllFacilities();
      this.spinnerComponent.loading = false;
      if (response.statusCode === HttpStatus.Ok) {
        this.facilities = response.data;
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

  openForm(mode: FormMode.Create | FormMode.Update | FormMode.Detail, facility?: Facility): void {
    this.formMode = mode;
    this.selectedFacility = facility;
    this.displayDialog = true;
    this.initializeForm();
  }

  initializeForm(): void {
    this.facilityForm.reset();
    if (this.selectedFacility) {
      this.facilityForm.patchValue(this.selectedFacility);
    }
    this.updateFormState();
  }

  updateFormState(): void {
    const isDetail = this.formMode === FormMode.Detail;
    const isUpdate = this.formMode === FormMode.Update;

    this.facilityForm.get('name')?.disable();
    this.facilityForm.get('address')?.disable();
    this.facilityForm.get('number')?.disable();
    this.facilityForm.get('neighborhood')?.disable();
    this.facilityForm.get('city')?.disable();
    this.facilityForm.get('state')?.disable();
    this.facilityForm.get('cep')?.disable();
    this.facilityForm.get('email')?.disable();
    this.facilityForm.get('phone')?.disable();
    this.facilityForm.get('isActive')?.disable();

    if (this.formMode === 'create') {
      this.facilityForm.get('isActive')?.setValue(true);
      this.facilityForm.get('isActive')?.disable();
      this.facilityForm.get('name')?.enable();
      this.facilityForm.get('address')?.enable();
      this.facilityForm.get('number')?.enable();
      this.facilityForm.get('neighborhood')?.enable();
      this.facilityForm.get('city')?.enable();
      this.facilityForm.get('state')?.enable();
      this.facilityForm.get('cep')?.enable();
      this.facilityForm.get('email')?.enable();
      this.facilityForm.get('phone')?.enable();
    } else if (isUpdate) {
      this.facilityForm.get('name')?.enable();
      this.facilityForm.get('address')?.enable();
      this.facilityForm.get('number')?.enable();
      this.facilityForm.get('neighborhood')?.enable();
      this.facilityForm.get('city')?.enable();
      this.facilityForm.get('state')?.enable();
      this.facilityForm.get('cep')?.enable();
      this.facilityForm.get('email')?.enable();
      this.facilityForm.get('phone')?.enable();
    }

    if (!isDetail && !isUpdate) {
      this.facilityForm.get('isActive')?.disable();
    }
    if (isDetail) {
      this.facilityForm.get('isActive')?.disable();
    }
  }

  hideDialog(): void {
    this.displayDialog = false;
    this.selectedFacility = undefined;
  }

  async saveFacility(): Promise<void> {
    this.formSubmitted = true;
    if (this.facilityForm.valid) {
      if (this.formMode === FormMode.Create) {
        this.confirmMessage = ConfirmMessages.CREATE_FACILITY;
        this.confirmMode = ConfirmMode.Create;
      } else if (this.formMode === FormMode.Update) {
        this.confirmMessage = ConfirmMessages.UPDATE_FACILITY;
        this.confirmMode = ConfirmMode.Update;
      }
      this.confirmDialog.message = this.confirmMessage;
      this.confirmDialog.show();

      try {
        await firstValueFrom(this.confirmDialog.confirmed);
        this.spinnerComponent.loading = true;
        const facility: Facility = this.facilityForm.getRawValue();
        let response: any = null;
        if (this.confirmMode === ConfirmMode.Create) {
          response = await this.facilityService.createFacility(facility);
        } else if (this.confirmMode === ConfirmMode.Update) {
          response = await this.facilityService.updateFacility(facility, facility.id);
        }
        this.spinnerComponent.loading = false;
        if (response && (response.statusCode === HttpStatus.Ok || response.statusCode === HttpStatus.Created)) {
          this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, response.message);
          this.getAllFacilities();
          this.hideDialog();
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

  async changeStatusFacility(facilityId: number, facility: Facility): Promise<void> {
    if (facility.isActive) {
      this.confirmDialog.message = ConfirmMessages.DISABLE_FACILITY;
    } else {
      this.confirmDialog.message = ConfirmMessages.ACTIVATE_FACILITY;
    }
    this.confirmDialog.show();

    try {
      await firstValueFrom(this.confirmDialog.confirmed);
      this.spinnerComponent.loading = true;
      let changeFacilityIsActive = this.changeIsActive(facility);

      const response: ApiResponse<Facility> = await this.facilityService.changeStatusFacility(facilityId, changeFacilityIsActive);
      this.spinnerComponent.loading = false;

      if (response && response.statusCode === HttpStatus.Ok) {
        this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, response.message);
        this.getAllFacilities();
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
    }
    this.confirmMode = null;

    try {
      await firstValueFrom(this.confirmDialog.rejected);
      if (facility.isActive) {
        this.toastComponent.showMessage(ToastSeverities.INFO, ToastSummaries.CANCELED, ToastMessages.DEACTIVATION_DELETION);
        this.confirmMode = null;
      } else {
        this.toastComponent.showMessage(ToastSeverities.INFO, ToastSummaries.CANCELED, ToastMessages.ACTIVATION_DELETION);
        this.confirmMode = null;
      }
    } catch (rejectError) {
      this.confirmMode = null;
    }
  }

  changeIsActive(objeto: any) {
    if (objeto && typeof objeto === 'object' && 'isActive' in objeto) {
      objeto.isActive = !objeto.isActive;
    }
    return objeto;
  }

  async deleteFacility(facilityId: number): Promise<void> {
    this.confirmDialog.message = ConfirmMessages.DELETE_FACILITY;
    this.confirmDialog.show();

    try {
      await firstValueFrom(this.confirmDialog.confirmed);
      this.spinnerComponent.loading = true;

      const response: ApiResponse<Facility> = await this.facilityService.deleteFacility(facilityId);
      this.spinnerComponent.loading = false;

      if (response && response.statusCode === HttpStatus.Ok) {
        this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, response.message);
        this.getAllFacilities();
      } else if (response) {
        this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, response.message);
      }
      this.confirmMode = null;
    } catch (error: any) {
      this.spinnerComponent.loading = false;
      if (error && error.error && error.error.message) {
        this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, error.error.message);
        this.confirmMode = null;
      } else {
        this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, ToastMessages.UNEXPECTED_ERROR);
        this.confirmMode = null;
      }
    }
    this.confirmMode = null;
    try {
      await firstValueFrom(this.confirmDialog.rejected);
      this.toastComponent.showMessage(ToastSeverities.INFO, ToastSummaries.CANCELED, ToastMessages.CANCELED_DELETION);
    } catch (rejectError) {
      this.confirmMode = null;
    }
  }

}
