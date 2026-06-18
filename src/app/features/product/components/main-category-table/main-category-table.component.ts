import { CommonModule } from '@angular/common';
import { Component, input, output, ViewEncapsulation } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableLazyLoadEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { TableToolbarComponent } from '../../../../shared/components/table-toolbar/table-toolbar.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { getSeverity, getStatus } from '../../../../shared/utils/status.utils';
import { MainCategory } from '../../interfaces/main-category';

@Component({
  selector: 'app-main-category-table',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    TableComponent,
    TableToolbarComponent,
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './main-category-table.component.html',
  styleUrl: './main-category-table.component.scss',
})
export class MainCategoryTableComponent {
  value = input<MainCategory[]>([]);
  totalRecords = input<number>(0);
  loading = input<boolean>(false);
  rows = input<number>(5);
  first = input<number>(0);

  onLazyLoad = output<TableLazyLoadEvent>();
  onSearch = output<string>();
  onAdd = output<void>();
  onPdfClick = output<void>();
  onEdit = output<MainCategory>();
  onDetail = output<MainCategory>();
  onChangeStatus = output<MainCategory>();

  protected readonly getSeverity = getSeverity;
  protected readonly getStatus = getStatus;

  protected hasManagementPermission(): boolean {
    return true;
  }
}
