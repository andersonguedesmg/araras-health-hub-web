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
  selector: 'app-destination-list',
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
  templateUrl: './destination-list.component.html',
  styleUrl: './destination-list.component.scss'
})
export class DestinationListComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Administração' }, { label: 'Destinos' }, { label: 'Listagem' },];

  destinations!: any[];

  destination!: any;

  selectedDestinations!: any | null;

  cols!: Column[];

  selectedColumns!: Column[];

  exportColumns!: ExportColumn[];

  constructor(
    private cd: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.loadDemoData();

    this.destinations = [
      {
        id: 1,
        description: 'UBS Ênio Vitalli',
        cep: '13604-066',
        address: 'Rua Franca',
        number: '99',
        neighborhood: 'Jd. Piratininga',
        city: 'Araras',
        email: 'email@email.com',
        phone: '(19) 3544-4280',
        isActive: true,
      },
      {
        id: 2,
        description: 'UPA Elisa Sbrissa Franchozza',
        cep: '13606-414',
        address: 'Av. Irineu Carrocci',
        number: '400',
        neighborhood: 'José Ometto II',
        city: 'Araras',
        email: 'email@email.com',
        phone: '(19) 3543-5100',
        isActive: true,
      },
      {
        id: 3,
        description: 'Farmácia de Alto Custo',
        cep: '13600-710',
        address: 'Rua Brasília',
        number: '295',
        neighborhood: 'Centro',
        city: 'Araras',
        email: 'email@email.com',
        phone: '(19) 3551-1096',
        isActive: false,
      },
      {
        id: 4,
        description: 'SAMU',
        cep: '13600-001',
        address: 'Avenida Dona Renata',
        number: '4585',
        neighborhood: 'Centro',
        city: 'Araras',
        email: 'email@email.com',
        phone: '(19) 3541-6819',
        isActive: true,
      },
      {
        id: 5,
        description: 'PSF Edmundo Ulson',
        cep: '13606-652',
        address: 'Rua Ângelo Francato',
        number: '393',
        neighborhood: 'Parque Tiradentes',
        city: 'Araras',
        email: 'email@email.com',
        phone: '(19) 3544-5232',
        isActive: true,
      },
      {
        id: 6,
        description: 'PSF Nilton De Lollo',
        cep: '13604-044',
        address: 'Rua Catanduva',
        number: '253',
        neighborhood: 'Jd. São João',
        city: 'Araras',
        email: 'email@email.com',
        phone: '(19) 3544-7302',
        isActive: true,
      },
      {
        id: 7,
        description: 'UBS Ênio Vitalli',
        cep: '13604-066',
        address: 'Rua Franca',
        number: '99',
        neighborhood: 'Jd. Piratininga',
        city: 'Araras',
        email: 'email@email.com',
        phone: '(19) 3544-4280',
        isActive: true,
      },
      {
        id: 8,
        description: 'UPA Elisa Sbrissa Franchozza',
        cep: '13606-414',
        address: 'Av. Irineu Carrocci',
        number: '400',
        neighborhood: 'José Ometto II',
        city: 'Araras',
        email: 'email@email.com',
        phone: '(19) 3543-5100',
        isActive: true,
      },
      {
        id: 9,
        description: 'Farmácia de Alto Custo',
        cep: '13600-710',
        address: 'Rua Brasília',
        number: '295',
        neighborhood: 'Centro',
        city: 'Araras',
        email: 'email@email.com',
        phone: '(19) 3551-1096',
        isActive: true,
      },
      {
        id: 10,
        description: 'SAMU',
        cep: '13600-001',
        address: 'Avenida Dona Renata',
        number: '4585',
        neighborhood: 'Centro',
        city: 'Araras',
        email: 'email@email.com',
        phone: '(19) 3541-6819',
        isActive: false,
      },
      {
        id: 11,
        description: 'PSF Edmundo Ulson',
        cep: '13606-652',
        address: 'Rua Ângelo Francato',
        number: '393',
        neighborhood: 'Parque Tiradentes',
        city: 'Araras',
        email: 'email@email.com',
        phone: '(19) 3544-5232',
        isActive: true,
      },
      {
        id: 12,
        description: 'PSF Nilton De Lollo',
        cep: '13604-044',
        address: 'Rua Catanduva',
        number: '253',
        neighborhood: 'Jd. São João',
        city: 'Araras',
        email: 'email@email.com',
        phone: '(19) 3544-7302',
        isActive: true,
      },
      {
        id: 13,
        description: 'UBS Ênio Vitalli',
        cep: '13604-066',
        address: 'Rua Franca',
        number: '99',
        neighborhood: 'Jd. Piratininga',
        city: 'Araras',
        email: 'email@email.com',
        phone: '(19) 3544-4280',
        isActive: true,
      },
      {
        id: 14,
        description: 'UPA Elisa Sbrissa Franchozza',
        cep: '13606-414',
        address: 'Av. Irineu Carrocci',
        number: '400',
        neighborhood: 'José Ometto II',
        city: 'Araras',
        email: 'email@email.com',
        phone: '(19) 3543-5100',
        isActive: true,
      },
      {
        id: 15,
        description: 'Farmácia de Alto Custo',
        cep: '13600-710',
        address: 'Rua Brasília',
        number: '295',
        neighborhood: 'Centro',
        city: 'Araras',
        email: 'email@email.com',
        phone: '(19) 3551-1096',
        isActive: false,
      },
      {
        id: 16,
        description: 'SAMU',
        cep: '13600-001',
        address: 'Avenida Dona Renata',
        number: '4585',
        neighborhood: 'Centro',
        city: 'Araras',
        email: 'email@email.com',
        phone: '(19) 3541-6819',
        isActive: true,
      },
      {
        id: 17,
        description: 'PSF Edmundo Ulson',
        cep: '13606-652',
        address: 'Rua Ângelo Francato',
        number: '393',
        neighborhood: 'Parque Tiradentes',
        city: 'Araras',
        email: 'email@email.com',
        phone: '(19) 3544-5232',
        isActive: true,
      },
      {
        id: 18,
        description: 'PSF Nilton De Lollo',
        cep: '13604-044',
        address: 'Rua Catanduva',
        number: '253',
        neighborhood: 'Jd. São João',
        city: 'Araras',
        email: 'email@email.com',
        phone: '(19) 3544-7302',
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
      { field: 'id', header: 'Id', customExportHeader: 'Product Code' },
      { field: 'description', header: 'Descrição' },
      { field: 'address', header: 'Endereço' },
      { field: 'number', header: 'Número' },
      { field: 'neighborhood', header: 'Bairro' },
      { field: 'city', header: 'Cidade' },
      { field: 'cep', header: 'CEP' },
      { field: 'email', header: 'E-mail' },
      { field: 'phone', header: 'Telefone' },
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
}
