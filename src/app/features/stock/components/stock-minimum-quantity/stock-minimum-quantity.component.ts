import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BaseComponent } from '../../../../core/components/base/base.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ConfirmMode } from '../../../../shared/enums/confirm-mode.enum';
import { Column } from '../../../../shared/utils/p-table.utils';
import { getSeverity, getStatus } from '../../../../shared/utils/status.utils';
import { StatusOptions } from '../../../../shared/constants/status-options.constants';
import { ConfirmMessages, ToastMessages } from '../../../../shared/constants/messages.constants';
import { debounceTime, firstValueFrom, Observable, Subject, Subscription, switchMap, tap } from 'rxjs';
import { HasRoleDirective } from '../../../../core/directives/has-role.directive';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { TableHeaderComponent } from '../../../../shared/components/table-header/table-header.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { InputMask } from 'primeng/inputmask';
import { FormHelperService } from '../../../../core/services/form-helper.service';
import { cnpjValidator } from '../../../../core/validators/cpf-cnpj.validator';
import { StockMinQuantity } from '../../interfaces/stock-minimum-quantity';
import { ToastService } from '../../../../shared/services/toast.service';
import { StockService } from '../../services/stock.service';

@Component({
  selector: 'app-stock-minimum-quantity',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    ToastModule,
    ToolbarModule,
    ButtonModule,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
    TooltipModule,
    TagModule,
    DialogModule,
    SelectModule,
    BreadcrumbComponent,
    // ConfirmDialogComponent,
    TableHeaderComponent,
    SpinnerComponent,
    // DialogComponent,
    // TableComponent,
    // InputMask,
    // HasRoleDirective,
  ],
  providers: [MessageService],
  templateUrl: './stock-minimum-quantity.component.html',
  styleUrl: './stock-minimum-quantity.component.scss'
})
export class StockMinimumQuantityComponent extends BaseComponent implements OnInit, OnDestroy {
  itemsBreadcrumb: MenuItem[] = [{ label: 'Almoxarifado' }, { label: 'Configurações' }, { label: 'Estoque Mínimo' }];
  title: string = 'Estoque Mínimo';

  constructor(
    private cd: ChangeDetectorRef,
    private stockService: StockService,
    private formHelperService: FormHelperService
  ) {
    super();
  }

  ngOnInit() { }

  ngOnDestroy(): void { }
}
