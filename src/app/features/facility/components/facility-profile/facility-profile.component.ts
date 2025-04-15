import { Component, OnInit, ViewChild } from '@angular/core';
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
import { Facility } from '../../interfaces/facility';
import { FacilityService } from '../../services/facility.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';
import { Account } from '../../../account/interfaces/account';
import { Tag } from 'primeng/tag';
import { ApiResponse } from '../../../../shared/interfaces/apiResponse';
import { ToastSeverities, ToastSummaries } from '../../../../shared/constants/toast.constants';
import { ToastMessages } from '../../../../shared/constants/messages.constants';
import { getSeverity, getStatus } from '../../../../shared/utils/status.utils';
import { Column, ExportColumn } from '../../../../shared/utils/p-table.utils';
import { getRoleSeverity, getRoleValue, getRoleValueId } from '../../../../shared/utils/roles.utils';
import { AccountService } from '../../../account/services/account.service';

@Component({
  selector: 'app-facility-profile',
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
  templateUrl: './facility-profile.component.html',
  styleUrl: './facility-profile.component.scss'
})
export class FacilityProfileComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(SpinnerComponent) spinnerComponent!: SpinnerComponent;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Administração' }, { label: 'Unidade' }, { label: 'Perfil' },];

  facility!: Facility;
  accountUsers: any;

  cols!: Column[];
  selectedColumns!: Column[];
  exportColumns!: ExportColumn[];

  getSeverity = getSeverity;
  getStatus = getStatus;
  getRoleSeverity = getRoleSeverity;
  getRoleValue = getRoleValue;
  getRoleValueId = getRoleValueId;

  constructor(private facilityService: FacilityService, private accountService: AccountService) { }

  ngOnInit() { }

  ngAfterViewInit(): void {
    this.getFacilityById();
    this.getByFacilityId();
  }

  async getFacilityById(): Promise<void> {
    const facilityId = localStorage.getItem('facilityId');
    if (!facilityId) {
      this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, ToastMessages.FACILITY_NOTFOUND);
      return;
    }
    this.spinnerComponent.loading = true;

    try {
      const response: ApiResponse<Facility> = await this.facilityService.getFacilityById(
        parseInt(facilityId)
      );
      this.facility = response.data;
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

  async getByFacilityId(): Promise<void> {
    const facilityId = localStorage.getItem('facilityId');
    if (!facilityId) {
      this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, ToastMessages.FACILITY_NOTFOUND);
      return;
    }
    this.spinnerComponent.loading = true;

    try {
      const response: ApiResponse<Account> = await this.accountService.getByFacilityId(
        parseInt(facilityId)
      );
      this.accountUsers = response.data;
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
