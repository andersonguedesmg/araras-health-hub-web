import { Component, inject, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableLazyLoadEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../../../core/services/auth.service';
import { TableToolbarComponent } from '../../../../shared/components/table-toolbar/table-toolbar.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { getSeverity, getStatus } from '../../../../shared/utils/status.utils';
import { SubCategory } from '../../interfaces/sub-category';

@Component({
  selector: 'app-sub-category-table',
  standalone: true,
  imports: [
    ButtonModule,
    TagModule,
    TooltipModule,
    TableComponent,
    TableToolbarComponent,
  ],
  templateUrl: './sub-category-table.component.html',
  styleUrl: './sub-category-table.component.scss',
})
export class SubCategoryTableComponent {
  private readonly authService = inject(AuthService);

  readonly value = input<SubCategory[]>([]);
  readonly totalRecords = input<number>(0);
  readonly loading = input<boolean>(false);
  readonly rows = input<number>(5);
  readonly first = input<number>(0);

  readonly onLazyLoad = output<TableLazyLoadEvent>();
  readonly onSearch = output<string>();
  readonly onAdd = output<void>();
  readonly onPdfClick = output<void>();
  readonly onEdit = output<SubCategory>();
  readonly onDetail = output<SubCategory>();
  readonly onChangeStatus = output<SubCategory>();

  protected readonly getSeverity = getSeverity;
  protected readonly getStatus = getStatus;

  protected readonly hasManagementPermission =
    this.authService.hasManagementPermission;
}
