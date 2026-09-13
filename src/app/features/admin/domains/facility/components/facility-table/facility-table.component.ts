import { Component, inject, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableLazyLoadEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../../../../../core/services/auth/auth.service';
import { TableToolbarComponent } from '../../../../../../shared/components/table-toolbar/table-toolbar.component';
import { TableComponent } from '../../../../../../shared/components/table/table.component';
import { getSeverity, getStatus } from '../../../../../../shared/utils/status.utils';
import { Facility } from '../../interfaces/facility';

@Component({
  selector: 'app-facility-table',
  standalone: true,
  imports: [ButtonModule, TagModule, TooltipModule, TableComponent, TableToolbarComponent],
  templateUrl: './facility-table.component.html',
  styleUrl: './facility-table.component.scss',
})
export class FacilityTableComponent {
  private readonly authService = inject(AuthService);

  readonly value = input<Facility[]>([]);
  readonly totalRecords = input<number>(0);
  readonly loading = input<boolean>(false);
  readonly rows = input<number>(5);
  readonly first = input<number>(0);

  readonly lazyLoad = output<TableLazyLoadEvent>();
  readonly searchChange = output<string>();
  readonly add = output<void>();
  readonly pdfClick = output<void>();
  readonly edit = output<Facility>();
  readonly detail = output<Facility>();
  readonly changeStatus = output<Facility>();

  protected readonly getSeverity = getSeverity;
  protected readonly getStatus = getStatus;

  protected readonly hasManagementPermission = this.authService.hasManagementPermission;
}
