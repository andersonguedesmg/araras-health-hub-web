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
import { PackagingType } from '../../interfaces/packaging-type';
import { PackagingTypeService } from '../../services/packaging-type.service';
import { PackagingTypeDrawerFormComponent } from '../packaging-type-drawer-form/packaging-type-drawer-form.component';
import { PackagingTypeTableComponent } from '../packaging-type-table/packaging-type-table.component';

@Component({
  selector: 'app-packaging-type-container',
  standalone: true,
  imports: [
    CommonModule,
    PackagingTypeTableComponent,
    PackagingTypeDrawerFormComponent,
    BreadcrumbComponent,
    PageHeaderComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './packaging-type-container.component.html',
  styleUrl: './packaging-type-container.component.scss',
})
export class PackagingTypeContainerComponent implements OnInit, OnDestroy {
  private readonly packagingTypeService = inject(PackagingTypeService);
  private readonly toastService = inject(ToastService);

  protected readonly packagingTypes = this.packagingTypeService.packagingTypes;
  private readonly confirmDialog =
    viewChild<ConfirmDialogComponent>('confirmDialog');

  readonly FormMode = FormMode;
  readonly title = 'Tipos de Embalagem';
  readonly description =
    'Cadastro e controle de tipos de embalagens para os insumos da rede de saúde.';

  readonly itemsBreadcrumb = [
    { label: 'Catálogo', routerLink: '/catalogo' },
    { label: 'Tipos de Embalagem', routerLink: '/catalogo/embalagens' },
  ];

  selectedPackagingType?: PackagingType;
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
            return this.packagingTypeService.loadPackagingTypes(
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

  loadPackagingTypes(event: any): void {
    this.lastLazyEvent = event;
    this.loadLazy.next(event);
  }

  onSearch(value: string): void {
    this.searchTerm = value;
    this.loadPackagingTypes({ first: 0, rows: this.lastLazyEvent.rows });
  }

  openForm(mode: FormMode, packagingType?: PackagingType): void {
    this.formMode = mode;
    this.selectedPackagingType = packagingType;
    this.displayDrawer = true;
  }

  async savePackagingType(formValue: PackagingType): Promise<void> {
    this.isLoading = true;
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
        this.loadLazy.next(this.lastLazyEvent);
      }
    } catch (error) {
      this.toastService.handleApiError(error);
    } finally {
      this.isLoading = false;
    }
  }

  async changeStatusPackagingType(packagingType: PackagingType): Promise<void> {
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

    this.isLoading = true;
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
      this.loadLazy.next(this.lastLazyEvent);
    } catch (error) {
      this.toastService.handleApiError(error);
    } finally {
      this.isLoading = false;
    }
  }
}
