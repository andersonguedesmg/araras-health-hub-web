import { Component, inject, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableLazyLoadEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../../../core/services/auth.service';
import { TableToolbarComponent } from '../../../../shared/components/table-toolbar/table-toolbar.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { getSeverity, getStatus } from '../../../../shared/utils/status.utils';
import { PackagingType } from '../../interfaces/packaging-type';

@Component({
  selector: 'app-packaging-type-table',
  standalone: true,
  imports: [
    ButtonModule,
    TagModule,
    TooltipModule,
    TableComponent,
    TableToolbarComponent,
  ],
  templateUrl: './packaging-type-table.component.html',
  styleUrl: './packaging-type-table.component.scss',
})
export class PackagingTypeTableComponent {
  private readonly authService = inject(AuthService);

  readonly value = input<PackagingType[]>([]);
  readonly totalRecords = input<number>(0);
  readonly loading = input<boolean>(false);
  readonly rows = input<number>(5);
  readonly first = input<number>(0);

  readonly onLazyLoad = output<TableLazyLoadEvent>();
  readonly onSearch = output<string>();
  readonly onAdd = output<void>();
  readonly onPdfClick = output<void>();
  readonly onEdit = output<PackagingType>();
  readonly onDetail = output<PackagingType>();
  readonly onChangeStatus = output<PackagingType>();

  protected readonly getSeverity = getSeverity;
  protected readonly getStatus = getStatus;

  protected readonly hasManagementPermission =
    this.authService.hasManagementPermission;
}
