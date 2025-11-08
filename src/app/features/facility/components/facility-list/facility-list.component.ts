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
import { InputMaskModule } from 'primeng/inputmask';
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
    InputMaskModule,
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
    'address.cep': 'CEP',
    'address.street': 'Endereço',
    'address.number': 'Número',
    'address.complement': 'Complemento',
    'address.neighborhood': 'Bairro',
    'address.city': 'Cidade',
    'address.state': 'Estado',
    'contact.email': 'E-mail',
    'contact.phone': 'Telefone',
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
      address: this.fb.group({
        street: ['', Validators.required],
        number: ['', Validators.required],
        complement: [''],
        neighborhood: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        cep: ['', Validators.required],
      }),
      contact: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
      }),
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
    await this.exportData(
      (searchTerm) => this.facilityService.exportFacilities(searchTerm),
      'unidades.csv',
      this.searchTerm
    );
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
      this.facilityForm.get('address.street')?.enable();
      this.facilityForm.get('address.number')?.enable();
      this.facilityForm.get('address.complement')?.enable();
      this.facilityForm.get('address.neighborhood')?.enable();
      this.facilityForm.get('address.city')?.enable();
      this.facilityForm.get('address.state')?.enable();
      this.facilityForm.get('address.cep')?.enable();
      this.facilityForm.get('contact.email')?.enable();
      this.facilityForm.get('contact.phone')?.enable();
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
    const addressGroup = this.facilityForm.get('address') as FormGroup;
    const cepControl = addressGroup.get('cep');
    if (!cepControl?.value || cepControl.invalid) {
      return;
    }

    this.isLoading = true;
    const success = await this.formHelperService.bindAddressByCep(addressGroup, this.toastService);

    this.updateFormState();
    this.isLoading = false;

    if (success) {
      document.getElementById('number')?.focus();
    }
  }
}
