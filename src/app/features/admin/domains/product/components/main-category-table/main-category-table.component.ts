import { Component, inject, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableLazyLoadEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../../../../../core/services/auth/auth.service';
import { TableToolbarComponent } from '../../../../../../shared/components/table-toolbar/table-toolbar.component';
import { TableComponent } from '../../../../../../shared/components/table/table.component';
import {
  getSeverity,
  getStatus,
} from '../../../../../../shared/utils/status.utils';
import { MainCategory } from '../../interfaces/main-category';

@Component({
  selector: 'app-main-category-table',
  standalone: true,
  imports: [
    ButtonModule,
    TagModule,
    TooltipModule,
    TableComponent,
    TableToolbarComponent,
  ],
  templateUrl: './main-category-table.component.html',
  styleUrl: './main-category-table.component.scss',
})
export class MainCategoryTableComponent {
  private readonly authService = inject(AuthService);

  readonly value = input<MainCategory[]>([]);
  readonly totalRecords = input<number>(0);
  readonly loading = input<boolean>(false);
  readonly rows = input<number>(5);
  readonly first = input<number>(0);

  readonly onLazyLoad = output<TableLazyLoadEvent>();
  readonly onSearch = output<string>();
  readonly onAdd = output<void>();
  readonly onPdfClick = output<void>();
  readonly onEdit = output<MainCategory>();
  readonly onDetail = output<MainCategory>();
  readonly onChangeStatus = output<MainCategory>();

  protected readonly getSeverity = getSeverity;
  protected readonly getStatus = getStatus;

  protected readonly hasManagementPermission =
    this.authService.hasManagementPermission;
}
