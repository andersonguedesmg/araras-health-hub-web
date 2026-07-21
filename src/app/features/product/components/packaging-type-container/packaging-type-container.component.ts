import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TableLazyLoadEvent } from 'primeng/table';
import { firstValueFrom } from 'rxjs';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ToastService } from '../../../../shared/services/toast.service';
import { PackagingType } from '../../interfaces/packaging-type';
import { PackagingTypeService } from '../../services/packaging-type.service';
import { PackagingTypeDrawerFormComponent } from '../packaging-type-drawer-form/packaging-type-drawer-form.component';
import { PackagingTypeTableComponent } from '../packaging-type-table/packaging-type-table.component';

@Component({
  selector: 'app-packaging-type-container',
  standalone: true,
  imports: [
    PackagingTypeTableComponent,
    PackagingTypeDrawerFormComponent,
    BreadcrumbComponent,
    PageHeaderComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './packaging-type-container.component.html',
  styleUrl: './packaging-type-container.component.scss',
})
export class PackagingTypeContainerComponent {
  private readonly packagingTypeService = inject(PackagingTypeService);
  private readonly toastService = inject(ToastService);

  private readonly confirmDialog =
    viewChild<ConfirmDialogComponent>('confirmDialog');

  protected readonly FormMode = FormMode;
  protected readonly title = 'Acondicionamento';
  protected readonly description =
    'Cadastro e controle de tipos de acondicionamento para os insumos da rede municipal de saúde.';

  protected readonly itemsBreadcrumb = signal([
    { label: 'Administração', routerLink: '/administracao' },
    { label: 'Itens', routerLink: '/administracao/suprimentos/itens' },
    {
      label: 'Acondicionamento',
      routerLink: '/administracao/suprimentos/acondicionamento',
    },
  ]);

  protected selectedPackagingType?: PackagingType;
  protected formMode: FormMode = FormMode.Create;
  protected displayDrawer = false;

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

  private readonly packagingTypesResource = rxResource({
    request: () => this.queryParams(),
    loader: ({ request }) => {
      return this.packagingTypeService.loadPackagingTypes(
        request.page,
        request.rows,
        request.searchTerm,
      );
    },
  });

  protected readonly packagingTypes = computed(
    () => this.packagingTypesResource.value()?.data ?? [],
  );
  protected readonly totalRecords = computed(
    () => this.packagingTypesResource.value()?.totalCount ?? 0,
  );

  private readonly isActionLoading = signal<boolean>(false);
  protected readonly isLoading = computed(
    () => this.packagingTypesResource.isLoading() || this.isActionLoading(),
  );

  protected loadPackagingTypes(event: TableLazyLoadEvent): void {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 5);
  }

  protected onSearch(value: string): void {
    this.searchTerm.set(value);
    this.first.set(0);
  }

  protected openForm(mode: FormMode, packagingType?: PackagingType): void {
    this.formMode = mode;
    this.selectedPackagingType = packagingType;
    this.displayDrawer = true;
  }

  protected generatePdfReport(): void {
    this.toastService.showInfo(
      'A exportação para PDF está em desenvolvimento e estará disponível em breve!',
    );
  }

  protected async savePackagingType(formValue: PackagingType): Promise<void> {
    this.isActionLoading.set(true);
    const operation$ =
      this.formMode === FormMode.Create
        ? this.packagingTypeService.createPackagingType(formValue)
        : this.packagingTypeService.updatePackagingType(
            formValue,
            formValue.id,
          );

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

  protected async changeStatusPackagingType(
    packagingType: PackagingType,
  ): Promise<void> {
    const dialog = this.confirmDialog();
    if (!dialog) return;

    const isActivating = !packagingType.isActive;
    const actionText = packagingType.isActive ? 'desativar' : 'ativar';
    const msg = `Deseja realmente ${actionText} o tipo de embalagem "${packagingType.name}"?`;
    const title = packagingType.isActive
      ? 'Confirmar Desativação'
      : 'Confirmar Ativação';

    const confirmed = await firstValueFrom(dialog.show(msg, title));
    if (!confirmed) return;

    this.isActionLoading.set(true);
    const alteredType = { ...packagingType, isActive: isActivating };

    try {
      await firstValueFrom(
        this.packagingTypeService.changeStatusPackagingType(
          packagingType.id,
          alteredType,
        ),
      );

      const successMessage = `Tipo de embalagem ${isActivating ? 'ativado' : 'desativado'} com sucesso!`;
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
