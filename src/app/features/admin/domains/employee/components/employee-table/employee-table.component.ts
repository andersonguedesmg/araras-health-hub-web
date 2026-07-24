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
import { Employee } from '../../interfaces/employee';

@Component({
  selector: 'app-employee-table',
  standalone: true,
  imports: [
    ButtonModule,
    TagModule,
    TooltipModule,
    TableComponent,
    TableToolbarComponent,
  ],
  templateUrl: './employee-table.component.html',
  styleUrl: './employee-table.component.scss',
})
export class EmployeeTableComponent {
  private readonly authService = inject(AuthService);

  readonly value = input<Employee[]>([]);
  readonly totalRecords = input<number>(0);
  readonly loading = input<boolean>(false);
  readonly rows = input<number>(5);
  readonly first = input<number>(0);

  readonly onLazyLoad = output<TableLazyLoadEvent>();
  readonly onSearch = output<string>();
  readonly onAdd = output<void>();
  readonly onPdfClick = output<void>();
  readonly onEdit = output<Employee>();
  readonly onDetail = output<Employee>();
  readonly onChangeStatus = output<Employee>();

  protected readonly getSeverity = getSeverity;
  protected readonly getStatus = getStatus;

  protected readonly hasManagementPermission =
    this.authService.hasManagementPermission;
}
