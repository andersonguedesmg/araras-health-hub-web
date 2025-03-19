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
import { ApiResponse } from '../../../../shared/interfaces/apiResponse';
import { ToastSeverities, ToastSummaries } from '../../../../shared/constants/toast.constants';
import { ToastMessages } from '../../../../shared/constants/messages.constants';
import { getSeverity, getStatus } from '../../../../shared/utils/status.utils';
import { Column, ExportColumn } from '../../../../shared/utils/p-table.utils';

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

  destination!: Destination;
  accountUsers: Account[] = [];

  cols!: Column[];
  selectedColumns!: Column[];
  exportColumns!: ExportColumn[];

  getSeverity = getSeverity;
  getStatus = getStatus;

  constructor(private cd: ChangeDetectorRef, private destinationService: DestinationService) { }

  ngOnInit() { }

  ngAfterViewInit(): void {
    this.getDestinationById();
  }

  async getDestinationById(): Promise<void> {
    const destinationId = localStorage.getItem('destinationId');
    if (!destinationId) {
      this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, ToastMessages.DESTINATION_NOTFOUND);
      return;
    }
    this.spinnerComponent.loading = true;

    try {
      const response: ApiResponse<Destination> = await this.destinationService.getDestinationById(
        parseInt(destinationId)
      );
      this.destination = response.data;
      this.accountUsers = response.data.accountUsers;
      this.spinnerComponent.loading = false;
    } catch (error: any) {
      this.spinnerComponent.loading = false;
      if (error && error.error && error.error.message) {
        this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, error.error.message);
      } else {
        this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, ToastMessages.UNEXPECTED_ERROR);
      }
    }
  }
}
