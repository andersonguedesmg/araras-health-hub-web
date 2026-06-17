import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { firstValueFrom } from 'rxjs';
import { BaseComponent } from '../../../../core/components/base/base.component';
import { HasPermissionDirective } from '../../../../core/directives/has-permission.directive';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import {
  getRoleSeverity,
  getRoleValue,
} from '../../../../shared/utils/roles.utils';
import {
  getScopeSeverity,
  getScopeValue,
} from '../../../../shared/utils/scope.utils';
import { getSeverity, getStatus } from '../../../../shared/utils/status.utils';
import { FacilityProfile } from '../../interfaces/facility-profile';
import { FacilityService } from '../../services/facility.service';

@Component({
  selector: 'app-facility-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ToolbarModule,
    TagModule,
    TableModule,
    BreadcrumbComponent,
    SpinnerComponent,
    HasPermissionDirective,
  ],
  providers: [MessageService],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './facility-profile.component.html',
  styleUrl: './facility-profile.component.scss',
})
export class FacilityProfileComponent extends BaseComponent implements OnInit {
  @ViewChild(SpinnerComponent) spinnerComponent!: SpinnerComponent;

  itemsBreadcrumb: MenuItem[] = [
    { label: 'Administração', routerLink: '/administracao' },
    { label: 'Unidades de Saúde', routerLink: '/administracao/unidades' },
    { label: 'Perfil', routerLink: '/administracao/unidades/perfil' },
  ];

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
      const response = await firstValueFrom(
        this.facilityService.getFacilityProfile(),
      );
      if (response.data) {
        this.facilityProfile = response.data;
      }
    } catch (error: any) {
      this.handleApiError(error);
    } finally {
      this.isLoading = false;
    }
  }
}
