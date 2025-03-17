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
import { DialogModule } from 'primeng/dialog';
import { InputMask } from 'primeng/inputmask';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { Table } from 'primeng/table';
import { User } from '../../interfaces/user';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { UserService } from '../../services/user.service';
import { ApiResponse } from '../../../../shared/interfaces/apiResponse';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { getSeverity, getStatus } from '../../../../shared/utils/status.utils';
import { Column, ExportColumn } from '../../../../shared/utils/p-table.utils';

@Component({
  selector: 'app-user-list',
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
    InputMask,
    Tag,
    DialogModule,
    DropdownModule,
    ToastComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
  ],
  providers: [MessageService],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(SpinnerComponent) spinnerComponent!: SpinnerComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Administração' }, { label: 'Usuários' }];

  users: User[] = [];
  selectedUser?: User;
  userForm: FormGroup;
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

  constructor(private cd: ChangeDetectorRef, private userService: UserService, private fb: FormBuilder) {
    this.userForm = this.fb.group({
      id: [{ value: null, disabled: true }],
      name: ['', Validators.required],
      cpf: ['', Validators.required],
      function: ['', Validators.required],
      phone: ['', Validators.required],
      isActive: [{ value: false, disabled: true }],
    });
  }

  ngOnInit() {
    this.loadDemoData();
  }

  ngAfterViewInit(): void {
    this.getAllUsers();
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  loadDemoData() {
    this.cd.markForCheck();

    this.cols = [
      { field: 'id', header: 'ID', customExportHeader: 'CÓDIGO DO USUÁRIO' },
      { field: 'name', header: 'NOME' },
      { field: 'cpf', header: 'CPF' },
      { field: 'function', header: 'FUNÇÃO' },
      { field: 'phone', header: 'TELEFONE' },
      { field: 'isActive', header: 'STATUS' },
    ];

    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));

    this.selectedColumns = this.cols;
  }

  getAllUsers(): void {
    this.spinnerComponent.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (response: ApiResponse<User[]>) => {
        this.spinnerComponent.loading = false;
        if (response.statusCode === 200) {
          this.users = response.data;
        } else {
          this.toastComponent.showMessage('error', 'Erro', response.message);
        }
      }, error: (error) => {
        this.spinnerComponent.loading = false;
        this.toastComponent.showMessage('error', 'Erro', error);
      },
    });
  }

  openForm(mode: 'create' | 'update' | 'detail', user?: User): void {
    this.formMode = mode;
    this.selectedUser = user;
    this.displayDialog = true;
    this.initializeForm();
  }

  initializeForm(): void {
    this.userForm.reset();
    if (this.selectedUser) {
      this.userForm.patchValue(this.selectedUser);
    }
    this.updateFormState();
  }

  updateFormState(): void {
    const isDetail = this.formMode === 'detail';
    const isUpdate = this.formMode === 'update';

    this.userForm.get('name')?.disable();
    this.userForm.get('cpf')?.disable();
    this.userForm.get('function')?.disable();
    this.userForm.get('phone')?.disable();
    this.userForm.get('isActive')?.disable();

    if (this.formMode === 'create') {
      this.userForm.get('isActive')?.setValue(true);
      this.userForm.get('isActive')?.disable();
      this.userForm.get('name')?.enable();
      this.userForm.get('cpf')?.enable();
      this.userForm.get('function')?.enable();
      this.userForm.get('phone')?.enable();
    } else if (isUpdate) {
      this.userForm.get('name')?.enable();
      this.userForm.get('cpf')?.enable();
      this.userForm.get('function')?.enable();
      this.userForm.get('phone')?.enable();
    }

    if (!isDetail && !isUpdate) {
      this.userForm.get('isActive')?.disable();
    }
    if (isDetail) {
      this.userForm.get('isActive')?.disable();
    }
  }

  hideDialog(): void {
    this.displayDialog = false;
    this.selectedUser = undefined;
  }

  saveUser(): void {
    this.formSubmitted = true;
    if (this.userForm.valid) {
      if (this.formMode === 'create') {
        this.confirmMessage = 'Tem certeza que deseja cadastrar este usuário?';
        this.confirmMode = 'create';
      } else if (this.formMode === 'update') {
        this.confirmMessage = 'Tem certeza que deseja atualizar este usuário?';
        this.confirmMode = 'update';
      }
      this.confirmDialog.message = this.confirmMessage;
      this.confirmDialog.confirmed.subscribe(() => {
        this.spinnerComponent.loading = true;
        const user: User = this.userForm.getRawValue();
        if (this.confirmMode === 'create') {
          this.userService.createUser(user).subscribe(this.handleResponse());
        } else if (this.confirmMode === 'update') {
          this.userService.updateUser(user, user.id).subscribe(this.handleResponse());
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

  changeStatusUser(userId: number, user: User): void {
    this.confirmDialog.message = 'Tem certeza que deseja excluir este usuário?';
    this.confirmDialog.confirmed.subscribe(() => {
      this.spinnerComponent.loading = true;
      let changeUserIsActive = this.changeIsActive(user);
      this.userService.changeStatusUser(userId, changeUserIsActive).subscribe({
        next: (response: ApiResponse<User[]>) => {
          this.spinnerComponent.loading = false;
          if (response.statusCode === 200) {
            this.toastComponent.showMessage('success', 'Sucesso', response.message);
            this.getAllUsers();
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

  deleteUser(userId: number): void {
    this.confirmDialog.message = 'Tem certeza que deseja excluir este usuário?';
    this.confirmDialog.confirmed.subscribe(() => {
      this.spinnerComponent.loading = true;
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.toastComponent.showMessage('success', 'Sucesso', 'Usuário excluído com sucesso.');
          this.getAllUsers();
        },
        error: (error) => {
          this.toastComponent.showMessage('error', 'Erro', 'Erro ao excluir usuário.');
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
        this.toastComponent.showMessage('success', 'Sucesso', `Usuário ${this.formMode === 'create' ? 'cadastrado' : 'atualizado'} com sucesso.`);
        this.getAllUsers();
        this.hideDialog();
      }, error: (error: any) => {
        this.spinnerComponent.loading = false;
        this.toastComponent.showMessage('error', 'Erro', `Erro ao ${this.formMode === 'create' ? 'cadastrar' : 'atualizar'} usuário.`);
        console.error(`Erro ao ${this.formMode === 'create' ? 'cadastrar' : 'atualizar'} usuário:`, error);
      },
    };
  }
}
