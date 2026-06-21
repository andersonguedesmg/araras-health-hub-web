import { CommonModule } from '@angular/common';
import { Component, input, output, ViewEncapsulation } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableLazyLoadEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { TableToolbarComponent } from '../../../../shared/components/table-toolbar/table-toolbar.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import {
  getRoleSeverity,
  getRoleValue,
} from '../../../../shared/utils/roles.utils';
import {
  getScopeSeverity,
  getScopeValue,
} from '../../../../shared/utils/scope.utils';
import { getSeverity, getStatus } from '../../../../shared/utils/status.utils';
import { Account } from '../../interfaces/account';

@Component({
  selector: 'app-account-table',
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
  templateUrl: './account-table.component.html',
  styleUrl: './account-table.component.scss',
})
export class AccountTableComponent {
  value = input<Account[]>([]);
  totalRecords = input<number>(0);
  loading = input<boolean>(false);
  rows = input<number>(5);
  first = input<number>(0);

  onLazyLoad = output<TableLazyLoadEvent>();
  onSearch = output<string>();
  onAdd = output<void>();
  onPdfClick = output<void>();
  onEdit = output<Account>();
  onDetail = output<Account>();
  onPasswordReset = output<Account>();
  onChangeStatus = output<Account>();

  protected readonly getSeverity = getSeverity;
  protected readonly getStatus = getStatus;
  protected readonly getRoleSeverity = getRoleSeverity;
  protected readonly getRoleValue = getRoleValue;
  protected readonly getScopeSeverity = getScopeSeverity;
  protected readonly getScopeValue = getScopeValue;

  protected hasManagementPermission(): boolean {
    return true;
  }
}
