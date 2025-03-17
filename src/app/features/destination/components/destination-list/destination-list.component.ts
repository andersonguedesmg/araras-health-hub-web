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

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}

interface ExportColumn {
  title: string;
  dataKey: string;
}

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

  itemsBreadcrumb: MenuItem[] = [{ label: 'Administração' }, { label: 'Destinos' }];

  destinations: Destination[] = [];
  selectedDestinations?: Destination;
  destinationForm: FormGroup;
  formMode: 'create' | 'update' | 'detail' = 'create';
  displayDialog = false;
  formSubmitted = false;

  confirmMode: 'create' | 'update' | null = null;
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
    this.loadDemoData();
  }

  ngAfterViewInit(): void {
    this.getAllDestinations();
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  loadDemoData() {
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
        if (response.statusCode === 200) {
          this.destinations = response.data;
        } else {
          this.toastComponent.showMessage('error', 'Erro', response.message);
        }
      }, error: (error) => {
        this.spinnerComponent.loading = false;
        this.toastComponent.showMessage('error', 'Erro', error);
      },
    });
  }

  openForm(mode: 'create' | 'update' | 'detail', destination?: Destination): void {
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
    const isDetail = this.formMode === 'detail';
    const isUpdate = this.formMode === 'update';

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
      if (this.formMode === 'create') {
        this.confirmMessage = 'Tem certeza que deseja cadastrar este destino?';
        this.confirmMode = 'create';
      } else if (this.formMode === 'update') {
        this.confirmMessage = 'Tem certeza que deseja atualizar este destino?';
        this.confirmMode = 'update';
      }
      this.confirmDialog.message = this.confirmMessage;
      this.confirmDialog.confirmed.subscribe(() => {
        this.spinnerComponent.loading = true;
        const destination: Destination = this.destinationForm.getRawValue();
        if (this.confirmMode === 'create') {
          this.destinationService.createDestination(destination).subscribe(this.handleResponse());
        } else if (this.confirmMode === 'update') {
          this.destinationService.updateDestination(destination, destination.id).subscribe(this.handleResponse());
        }
      });
      this.confirmDialog.rejected.subscribe(() => {
        this.confirmMode = null;
      });
      this.confirmDialog.show();
    } else {
      this.toastComponent.showMessage('error', 'Erro', 'Preencha todos os campos obrigatórios.');
    }
  }

  changeStatusDestination(destinationId: number, destination: Destination): void {
    this.confirmDialog.message = 'Tem certeza que deseja excluir este destino?';
    this.confirmDialog.confirmed.subscribe(() => {
      this.spinnerComponent.loading = true;
      let changeDestinationIsActive = this.changeIsActive(destination);
      this.destinationService.changeStatusDestination(destinationId, changeDestinationIsActive).subscribe({
        next: (response: ApiResponse<Destination[]>) => {
          this.spinnerComponent.loading = false;
          if (response.statusCode === 200) {
            this.toastComponent.showMessage('success', 'Sucesso', response.message);
            this.getAllDestinations();
          } else {
            this.toastComponent.showMessage('error', 'Erro', response.message);
          }
        }, error: (error) => {
          this.spinnerComponent.loading = false;
          this.toastComponent.showMessage('error', 'Erro', error);
        },
      });
    });
    this.confirmDialog.rejected.subscribe(() => {
      this.toastComponent.showMessage('info', 'Cancelado', 'Exclusão cancelada.');
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
    this.confirmDialog.message = 'Tem certeza que deseja excluir este destino?';
    this.confirmDialog.confirmed.subscribe(() => {
      this.spinnerComponent.loading = true;
      this.destinationService.deleteDestination(destinationId).subscribe({
        next: () => {
          this.toastComponent.showMessage('success', 'Sucesso', 'Destino excluído com sucesso.');
          this.getAllDestinations();
        },
        error: (error) => {
          this.toastComponent.showMessage('error', 'Erro', 'Erro ao excluir destino.');
          this.spinnerComponent.loading = false;
        },
      });
    });
    this.confirmDialog.rejected.subscribe(() => {
      this.toastComponent.showMessage('info', 'Cancelado', 'Exclusão cancelada.');
    });
    this.confirmDialog.show();
  }

  handleResponse(): any {
    return {
      next: () => {
        this.spinnerComponent.loading = false;
        this.toastComponent.showMessage('success', 'Sucesso', `Destino ${this.formMode === 'create' ? 'cadastrado' : 'atualizado'} com sucesso.`);
        this.getAllDestinations();
        this.hideDialog();
      }, error: (error: any) => {
        this.spinnerComponent.loading = false;
        this.toastComponent.showMessage('error', 'Erro', `Erro ao ${this.formMode === 'create' ? 'cadastrar' : 'atualizar'} destino.`);
        console.error(`Erro ao ${this.formMode === 'create' ? 'cadastrar' : 'atualizar'} destino:`, error);
      },
    };
  }
}
