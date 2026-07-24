import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TableLazyLoadEvent } from 'primeng/table';
import { firstValueFrom } from 'rxjs';
import { BreadcrumbComponent } from '../../../../../../shared/components/breadcrumb/breadcrumb.component';
import { ConfirmDialogComponent } from '../../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PageHeaderComponent } from '../../../../../../shared/components/page-header/page-header.component';
import { SpinnerComponent } from '../../../../../../shared/components/spinner/spinner.component';
import { FormMode } from '../../../../../../shared/enums/form-mode.enum';
import { ToastService } from '../../../../../../shared/services/toast/toast.service';
import { Facility } from '../../interfaces/facility';
import { FacilityService } from '../../services/facility.service';
import { FacilityDrawerFormComponent } from '../facility-drawer-form/facility-drawer-form.component';
import { FacilityTableComponent } from '../facility-table/facility-table.component';

@Component({
  selector: 'app-facility-container',
  standalone: true,
  imports: [
    FacilityTableComponent,
    FacilityDrawerFormComponent,
    BreadcrumbComponent,
    PageHeaderComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './facility-container.component.html',
  styleUrl: './facility-container.component.scss',
})
export class FacilityContainerComponent {
  private readonly facilityService = inject(FacilityService);
  private readonly toastService = inject(ToastService);

  private readonly confirmDialog =
    viewChild<ConfirmDialogComponent>('confirmDialog');

  protected readonly FormMode = FormMode;
  protected readonly title = 'Unidades';
  protected readonly description =
    'Gestão e controle dos estabelecimentos da rede municipal de saúde.';

  protected readonly itemsBreadcrumb = signal([
    { label: 'Administração', routerLink: '/administracao' },
    { label: 'Unidades', routerLink: '/administracao/unidades' },
  ]);

  protected selectedFacility?: Facility;
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

  private readonly facilitiesResource = rxResource({
    request: () => this.queryParams(),
    loader: ({ request }) => {
      return this.facilityService.loadFacilities(
        request.page,
        request.rows,
        request.searchTerm,
      );
    },
  });

  protected readonly facilities = computed(
    () => this.facilitiesResource.value()?.data ?? [],
  );

  protected readonly totalRecords = computed(
    () => this.facilitiesResource.value()?.totalCount ?? 0,
  );

  private readonly isActionLoading = signal<boolean>(false);
  protected readonly isLoading = computed(
    () => this.facilitiesResource.isLoading() || this.isActionLoading(),
  );

  protected loadFacilities(event: TableLazyLoadEvent): void {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 5);
  }

  protected onSearch(value: string): void {
    this.searchTerm.set(value);
    this.first.set(0);
  }

  protected openForm(mode: FormMode, facility?: Facility): void {
    this.formMode = mode;
    this.selectedFacility = facility;
    this.displayDrawer = true;
  }

  protected generatePdfReport(): void {
    this.toastService.showInfo(
      'A exportação para PDF está em desenvolvimento e estará disponível em breve!',
    );
  }

  protected async saveFacility(formValue: Facility): Promise<void> {
    this.isActionLoading.set(true);
    const operation$ =
      this.formMode === FormMode.Create
        ? this.facilityService.createFacility(formValue)
        : this.facilityService.updateFacility(formValue, formValue.id);

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

  protected async changeStatusFacility(facility: Facility): Promise<void> {
    const dialog = this.confirmDialog();
    if (!dialog) return;

    const isActivating = !facility.isActive;
    const actionText = facility.isActive ? 'desativar' : 'ativar';
    const msg = `Deseja realmente ${actionText} a unidade de saúde "${facility.name}"?`;
    const title = facility.isActive
      ? 'Confirmar Desativação'
      : 'Confirmar Ativação';

    const confirmed = await firstValueFrom(dialog.show(msg, title));
    if (!confirmed) return;

    this.isActionLoading.set(true);
    const alteredFacility = { ...facility, isActive: isActivating };

    try {
      await firstValueFrom(
        this.facilityService.changeStatusFacility(facility.id, alteredFacility),
      );

      const successMessage = `Unidade de saúde ${isActivating ? 'ativada' : 'desativada'} com sucesso!`;
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
