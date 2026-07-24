import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TableLazyLoadEvent } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { firstValueFrom } from 'rxjs';
import { BreadcrumbComponent } from '../../../../../../shared/components/breadcrumb/breadcrumb.component';
import { ConfirmDialogComponent } from '../../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PageHeaderComponent } from '../../../../../../shared/components/page-header/page-header.component';
import { SpinnerComponent } from '../../../../../../shared/components/spinner/spinner.component';
import { FormMode } from '../../../../../../shared/enums/form-mode.enum';
import { ToastService } from '../../../../../../shared/services/toast/toast.service';
import { MainCategory } from '../../interfaces/main-category';
import { SubCategory } from '../../interfaces/sub-category';
import { MainCategoryService } from '../../services/main-category.service';
import { SubCategoryService } from '../../services/sub-category.service';
import { MainCategoryDrawerFormComponent } from '../main-category-drawer-form/main-category-drawer-form.component';
import { MainCategoryTableComponent } from '../main-category-table/main-category-table.component';
import { SubCategoryDrawerFormComponent } from '../sub-category-drawer-form/sub-category-drawer-form.component';
import { SubCategoryTableComponent } from '../sub-category-table/sub-category-table.component';

@Component({
  selector: 'app-categories-container',
  standalone: true,
  imports: [
    TabsModule,
    MainCategoryTableComponent,
    MainCategoryDrawerFormComponent,
    SubCategoryTableComponent,
    SubCategoryDrawerFormComponent,
    BreadcrumbComponent,
    PageHeaderComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './categories-container.component.html',
  styleUrl: './categories-container.component.scss',
})
export class CategoriesContainerComponent {
  private readonly mainCategoryService = inject(MainCategoryService);
  private readonly subCategoryService = inject(SubCategoryService);
  private readonly toastService = inject(ToastService);

  private readonly confirmDialog =
    viewChild<ConfirmDialogComponent>('confirmDialog');

  protected readonly FormMode = FormMode;
  protected readonly title = 'Categorias';
  protected readonly description =
    'Cadastro e controle da categoria e subcategoria para a organização atômica dos itens do catálogo de produto.';

  protected readonly itemsBreadcrumb = signal([
    { label: 'Administração', routerLink: '/administracao' },
    { label: 'Itens', routerLink: '/administracao/suprimentos/itens' },
    {
      label: 'Categorias',
      routerLink: '/administracao/suprimentos/categorias',
    },
  ]);

  protected readonly activeTab = signal<string>('main');
  protected formMode: FormMode = FormMode.Create;

  protected readonly displayMainDrawer = signal<boolean>(false);
  protected selectedMainCategory?: MainCategory;
  protected readonly firstMain = signal<number>(0);
  protected readonly rowsMain = signal<number>(5);
  protected readonly searchTermMain = signal<string>('');
  private readonly refreshTriggerMain = signal<number>(0);

  protected readonly displaySubDrawer = signal<boolean>(false);
  protected selectedSubCategory?: SubCategory;
  protected readonly firstSub = signal<number>(0);
  protected readonly rowsSub = signal<number>(5);
  protected readonly searchTermSub = signal<string>('');
  private readonly refreshTriggerSub = signal<number>(0);

  private readonly isActionLoading = signal<boolean>(false);

  private readonly queryParamsMain = computed(() => ({
    page: Math.floor(this.firstMain() / this.rowsMain()) + 1,
    rows: this.rowsMain(),
    searchTerm: this.searchTermMain(),
    refresh: this.refreshTriggerMain(),
  }));

  private readonly queryParamsSub = computed(() => ({
    page: Math.floor(this.firstSub() / this.rowsSub()) + 1,
    rows: this.rowsSub(),
    searchTerm: this.searchTermSub(),
    refresh: this.refreshTriggerSub(),
  }));

  private readonly mainCategoriesResource = rxResource({
    request: () => this.queryParamsMain(),
    loader: ({ request }) => {
      return this.mainCategoryService.loadMainCategories(
        request.page,
        request.rows,
        request.searchTerm,
      );
    },
  });

  private readonly subCategoriesResource = rxResource({
    request: () => this.queryParamsSub(),
    loader: ({ request }) => {
      return this.subCategoryService.loadSubCategories(
        request.page,
        request.rows,
        request.searchTerm,
      );
    },
  });

  protected readonly mainCategories = computed(
    () => this.mainCategoriesResource.value()?.data ?? [],
  );
  protected readonly totalRecordsMain = computed(
    () => this.mainCategoriesResource.value()?.totalCount ?? 0,
  );

  protected readonly subCategories = computed(
    () => this.subCategoriesResource.value()?.data ?? [],
  );
  protected readonly totalRecordsSub = computed(
    () => this.subCategoriesResource.value()?.totalCount ?? 0,
  );

  protected readonly isLoading = computed(() => {
    return (
      this.mainCategoriesResource.isLoading() ||
      this.subCategoriesResource.isLoading() ||
      this.isActionLoading()
    );
  });

  protected onTabChange(tab: string | unknown): void {
    const tabString = tab as string;
    this.activeTab.set(tabString);
    if (tabString === 'main') {
      this.refreshMainList();
    } else {
      this.refreshSubList();
    }
  }

  protected loadMainCategories(event: TableLazyLoadEvent): void {
    this.firstMain.set(event.first ?? 0);
    this.rowsMain.set(event.rows ?? 5);
  }

  protected onSearchMain(value: string): void {
    this.searchTermMain.set(value);
    this.firstMain.set(0);
  }

  protected openMainForm(mode: FormMode, category?: MainCategory): void {
    this.formMode = mode;
    this.selectedMainCategory = category;
    this.displayMainDrawer.set(true);
  }

  protected generateMainCategoryPdfReport(): void {
    this.toastService.showInfo(
      'A exportação para PDF está em desenvolvimento e estará disponível em breve!',
    );
  }

  protected async saveMainCategory(formValue: MainCategory): Promise<void> {
    this.isActionLoading.set(true);
    const op$ =
      this.formMode === FormMode.Create
        ? this.mainCategoryService.createMainCategory(formValue)
        : this.mainCategoryService.updateMainCategory(formValue, formValue.id);

    try {
      const response = await firstValueFrom(op$);
      if (response) {
        this.displayMainDrawer.set(false);
        this.refreshMainList();
      }
    } catch (err) {
      this.toastService.handleApiError(err);
    } finally {
      this.isActionLoading.set(false);
    }
  }

  protected async changeStatusMainCategory(
    category: MainCategory,
  ): Promise<void> {
    const dialog = this.confirmDialog();
    if (!dialog) return;

    const isActivating = !category.isActive;
    const actionText = category.isActive ? 'desativar' : 'ativar';
    const msg = `Deseja realmente ${actionText} a categoria "${category.name}"?`;
    const title = category.isActive
      ? 'Confirmar Desativação'
      : 'Confirmar Ativação';

    const confirmed = await firstValueFrom(dialog.show(msg, title));
    if (!confirmed) return;

    this.isActionLoading.set(true);
    try {
      await firstValueFrom(
        this.mainCategoryService.changeStatusMainCategory(category.id, {
          ...category,
          isActive: isActivating,
        }),
      );
      this.toastService.showSuccess(
        `Categoria ${isActivating ? 'ativada' : 'desativada'} com sucesso!`,
      );
      this.refreshMainList();
    } catch (err) {
      this.toastService.handleApiError(err);
    } finally {
      this.isActionLoading.set(false);
    }
  }

  protected loadSubCategories(event: TableLazyLoadEvent): void {
    this.firstSub.set(event.first ?? 0);
    this.rowsSub.set(event.rows ?? 5);
  }

  protected onSearchSub(value: string): void {
    this.searchTermSub.set(value);
    this.firstSub.set(0);
  }

  protected openSubForm(mode: FormMode, subCategory?: SubCategory): void {
    this.formMode = mode;
    this.selectedSubCategory = subCategory;
    this.displaySubDrawer.set(true);
  }

  protected generateSubCategoryPdfReport(): void {
    this.toastService.showInfo(
      'A exportação para PDF está em desenvolvimento e estará disponível em breve!',
    );
  }

  protected async saveSubCategory(formValue: SubCategory): Promise<void> {
    this.isActionLoading.set(true);
    const op$ =
      this.formMode === FormMode.Create
        ? this.subCategoryService.createSubCategory(formValue)
        : this.subCategoryService.updateSubCategory(formValue, formValue.id);

    try {
      const response = await firstValueFrom(op$);
      if (response) {
        this.displaySubDrawer.set(false);
        this.refreshSubList();
      }
    } catch (err) {
      this.toastService.handleApiError(err);
    } finally {
      this.isActionLoading.set(false);
    }
  }

  protected async changeStatusSubCategory(
    subCategory: SubCategory,
  ): Promise<void> {
    const dialog = this.confirmDialog();
    if (!dialog) return;

    const isActivating = !subCategory.isActive;
    const actionText = subCategory.isActive ? 'desativar' : 'ativar';
    const msg = `Deseja realmente ${actionText} a subcategoria "${subCategory.name}"?`;
    const title = subCategory.isActive
      ? 'Confirmar Desativação'
      : 'Confirmar Ativação';

    const confirmed = await firstValueFrom(dialog.show(msg, title));
    if (!confirmed) return;

    this.isActionLoading.set(true);
    try {
      await firstValueFrom(
        this.subCategoryService.changeStatusSubCategory(subCategory.id, {
          ...subCategory,
          isActive: isActivating,
        }),
      );
      this.toastService.showSuccess(
        `Subcategoria ${isActivating ? 'ativada' : 'desativada'} com sucesso!`,
      );
      this.refreshSubList();
    } catch (err) {
      this.toastService.handleApiError(err);
    } finally {
      this.isActionLoading.set(false);
    }
  }

  private refreshMainList(): void {
    this.refreshTriggerMain.update((n) => n + 1);
  }

  private refreshSubList(): void {
    this.refreshTriggerSub.update((n) => n + 1);
  }
}
