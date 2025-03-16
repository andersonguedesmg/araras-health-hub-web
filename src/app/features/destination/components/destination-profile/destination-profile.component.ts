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
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Table } from 'primeng/table';
import { Destination } from '../../interfaces/destination';
import { DestinationService } from '../../services/destination.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';
import { Account } from '../../../account/interfaces/account';
import { Tag } from 'primeng/tag';

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
  selector: 'app-destination-profile',
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
  templateUrl: './destination-profile.component.html',
  styleUrl: './destination-profile.component.scss'
})
export class DestinationProfileComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(SpinnerComponent) spinnerComponent!: SpinnerComponent;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Administração' }, { label: 'Destinos' }, { label: 'Perfil' },];

  destinations!: Destination[];

  destination!: Destination;

  accountUsers: Account[] = [];

  selectedDestinations!: Destination | null;

  cols!: Column[];

  selectedColumns!: Column[];

  exportColumns!: ExportColumn[];

  constructor(private cd: ChangeDetectorRef, private destinationService: DestinationService) { }

  ngOnInit() { }

  ngAfterViewInit(): void {
    this.loadDestinationProfile();
  }

  loadDestinationProfile(): void {
    const destinationId = localStorage.getItem('destinationId');
    if (!destinationId) {
      this.toastComponent.showMessage('error', 'Erro', 'ID de destino não encontrado.');
      return;
    }
    this.spinnerComponent.loading = true;
    this.destinationService.getDestinationById(parseInt(destinationId)).subscribe({
      next: (response) => {
        this.destination = response.data;
        this.accountUsers = response.data.accountUsers;
        this.spinnerComponent.loading = false;
      },
      error: (error) => {
        this.spinnerComponent.loading = false;
        this.toastComponent.showMessage('error', 'Erro', 'Erro ao carregar detalhes do destino.');
        console.error('Erro ao carregar detalhes do destino:', error);
      },
    });
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
}
