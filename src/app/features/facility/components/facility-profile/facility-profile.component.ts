import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { FacilityService } from '../../services/facility.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { TagModule } from 'primeng/tag';
import { getSeverity, getStatus } from '../../../../shared/utils/status.utils';
import { getRoleSeverity, getRoleValue } from '../../../../shared/utils/roles.utils';
import { firstValueFrom } from 'rxjs';
import { BaseComponent } from '../../../../core/components/base/base.component';
import { FacilityProfile } from '../../interfaces/facility-profile';
import { TableModule } from 'primeng/table';
import { getScopeSeverity, getScopeValue } from '../../../../shared/utils/scope.utils';

@Component({
  selector: 'app-facility-profile',
  imports: [
    CommonModule,
    RouterModule,
    ToolbarModule,
    TagModule,
    TableModule,
    BreadcrumbComponent,
    SpinnerComponent,
  ],
  providers: [MessageService],
  templateUrl: './facility-profile.component.html',
  styleUrl: './facility-profile.component.scss'
})
export class FacilityProfileComponent extends BaseComponent implements OnInit {
  @ViewChild(SpinnerComponent) spinnerComponent!: SpinnerComponent;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Administração' }, { label: 'Unidades' }, { label: 'Perfil' }];
  title: string = 'Perfil da Unidade';

  facilityProfile!: FacilityProfile;

  getSeverity = getSeverity;
  getStatus = getStatus;
  getRoleSeverity = getRoleSeverity;
  getRoleValue = getRoleValue;
  getScopeSeverity = getScopeSeverity;
  getScopeValue = getScopeValue;

  constructor(private facilityService: FacilityService) {
    super();
  }

  ngOnInit(): void {
    this.loadFacilityProfile();
  }

  private async loadFacilityProfile(): Promise<void> {
    this.isLoading = true;
    try {
      const response = await firstValueFrom(this.facilityService.getFacilityProfile());
      if (response.success && response.data) {
        this.facilityProfile = response.data;
      }
      this.isLoading = false;
    } catch (error: any) {
      this.handleApiError(error);
    } finally {
      this.isLoading = false;
    }
  }
}
