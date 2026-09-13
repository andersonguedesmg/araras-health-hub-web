import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { firstValueFrom } from 'rxjs';
import { HasPermissionDirective } from '../../../../../../core/directives/has-permission/has-permission.directive';
import { BreadcrumbComponent } from '../../../../../../shared/components/breadcrumb/breadcrumb.component';
import { SpinnerComponent } from '../../../../../../shared/components/spinner/spinner.component';
import { ToastService } from '../../../../../../shared/services/toast/toast.service';
import { getRoleSeverity, getRoleValue } from '../../../../../../shared/utils/roles.utils';
import { getScopeSeverity, getScopeValue } from '../../../../../../shared/utils/scope.utils';
import { getSeverity, getStatus } from '../../../../../../shared/utils/status.utils';
import { FacilityProfile } from '../../interfaces/facility-profile';
import { FacilityService } from '../../services/facility/facility.service';

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
export class FacilityProfileComponent implements OnInit {
  private readonly facilityService = inject(FacilityService);
  private readonly toastService = inject(ToastService);

  readonly isLoading = signal<boolean>(true);
  readonly facilityProfile = signal<FacilityProfile | null>(null);

  readonly itemsBreadcrumb: MenuItem[] = [
    { label: 'Administração', routerLink: '/administracao' },
    { label: 'Unidades de Saúde', routerLink: '/administracao/unidades' },
    { label: 'Perfil', routerLink: '/administracao/unidades/perfil' },
  ];

  readonly title = 'Perfil da Unidade';

  protected readonly getSeverity = getSeverity;
  protected readonly getStatus = getStatus;
  protected readonly getRoleSeverity = getRoleSeverity;
  protected readonly getRoleValue = getRoleValue;
  protected readonly getScopeSeverity = getScopeSeverity;
  protected readonly getScopeValue = getScopeValue;

  ngOnInit(): void {
    this.loadFacilityProfile();
  }

  private async loadFacilityProfile(): Promise<void> {
    this.isLoading.set(true);
    try {
      const response = await firstValueFrom(this.facilityService.getFacilityProfile());
      if (response?.data) {
        this.facilityProfile.set(response.data);
      }
    } catch (error) {
      this.toastService.handleApiError(error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
