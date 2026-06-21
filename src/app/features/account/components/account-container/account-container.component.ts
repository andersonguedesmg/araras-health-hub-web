import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  inject,
  viewChild,
} from '@angular/core';
import { Subject, Subscription, firstValueFrom } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ToastService } from '../../../../shared/services/toast.service';
import { Account } from '../../interfaces/account';
import { AccountService } from '../../services/account.service';
import { AccountDrawerFormComponent } from '../account-drawer-form/account-drawer-form.component';
import { AccountPasswordDrawerFormComponent } from '../account-password-drawer-form/account-password-drawer-form.component';
import { AccountTableComponent } from '../account-table/account-table.component';

@Component({
  selector: 'app-account-container',
  standalone: true,
  imports: [
    CommonModule,
    AccountTableComponent,
    AccountDrawerFormComponent,
    AccountPasswordDrawerFormComponent,
    BreadcrumbComponent,
    PageHeaderComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './account-container.component.html',
  styleUrl: './account-container.component.scss',
})
export class AccountContainerComponent implements OnInit, OnDestroy {
  private readonly accountService = inject(AccountService);
  private readonly toastService = inject(ToastService);

  protected readonly accounts = this.accountService.accounts;
  private readonly confirmDialog =
    viewChild<ConfirmDialogComponent>('confirmDialog');

  readonly FormMode = FormMode;
  readonly title = 'Contas';
  readonly description =
    'Gestão, controle de acessos e permissões de contas no sistema.';

  readonly itemsBreadcrumb = [
    { label: 'Administração', routerLink: '/administracao' },
    { label: 'Contas', routerLink: '/administracao/contas' },
  ];

  selectedAccount?: Account;
  formMode: FormMode = FormMode.Create;

  displayDrawer = false;
  isPasswordOpen = false;
  isLoading = false;
  totalRecords = 0;
  rows = 5;
  first = 0;

  private searchTerm = '';
  private readonly loadLazy = new Subject<any>();
  private lastLazyEvent = { first: 0, rows: 5 };
  private readonly subscriptions = new Subscription();

  ngOnInit(): void {
    this.subscriptions.add(
      this.loadLazy
        .pipe(
          debounceTime(300),
          switchMap((event) => {
            this.isLoading = true;

            this.first = event.first;
            this.rows = event.rows;

            const page = event.first / event.rows + 1;
            return this.accountService.loadAccounts(
              page,
              event.rows,
              this.searchTerm,
            );
          }),
        )
        .subscribe({
          next: (response) => {
            this.isLoading = false;

            if (response && response.totalCount !== undefined) {
              this.totalRecords = response.totalCount;
            }
          },
          error: (error) => {
            this.isLoading = false;
            this.toastService.handleApiError(error);
          },
        }),
    );

    this.loadLazy.next(this.lastLazyEvent);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadAccounts(event: any): void {
    this.lastLazyEvent = event;
    this.loadLazy.next(event);
  }

  onSearch(value: string): void {
    this.searchTerm = value;
    this.loadAccounts({ first: 0, rows: this.lastLazyEvent.rows });
  }

  openForm(mode: FormMode, account?: Account): void {
    this.formMode = mode;
    this.selectedAccount = account;
    this.displayDrawer = true;
  }

  openPasswordResetForm(account: Account): void {
    this.selectedAccount = account;
    this.isPasswordOpen = true;
  }

  async saveNewPassword(event: {
    userId: number;
    password: string;
  }): Promise<void> {
    this.isLoading = true;

    try {
      await firstValueFrom(
        this.accountService.changePassword(event.userId, event.password),
      );

      this.toastService.showSuccess('Senha resetada com sucesso!');
      this.isPasswordOpen = false;
      this.loadLazy.next(this.lastLazyEvent);
    } catch (error) {
      this.toastService.handleApiError(error);
    } finally {
      this.isLoading = false;
    }
  }

  async saveAccount(formValue: Account): Promise<void> {
    this.isLoading = true;
    const operation$ =
      this.formMode === FormMode.Create
        ? this.accountService.registerAccount(formValue)
        : this.accountService.updateAccount(formValue, formValue.userId);

    try {
      const response = await firstValueFrom(operation$);
      if (response) {
        this.displayDrawer = false;
        this.loadLazy.next(this.lastLazyEvent);
      }
    } catch (error) {
      this.toastService.handleApiError(error);
    } finally {
      this.isLoading = false;
    }
  }

  async changeStatusAccount(account: Account): Promise<void> {
    const dialog = this.confirmDialog();
    if (!dialog) return;

    const isActivating = !account.isActive;
    const actionText = account.isActive ? 'desativar' : 'ativar';
    const msg = `Deseja realmente ${actionText} o usuário "${account.userName}"?`;
    const title = account.isActive
      ? 'Confirmar Desativação'
      : 'Confirmar Ativação';

    const confirmed = await firstValueFrom(dialog.show(msg, title));
    if (!confirmed) return;

    this.isLoading = true;
    const alteredAccount = { ...account, isActive: isActivating };

    try {
      await firstValueFrom(
        this.accountService.changeStatusAccount(account.userId, alteredAccount),
      );

      const successMessage = `Usuário ${isActivating ? 'ativado' : 'desativado'} com sucesso!`;
      this.toastService.showSuccess(successMessage);
      this.loadLazy.next(this.lastLazyEvent);
    } catch (error) {
      this.toastService.handleApiError(error);
    } finally {
      this.isLoading = false;
    }
  }
}
