import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  debounceTime,
  firstValueFrom,
  Subject,
  Subscription,
  switchMap,
} from 'rxjs';

import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ToastService } from '../../../../shared/services/toast.service';
import { Facility } from '../../interfaces/facility';
import { FacilityService } from '../../services/facility.service';
import { FacilityDrawerFormComponent } from '../facility-drawer-form/facility-drawer-form.component';
import { FacilityTableComponent } from '../facility-table/facility-table.component';

@Component({
  selector: 'app-facility-container',
  standalone: true,
  imports: [
    CommonModule,
    FacilityTableComponent,
    FacilityDrawerFormComponent,
    BreadcrumbComponent,
    PageHeaderComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './facility-container.component.html',
  styleUrl: './facility-container.component.scss',
})
export class FacilityContainerComponent implements OnInit, OnDestroy {
  private readonly facilityService = inject(FacilityService);
  private readonly toastService = inject(ToastService);

  protected readonly facilities = this.facilityService.facilities;
  private readonly confirmDialog =
    viewChild<ConfirmDialogComponent>('confirmDialog');

  readonly FormMode = FormMode;
  readonly title = 'Unidades de Saúde';
  readonly description =
    'Gestão e controle dos estabelecimentos da rede municipal de saúde.';

  readonly itemsBreadcrumb = [
    { label: 'Administração', routerLink: '/administracao' },
    { label: 'Unidades de Saúde', routerLink: '/administracao/unidades' },
  ];

  selectedFacility?: Facility;
  formMode: FormMode = FormMode.Create;

  displayDrawer = false;
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
            return this.facilityService.loadFacilities(
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

  loadFacilities(event: any): void {
    this.lastLazyEvent = event;
    this.loadLazy.next(event);
  }

  onSearch(value: string): void {
    this.searchTerm = value;
    this.loadFacilities({ first: 0, rows: this.lastLazyEvent.rows });
  }

  openForm(mode: FormMode, facility?: Facility): void {
    this.formMode = mode;
    this.selectedFacility = facility;
    this.displayDrawer = true;
  }

  generatePdfReport(): void {
    this.toastService.showInfo(
      'A exportação para PDF está em desenvolvimento e estará disponível em breve!',
    );
  }

  async saveFacility(formValue: Facility): Promise<void> {
    this.isLoading = true;
    const operation$ =
      this.formMode === FormMode.Create
        ? this.facilityService.createFacility(formValue)
        : this.facilityService.updateFacility(formValue, formValue.id);

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

  async changeStatusFacility(facility: Facility): Promise<void> {
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

    this.isLoading = true;
    const alteredFacility = { ...facility, isActive: isActivating };

    try {
      await firstValueFrom(
        this.facilityService.changeStatusFacility(facility.id, alteredFacility),
      );

      const successMessage = `Unidade de saúde ${isActivating ? 'ativada' : 'desativada'} com sucesso!`;
      this.toastService.showSuccess(successMessage);
      this.loadLazy.next(this.lastLazyEvent);
    } catch (error) {
      this.toastService.handleApiError(error);
    } finally {
      this.isLoading = false;
    }
  }
}
