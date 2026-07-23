import { Component, inject, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableLazyLoadEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../../../../../core/services/auth.service';
import { TableToolbarComponent } from '../../../../../../shared/components/table-toolbar/table-toolbar.component';
import { TableComponent } from '../../../../../../shared/components/table/table.component';
import {
  getRoleSeverity,
  getRoleValue,
} from '../../../../../../shared/utils/roles.utils';
import {
  getScopeSeverity,
  getScopeValue,
} from '../../../../../../shared/utils/scope.utils';
import {
  getSeverity,
  getStatus,
} from '../../../../../../shared/utils/status.utils';
import { Account } from '../../interfaces/account';

@Component({
  selector: 'app-account-table',
  standalone: true,
  imports: [
    ButtonModule,
    TagModule,
    TooltipModule,
    TableComponent,
    TableToolbarComponent,
  ],
  templateUrl: './account-table.component.html',
  styleUrl: './account-table.component.scss',
})
export class AccountTableComponent {
  private readonly authService = inject(AuthService);

  readonly value = input<Account[]>([]);
  readonly totalRecords = input<number>(0);
  readonly loading = input<boolean>(false);
  readonly rows = input<number>(5);
  readonly first = input<number>(0);

  readonly onLazyLoad = output<TableLazyLoadEvent>();
  readonly onSearch = output<string>();
  readonly onAdd = output<void>();
  readonly onPdfClick = output<void>();
  readonly onEdit = output<Account>();
  readonly onDetail = output<Account>();
  readonly onPasswordReset = output<Account>();
  readonly onChangeStatus = output<Account>();

  protected readonly getSeverity = getSeverity;
  protected readonly getStatus = getStatus;
  protected readonly getRoleSeverity = getRoleSeverity;
  protected readonly getRoleValue = getRoleValue;
  protected readonly getScopeSeverity = getScopeSeverity;
  protected readonly getScopeValue = getScopeValue;

  protected readonly hasManagementPermission =
    this.authService.hasManagementPermission;
}
