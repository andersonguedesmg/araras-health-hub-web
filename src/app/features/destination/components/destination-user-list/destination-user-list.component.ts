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
  selector: 'app-destination-user-list',
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
  templateUrl: './destination-user-list.component.html',
  styleUrl: './destination-user-list.component.scss'
})
export class DestinationUserListComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Administração' }, { label: 'Clientes' }, { label: 'Listagem' },];

  customers!: any[];

  customer!: any;

  selectedCustomer!: any | null;

  cols!: Column[];

  selectedColumns!: Column[];

  exportColumns!: ExportColumn[];

  constructor(
    private cd: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.loadDemoData();

    this.customers = [
      {
        id: 1,
        name: 'admin_enio',
        password: 'A2H@Mudar',
        idDestination: 'UBS Ênio Vitalli',
        accessLevel: 'Administrador',
        isActive: true,
      },
      {
        id: 2,
        name: 'user_enio',
        password: 'A2H@Mudar',
        idDestination: 'UBS Ênio Vitalli',
        accessLevel: 'Usuário',
        isActive: true,
      },
      {
        id: 3,
        name: 'user_enio2',
        password: 'A2H@Mudar',
        idDestination: 'UBS Ênio Vitalli',
        accessLevel: 'Usuário',
        isActive: false,
      },
      {
        id: 4,
        name: 'admin_elisa',
        password: 'A2H@Mudar',
        idDestination: 'UPA Elisa Sbrissa Franchozza',
        accessLevel: 'Administrador',
        isActive: true,
      },
      {
        id: 5,
        name: 'user_elisa',
        password: 'A2H@Mudar',
        idDestination: 'UPA Elisa Sbrissa Franchozza',
        accessLevel: 'Usuário',
        isActive: true,
      },
      {
        id: 6,
        name: 'user_elisa2',
        password: 'A2H@Mudar',
        idDestination: 'UPA Elisa Sbrissa Franchozza',
        accessLevel: 'Usuário',
        isActive: true,
      },
      {
        id: 7,
        name: 'admin_altoc',
        password: 'A2H@Mudar',
        idDestination: 'Farmácia de Alto Custo',
        accessLevel: 'Administrador',
        isActive: true,
      },
      {
        id: 8,
        name: 'user_altoc',
        password: 'A2H@Mudar',
        idDestination: 'Farmácia de Alto Custo',
        accessLevel: 'Usuário',
        isActive: true,
      },
      {
        id: 9,
        name: 'user_samu',
        password: 'A2H@Mudar',
        idDestination: 'SAMU',
        accessLevel: 'Usuário',
        isActive: true,
      },
      {
        id: 10,
        name: 'admin_samu',
        password: 'A2H@Mudar',
        idDestination: 'SAMU',
        accessLevel: 'Administrador',
        isActive: true,
      },
      {
        id: 11,
        name: 'user_samu2',
        password: 'A2H@Mudar',
        idDestination: 'SAMU',
        accessLevel: 'Usuário',
        isActive: false,
      },
      {
        id: 12,
        name: 'admin_edmundo',
        password: 'A2H@Mudar',
        idDestination: 'PSF Edmundo Ulson',
        accessLevel: 'Administrador',
        isActive: true,
      },
      {
        id: 13,
        name: 'user_edmundo',
        password: 'A2H@Mudar',
        idDestination: 'PSF Edmundo Ulson',
        accessLevel: 'Usuário',
        isActive: false,
      },
      {
        id: 14,
        name: 'user_edmundo2',
        password: 'A2H@Mudar',
        idDestination: 'PSF Edmundo Ulson',
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
      { field: 'idDestination', header: 'Função' },
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
    }
  }
}
