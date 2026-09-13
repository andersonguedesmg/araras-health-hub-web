import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BreadcrumbComponent } from '../../../../../../../shared/components/breadcrumb/breadcrumb.component';
import { ConfirmDialogComponent } from '../../../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PageHeaderComponent } from '../../../../../../../shared/components/page-header/page-header.component';
import { SpinnerComponent } from '../../../../../../../shared/components/spinner/spinner.component';
import { FormMode } from '../../../../../../../shared/enums/form-mode.enum';
import { ToastService } from '../../../../../../../shared/services/toast/toast.service';
import { CreateReceivingRequest, ReceivingHeaderFormData, ReceivingItemRequest } from '../../../interfaces/receiving';
import { ReceivingService } from '../../../services/receiving/receiving.service';
import { ReceivingCreateDrawerFormComponent } from '../receiving-create-drawer-form/receiving-create-drawer-form.component';
import { ReceivingCreateHeaderFormComponent } from '../receiving-create-header-form/receiving-create-header-form.component';
import { ReceivingCreateTableComponent } from '../receiving-create-table/receiving-create-table.component';

@Component({
  selector: 'app-receiving-create-container',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    PageHeaderComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
    ReceivingCreateHeaderFormComponent,
    ReceivingCreateTableComponent,
    ReceivingCreateDrawerFormComponent,
  ],
  templateUrl: './receiving-create-container.component.html',
  styleUrl: './receiving-create-container.component.scss',
})
export class ReceivingCreateContainerComponent {
  private readonly receivingService = inject(ReceivingService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  private readonly confirmDialog = viewChild<ConfirmDialogComponent>('confirmDialog');
  private readonly headerFormComponent = viewChild<ReceivingCreateHeaderFormComponent>('headerForm');

  protected readonly FormMode = FormMode;
  protected readonly title = 'Nova Entrada';
  protected readonly description = 'Registre a nota fiscal e os itens recebidos.';

  protected readonly itemsBreadcrumb = signal([
    { label: 'Almoxarifado', routerLink: '/almoxarifado' },
    { label: 'Movimentações', routerLink: '/almoxarifado/movimentacoes' },
    { label: 'Nova Entrada' },
  ]);

  protected readonly isActionLoading = signal<boolean>(false);
  protected readonly isLoading = computed(() => this.isActionLoading());

  protected displayDrawer = signal<boolean>(false);
  protected drawerMode = FormMode.Create;
  protected selectedItem = signal<ReceivingItemRequest | undefined>(undefined);
  protected selectedItemIndex = signal<number | null>(null);

  protected readonly receivedItems = signal<ReceivingItemRequest[]>([]);
  protected readonly headerFormData = signal<ReceivingHeaderFormData | null>(null);

  protected readonly calculatedItemsTotal = computed(() => {
    return this.receivedItems().reduce((acc, item) => {
      return acc + item.quantity * item.unitValue;
    }, 0);
  });

  protected openItemDrawer(mode: FormMode, item?: ReceivingItemRequest, index?: number): void {
    this.drawerMode = mode;
    this.selectedItem.set(item);
    this.selectedItemIndex.set(index ?? null);
    this.displayDrawer.set(true);
  }

  protected handleSaveItem(item: ReceivingItemRequest): void {
    const currentIndex = this.selectedItemIndex();

    if (this.drawerMode === FormMode.Create || currentIndex === null) {
      this.receivedItems.update((items) => [...items, item]);
      this.toastService.showSuccess('Item adicionado à lista com sucesso!');
    } else {
      this.receivedItems.update((items) => {
        const updated = [...items];
        updated[currentIndex] = item;
        return updated;
      });
      this.toastService.showSuccess('Item atualizado com sucesso!');
    }

    this.displayDrawer.set(false);
  }

  protected handleRemoveItem(index: number): void {
    this.receivedItems.update((items) => items.filter((_, i) => i !== index));
    this.toastService.showInfo('Item removido da lista.');
  }

  protected handleHeaderFormChange(data: ReceivingHeaderFormData): void {
    this.headerFormData.set(data);
  }

  protected async handleSubmit(): Promise<void> {
    const headerComponent = this.headerFormComponent();
    if (!headerComponent) return;

    const header = this.headerFormData();
    if (!header || !header.invoiceNumber || !header.receivingDate) {
      this.toastService.showError('Preencha corretamente todos os campos obrigatórios da Nota Fiscal.');
      return;
    }

    const items = this.receivedItems();
    if (items.length === 0) {
      this.toastService.showError('Adicione pelo menos um item/medicamento à entrada de estoque.');
      return;
    }

    if (header.totalValue > 0 && Math.abs(header.totalValue - this.calculatedItemsTotal()) > 0.01) {
      this.toastService.showInfo('Atenção: O valor total declarado na NF difere da soma dos itens.');
    }

    const dialog = this.confirmDialog();
    if (!dialog) return;

    const confirmed = await firstValueFrom(
      dialog.show('Deseja realmente dar entrada destes itens no estoque?', 'Confirmar Entrada de Estoque'),
    );

    if (!confirmed) return;

    const payload: CreateReceivingRequest = {
      invoiceNumber: header.invoiceNumber,
      supplyAuthorization: header.supplyAuthorization,
      observation: header.observation || undefined,
      receivingDate: header.receivingDate,
      supplierId: header.supplierId!,
      responsibleId: header.responsibleId!,
      accountId: 1,
      receivedItems: items,
    };

    this.isActionLoading.set(true);

    try {
      await firstValueFrom(this.receivingService.createReceiving(payload));
      this.toastService.showSuccess('Recebimento cadastrado com sucesso!');
      this.router.navigate(['/almoxarifado/movimentacoes/entradas']);
    } catch (error) {
      this.toastService.handleApiError(error);
    } finally {
      this.isActionLoading.set(false);
    }
  }

  protected cancel(): void {
    this.router.navigate(['/almoxarifado/movimentacoes/entradas']);
  }
}
