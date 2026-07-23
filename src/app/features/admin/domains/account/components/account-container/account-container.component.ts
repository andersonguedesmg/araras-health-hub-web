import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TableLazyLoadEvent } from 'primeng/table';
import { firstValueFrom } from 'rxjs';
import { BreadcrumbComponent } from '../../../../../../shared/components/breadcrumb/breadcrumb.component';
import { ConfirmDialogComponent } from '../../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PageHeaderComponent } from '../../../../../../shared/components/page-header/page-header.component';
import { SpinnerComponent } from '../../../../../../shared/components/spinner/spinner.component';
import { FormMode } from '../../../../../../shared/enums/form-mode.enum';
import { ToastService } from '../../../../../../shared/services/toast.service';
import { Account } from '../../interfaces/account';
import { AccountService } from '../../services/account.service';
import { AccountDrawerFormComponent } from '../account-drawer-form/account-drawer-form.component';
import { AccountPasswordDrawerFormComponent } from '../account-password-drawer-form/account-password-drawer-form.component';
import { AccountTableComponent } from '../account-table/account-table.component';

@Component({
  selector: 'app-account-container',
  standalone: true,
  imports: [
    AccountTableComponent,
    AccountDrawerFormComponent,
    AccountPasswordDrawerFormComponent,
    BreadcrumbComponent,
    PageHeaderComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './account-container.component.html',
  styleUrl: './account-container.component.scss',
})
export class AccountContainerComponent {
  private readonly accountService = inject(AccountService);
  private readonly toastService = inject(ToastService);

  private readonly confirmDialog =
    viewChild<ConfirmDialogComponent>('confirmDialog');

  protected readonly FormMode = FormMode;
  protected readonly title = 'Contas';
  protected readonly description =
    'Cadastro e controle de contas de acesso ao sistema.';

  protected readonly itemsBreadcrumb = signal([
    { label: 'Administração', routerLink: '/administracao' },
    { label: 'Contas', routerLink: '/administracao/contas' },
  ]);

  protected selectedAccount?: Account;
  protected formMode: FormMode = FormMode.Create;

  protected displayDrawer = false;
  protected isPasswordOpen = false;

  protected readonly first = signal<number>(0);
  protected readonly rows = signal<number>(5);
  protected readonly searchTerm = signal<string>('');

  private readonly refreshTrigger = signal<number>(0);

  private readonly queryParams = computed(() => ({
    page: Math.floor(this.first() / this.rows()) + 1,
    rows: this.rows(),
    searchTerm: this.searchTerm(),
    refresh: this.refreshTrigger(),
  }));

  private readonly accountsResource = rxResource({
    request: () => this.queryParams(),
    loader: ({ request }) => {
      return this.accountService.loadAccounts(
        request.page,
        request.rows,
        request.searchTerm,
      );
    },
  });

  protected readonly accounts = computed(
    () => this.accountsResource.value()?.data ?? [],
  );

  protected readonly totalRecords = computed(
    () => this.accountsResource.value()?.totalCount ?? 0,
  );

  private readonly isActionLoading = signal<boolean>(false);
  protected readonly isLoading = computed(
    () => this.accountsResource.isLoading() || this.isActionLoading(),
  );

  protected loadAccounts(event: TableLazyLoadEvent): void {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 5);
  }

  protected onSearch(value: string): void {
    this.searchTerm.set(value);
    this.first.set(0);
  }

  protected openForm(mode: FormMode, account?: Account): void {
    this.formMode = mode;
    this.selectedAccount = account;
    this.displayDrawer = true;
  }

  protected openPasswordResetForm(account: Account): void {
    this.selectedAccount = account;
    this.isPasswordOpen = true;
  }

  protected generatePdfReport(): void {
    this.toastService.showInfo(
      'A exportação para PDF está em desenvolvimento e estará disponível em breve!',
    );
  }

  protected async saveNewPassword(event: {
    userId: number;
    password: string;
  }): Promise<void> {
    this.isActionLoading.set(true);

    try {
      await firstValueFrom(
        this.accountService.changePassword(event.userId, event.password),
      );

      this.toastService.showSuccess('Senha resetada com sucesso!');
      this.isPasswordOpen = false;
      this.refreshList();
    } catch (error) {
      this.toastService.handleApiError(error);
    } finally {
      this.isActionLoading.set(false);
    }
  }

  protected async saveAccount(formValue: Account): Promise<void> {
    this.isActionLoading.set(true);
    const operation$ =
      this.formMode === FormMode.Create
        ? this.accountService.registerAccount(formValue)
        : this.accountService.updateAccount(formValue, formValue.userId);

    try {
      const response = await firstValueFrom(operation$);
      if (response) {
        this.displayDrawer = false;
        this.refreshList();
      }
    } catch (error) {
      this.toastService.handleApiError(error);
    } finally {
      this.isActionLoading.set(false);
    }
  }

  protected async changeStatusAccount(account: Account): Promise<void> {
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

    this.isActionLoading.set(true);
    const alteredAccount = { ...account, isActive: isActivating };

    try {
      await firstValueFrom(
        this.accountService.changeStatusAccount(account.userId, alteredAccount),
      );

      const successMessage = `Usuário ${isActivating ? 'ativado' : 'desativado'} com sucesso!`;
      this.toastService.showSuccess(successMessage);
      this.refreshList();
    } catch (error) {
      this.toastService.handleApiError(error);
    } finally {
      this.isActionLoading.set(false);
    }
  }

  private refreshList(): void {
    this.refreshTrigger.update((n) => n + 1);
  }
}
