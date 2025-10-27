import { Component, OnDestroy, OnInit } from '@angular/core';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
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
import { Facility } from '../../interfaces/facility';
import { FacilityService } from '../../services/facility.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ConfirmMode } from '../../../../shared/enums/confirm-mode.enum';
import { getSeverity, getStatus } from '../../../../shared/utils/status.utils';
import { StatusOptions } from '../../../../shared/constants/status-options.constants';
import { ConfirmMessages, ToastMessages } from '../../../../shared/constants/messages.constants';
import { debounceTime, firstValueFrom, Observable, Subject, Subscription, switchMap } from 'rxjs';
import { HasRoleDirective } from '../../../../core/directives/has-role.directive';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { TableHeaderComponent } from '../../../../shared/components/table-header/table-header.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { InputMask } from 'primeng/inputmask';
import { FormHelperService } from '../../../../core/services/form-helper.service';
import { BaseComponent } from '../../../../core/components/base/base.component';

@Component({
  selector: 'app-facility-list',
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
    InputMask,
    BreadcrumbComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
    TableComponent,
    DialogComponent,
    TableHeaderComponent,
    HasRoleDirective,
  ],
  providers: [MessageService],
  templateUrl: './facility-list.component.html',
  styleUrl: './facility-list.component.scss'
})
export class FacilityListComponent extends BaseComponent implements OnInit, OnDestroy {
  itemsBreadcrumb: MenuItem[] = [{ label: 'Administração' }, { label: 'Unidades' }];
  title: string = 'Unidades';

  FormMode = FormMode;
  ConfirmMode = ConfirmMode;
  statusOptions = StatusOptions;

  facilities$!: Observable<Facility[]>;
  selectedFacility?: Facility;
  facilityForm: FormGroup;
  formMode: FormMode.Create | FormMode.Update | FormMode.Detail = FormMode.Create;

  displayDialog = false;
  formSubmitted = false;

  confirmMode: ConfirmMode.Create | ConfirmMode.Update | null = null;
  confirmMessage = '';
  headerText = '';

  private formLabels: { [key: string]: string; } = {
    name: 'Nome da Unidade',
    cep: 'CEP',
    address: 'Endereço',
    number: 'Número',
    neighborhood: 'Bairro',
    city: 'Cidade',
    state: 'Estado',
    email: 'E-mail',
    phone: 'Telefone',
  };

  getSeverity = getSeverity;
  getStatus = getStatus;

  private searchTerm: string = '';
  private searchSubject = new Subject<string>();

  private loadLazy = new Subject<any>();
  private subscriptions: Subscription = new Subscription();
  totalRecords = 0;

  constructor(
    private facilityService: FacilityService,
    private fb: FormBuilder,
    private formHelperService: FormHelperService,
  ) {
    super();
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
    this.facilities$ = this.facilityService.facilities$;
    this.subscriptions.add(
      this.loadLazy
        .pipe(
          debounceTime(300),
          switchMap(event => {
            this.isLoading = true;
            const pageNumber = event.first / event.rows + 1;
            const pageSize = event.rows;
            return this.facilityService.loadFacilities(pageNumber, pageSize, this.searchTerm);
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
        this.loadFacilities({ first: 0, rows: 5 });
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadFacilities(event: any) {
    this.loadLazy.next(event);
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  async exportFacilities(): Promise<void> {
    this.isLoading = true;
    try {
      const response = await firstValueFrom(this.facilityService.exportFacilities(this.searchTerm));
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'unidade.csv';
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

  openForm(mode: FormMode.Create | FormMode.Update | FormMode.Detail, facility?: Facility): void {
    this.facilityForm.reset();
    this.formSubmitted = false; this.formMode = mode;
    this.selectedFacility = facility;
    this.displayDialog = true;
    this.initializeForm();
    if (mode === FormMode.Create) {
      this.headerText = 'Nova Unidade';
    } else if (mode === FormMode.Update) {
      this.headerText = 'Editar Unidade';
    } else {
      this.headerText = 'Detalhes da Unidade';
    }
  }

  initializeForm(): void {
    this.facilityForm.reset();
    if (this.selectedFacility) {
      this.facilityForm.patchValue(this.selectedFacility);
    }
    this.updateFormState();
  }

  updateFormState(): void {
    this.facilityForm.disable();

    const isCreate = this.formMode === FormMode.Create;
    const isUpdate = this.formMode === FormMode.Update;

    if (isCreate || isUpdate) {
      this.facilityForm.get('name')?.enable();
      this.facilityForm.get('cnpj')?.enable();
      this.facilityForm.get('address')?.enable();
      this.facilityForm.get('number')?.enable();
      this.facilityForm.get('neighborhood')?.enable();
      this.facilityForm.get('city')?.enable();
      this.facilityForm.get('state')?.enable();
      this.facilityForm.get('cep')?.enable();
      this.facilityForm.get('email')?.enable();
      this.facilityForm.get('phone')?.enable();
    }

    if (isCreate) {
      this.facilityForm.get('isActive')?.setValue(true);
      this.facilityForm.get('isActive')?.disable();
    }
  }

  hideDialog(): void {
    this.displayDialog = false;
    this.selectedFacility = undefined;
  }

  async saveFacility(): Promise<void> {
    this.formSubmitted = true;
    if (this.validateForm()) {
      const confirmMsg = this.formMode === FormMode.Create ? ConfirmMessages.CREATE_FACILITY : ConfirmMessages.UPDATE_FACILITY;
      const facility = this.facilityForm.getRawValue();
      const apiCall = this.formMode === FormMode.Create
        ? firstValueFrom(this.facilityService.createFacility(facility))
        : firstValueFrom(this.facilityService.updateFacility(facility, facility.id));
      await this.handleApiCall(apiCall, confirmMsg, ToastMessages.SUCCESS_OPERATION);
      this.hideDialog();
    }
  }

  async changeStatusFacility(facilityId: number, facility: Facility): Promise<void> {
    const confirmMsg = facility.isActive ? ConfirmMessages.DISABLE_FACILITY : ConfirmMessages.ACTIVATE_FACILITY;
    const changeFacilityIsActive = this.changeIsActive(facility);
    const apiCall = firstValueFrom(this.facilityService.changeStatusFacility(facilityId, changeFacilityIsActive));
    await this.handleApiCall(apiCall, confirmMsg, ToastMessages.SUCCESS_OPERATION);
  }

  async deleteFacility(facilityId: number): Promise<void> {
    const apiCall = firstValueFrom(this.facilityService.deleteFacility(facilityId));
    await this.handleApiCall(apiCall, ConfirmMessages.DELETE_FACILITY, ToastMessages.SUCCESS_OPERATION);
  }

  private validateForm(): boolean {
    return this.validateFormAndShowErrors(this.facilityForm, this.formHelperService, this.formLabels);
  }

  async searchCep(): Promise<void> {
    this.isLoading = true;
    const success = await this.formHelperService.bindAddressByCep(this.facilityForm, this.toastService);
    this.updateFormState();
    this.isLoading = false;
    if (success) {
      document.getElementById('number')?.focus();
    }
  }
}
