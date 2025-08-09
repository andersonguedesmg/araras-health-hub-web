import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { Table } from 'primeng/table';
import { Facility } from '../../interfaces/facility';
import { FacilityService } from '../../services/facility.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';
import { TagModule } from 'primeng/tag';
import { ToastSeverities, ToastSummaries } from '../../../../shared/constants/toast.constants';
import { ToastMessages } from '../../../../shared/constants/messages.constants';
import { getSeverity, getStatus } from '../../../../shared/utils/status.utils';
import { Column, ExportColumn } from '../../../../shared/utils/p-table.utils';
import { getRoleSeverity, getRoleValue } from '../../../../shared/utils/roles.utils';
import { AccountService } from '../../../account/services/account.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-facility-profile',
  imports: [
    CommonModule,
    RouterModule,
    ToolbarModule,
    TagModule,
    BreadcrumbComponent,
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

  facilityId: number | null = null;

  cols!: Column[];
  selectedColumns!: Column[];
  exportColumns!: ExportColumn[];

  getSeverity = getSeverity;
  getStatus = getStatus;
  getRoleSeverity = getRoleSeverity;
  getRoleValue = getRoleValue;

  constructor(private facilityService: FacilityService, private accountService: AccountService) { }

  ngOnInit(): void {
    const facilityId = localStorage.getItem('facilityId');
    if (facilityId) {
      this.facilityId = parseInt(facilityId);
    }
  }

  ngAfterViewInit(): void {
    if (this.facilityId) {
      this.loadFacilityProfile();
    } else {
      this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, ToastMessages.FACILITY_NOTFOUND);
    }
  }

  private async loadFacilityProfile(): Promise<void> {
    this.spinnerComponent.loading = true;
    try {
      const [facilityResponse, accountsResponse] = await Promise.all([
        firstValueFrom(this.facilityService.getFacilityById(this.facilityId!)),
        firstValueFrom(this.accountService.getByFacilityId(this.facilityId!))
      ]);

      if (facilityResponse.success && facilityResponse.data) {
        this.facility = facilityResponse.data;
      }
      if (accountsResponse.success && accountsResponse.data) {
        this.accountUsers = accountsResponse.data;
      }

      this.spinnerComponent.loading = false;
    } catch (error: any) {
      this.spinnerComponent.loading = false;
      this.handleApiError(error);
    }
  }

  private handleApiError(error: any): void {
    if (error?.message !== 'cancel') {
      if (error?.error?.message) {
        this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, error.error.message);
      } else {
        this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, ToastMessages.UNEXPECTED_ERROR);
      }
    }
  }
}
