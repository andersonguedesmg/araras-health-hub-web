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
import { ApiResponse } from '../../../../shared/interfaces/apiResponse';
import { Destination } from '../../interfaces/destination';
import { DestinationService } from '../../services/destination.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';

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
    ToastComponent,
    SpinnerComponent,
  ],
  providers: [MessageService],
  templateUrl: './destination-list.component.html',
  styleUrl: './destination-list.component.scss'
})
export class DestinationListComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(SpinnerComponent) spinnerComponent!: SpinnerComponent;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Administração' }, { label: 'Destinos' }, { label: 'Listagem' },];

  destinations!: Destination[];

  destination!: Destination;

  selectedDestinations!: Destination | null;

  cols!: Column[];

  selectedColumns!: Column[];

  exportColumns!: ExportColumn[];

  constructor(private cd: ChangeDetectorRef, private destinationService: DestinationService) { }

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

  getAllDestinations(): void {
    this.spinnerComponent.loading = true;
    this.destinationService.getAllDestinations().subscribe({
      next: (response: ApiResponse<Destination[]>) => {
        this.spinnerComponent.loading = false;
        if (response.statusCode === 200) {
          this.destinations = response.data;
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
