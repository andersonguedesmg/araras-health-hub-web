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
  selector: 'app-user-list',
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
  ],
  providers: [MessageService],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Administração' }, { label: 'Usuários' }, { label: 'Listagem' },];

  users!: any[];

  user!: any;

  selectedUser!: any | null;

  cols!: Column[];

  selectedColumns!: Column[];

  exportColumns!: ExportColumn[];

  constructor(
    private cd: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.loadDemoData();

    this.users = [
      {
        id: 1,
        name: 'Josiah Bartlet',
        password: 'A2H@Mudar',
        function: 'Auxiliar Administrativo',
        phone: '(19) 3544-4280',
        accessLevel: 'Administrador',
        isActive: true,
      },
      {
        id: 2,
        name: 'Josh Lyman',
        password: 'A2H@Mudar',
        function: 'Auxiliar Administrativo',
        phone: '(19) 3544-4280',
        accessLevel: 'Usuário',
        isActive: true,
      },
      {
        id: 3,
        name: 'Leo McGarry',
        password: 'A2H@Mudar',
        function: 'Auxiliar Administrativo',
        phone: '(19) 3544-4280',
        accessLevel: 'Convidado',
        isActive: false,
      },
      {
        id: 4,
        name: 'Toby Ziegler',
        password: 'A2H@Mudar',
        function: 'Auxiliar Administrativo',
        phone: '(19) 3544-4280',
        accessLevel: 'Usuário',
        isActive: true,
      },
      {
        id: 5,
        name: 'Sam Seaborn',
        password: 'A2H@Mudar',
        function: 'Auxiliar Administrativo',
        phone: '(19) 3544-4280',
        accessLevel: 'Usuário',
        isActive: true,
      },
      {
        id: 6,
        name: 'C. J. Cregg',
        password: 'A2H@Mudar',
        function: 'Auxiliar Administrativo',
        phone: '(19) 3544-4280',
        accessLevel: 'Usuário',
        isActive: true,
      },
      {
        id: 7,
        name: 'Donna Moss',
        password: 'A2H@Mudar',
        function: 'Auxiliar Administrativo',
        phone: '(19) 3544-4280',
        accessLevel: 'Convidado',
        isActive: true,
      },
      {
        id: 8,
        name: 'Matt Santos',
        password: 'A2H@Mudar',
        function: 'Auxiliar Administrativo',
        phone: '(19) 3544-4280',
        accessLevel: 'Usuário',
        isActive: true,
      },
      {
        id: 9,
        name: 'Kate Harper',
        password: 'A2H@Mudar',
        function: 'Auxiliar Administrativo',
        phone: '(19) 3544-4280',
        accessLevel: 'Usuário',
        isActive: true,
      },
      {
        id: 10,
        name: 'Aaron Sorkin',
        password: 'A2H@Mudar',
        function: 'Auxiliar Administrativo',
        phone: '(19) 3544-4280',
        accessLevel: 'Usuário',
        isActive: false,
      },
      {
        id: 11,
        name: 'Thomas Schlamme',
        password: 'A2H@Mudar',
        function: 'Auxiliar Administrativo',
        phone: '(19) 3544-4280',
        accessLevel: 'Convidado',
        isActive: true,
      },
      {
        id: 12,
        name: 'John Wells',
        password: 'A2H@Mudar',
        function: 'Auxiliar Administrativo',
        phone: '(19) 3544-4280',
        accessLevel: 'Usuário',
        isActive: true,
      },
      {
        id: 13,
        name: 'Abbey Bartlet',
        password: 'A2H@Mudar',
        function: 'Auxiliar Administrativo',
        phone: '(19) 3544-4280',
        accessLevel: 'Usuário',
        isActive: false,
      },
      {
        id: 14,
        name: 'Will Bailey',
        password: 'A2H@Mudar',
        function: 'Auxiliar Administrativo',
        phone: '(19) 3544-4280',
        accessLevel: 'Usuário',
        isActive: true,
      },
    ];
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  loadDemoData() {
    this.cd.markForCheck();

    this.cols = [
      { field: 'id', header: 'Id', customExportHeader: 'Código do Usuário' },
      { field: 'name', header: 'Nome' },
      { field: 'password', header: 'Senha' },
      { field: 'function', header: 'Função' },
      { field: 'phone', header: 'Telefone' },
      { field: 'accessLevel', header: 'Nível de Acesso' },
      { field: 'isActive', header: 'Ativo' },
    ];

    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));

    this.selectedColumns = this.cols;
  }

  getStatus(status: boolean): any {
    switch (status) {
      case true:
        return 'success';
      case false:
        return 'danger';
    }
  }

  getAccessLevel(status: string): any {
    switch (status) {
      case 'Administrador':
        return 'success';
      case 'Usuário':
        return 'info';
      case 'Convidado':
        return 'warn';
    }
  }
}
