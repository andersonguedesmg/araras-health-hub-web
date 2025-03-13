import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { AccountService } from '../../services/account.service';
import { Account } from '../../interfaces/account';
import { ApiResponse } from '../../../../shared/interfaces/apiResponse';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';

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
  selector: 'app-account-list',
  imports: [
    BreadcrumbComponent,
    CommonModule,
    RouterModule,
    TableModule,
    ToastModule,
    ToolbarModule,
    ButtonModule,
    FormsModule,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
    Tag,
    ToastComponent,
    SpinnerComponent,
  ],
  providers: [MessageService],
  templateUrl: './account-list.component.html',
  styleUrl: './account-list.component.scss'
})
export class AccountListComponent {
  @ViewChild('dt') dt!: Table;
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(SpinnerComponent) spinnerComponent!: SpinnerComponent;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Administração' }, { label: 'Clientes' }, { label: 'Listagem' },];

  accounts!: Account[];

  account!: Account;

  selectedAccount!: Account | null;

  cols!: Column[];

  selectedColumns!: Column[];

  exportColumns!: ExportColumn[];

  constructor(private cd: ChangeDetectorRef, private accountService: AccountService) { }

  ngOnInit() {
    this.loadDemoData();
  }

  ngAfterViewInit(): void {
    this.getAllAccounts();
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  loadDemoData() {
    this.cd.markForCheck();

    this.cols = [
      { field: 'id', header: 'ID', customExportHeader: 'CÓDIGO DO CLIENTE' },
      { field: 'name', header: 'NOME' },
      { field: 'password', header: 'SENHA' },
      { field: 'destination', header: 'DESTINO' },
      { field: 'accessLevel', header: 'TIPO' },
      { field: 'isActive', header: 'STATUS' },
    ];

    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));

    this.selectedColumns = this.cols;
  }

  getSeverity(status: boolean): any {
    switch (status) {
      case true:
        return 'success';
      case false:
        return 'danger';
    }
  }

  getStatus(status: boolean): any {
    switch (status) {
      case true:
        return 'Ativo';
      case false:
        return 'Inativo';
    }
  }

  getAccessLevel(status: string): any {
    switch (status) {
      case 'Administrador':
        return 'success';
      case 'Usuário':
        return 'info';
    }
  }

  getAllAccounts(): void {
    this.spinnerComponent.loading = true;
    this.accountService.getAllAccounts().subscribe({
      next: (response: ApiResponse<Account[]>) => {
        this.spinnerComponent.loading = false;
        if (response.statusCode === 200) {
          this.accounts = response.data;
          this.toastComponent.showMessage('success', 'Sucesso', response.message);
        } else {
          this.toastComponent.showMessage('error', 'Erro', response.message);
        }
      }, error: (error) => {
        this.spinnerComponent.loading = false;
        this.toastComponent.showMessage('error', 'Erro', error);
      },
    });
  }
}
