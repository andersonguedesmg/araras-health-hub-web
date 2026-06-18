import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  inject,
  viewChild,
} from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { Subject, Subscription, firstValueFrom } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ToastService } from '../../../../shared/services/toast.service';
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
    CommonModule,
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
  encapsulation: ViewEncapsulation.None,
  templateUrl: './categories-container.component.html',
  styleUrl: './categories-container.component.scss',
})
export class CategoriesContainerComponent implements OnInit, OnDestroy {
  private readonly mainCategoryService = inject(MainCategoryService);
  private readonly subCategoryService = inject(SubCategoryService);
  private readonly toastService = inject(ToastService);

  protected readonly mainCategories = this.mainCategoryService.mainCategories;
  protected readonly subCategories = this.subCategoryService.subCategories;
  private readonly confirmDialog =
    viewChild<ConfirmDialogComponent>('confirmDialog');

  readonly FormMode = FormMode;
  readonly title = 'Categorias e Classificações';
  readonly description =
    'Gerencie as categorias estruturais e subcategorias para a organização atômica dos itens do catálogo.';

  readonly itemsBreadcrumb = [
    { label: 'Catálogo', routerLink: '/administracao/produtos' },
    { label: 'Categorias', routerLink: '/administracao/produtos/categorias' },
  ];

  activeTab: string = 'main';
  formMode: FormMode = FormMode.Create;

  displayMainDrawer = false;
  selectedMainCategory?: MainCategory;
  totalRecordsMain = 0;
  rowsMain = 5;
  firstMain = 0;
  private searchTermMain = '';
  private readonly loadLazyMain = new Subject<any>();
  private lastLazyEventMain = { first: 0, rows: 5 };

  displaySubDrawer = false;
  selectedSubCategory?: SubCategory;
  totalRecordsSub = 0;
  rowsSub = 5;
  firstSub = 0;
  private searchTermSub = '';
  private readonly loadLazySub = new Subject<any>();
  private lastLazyEventSub = { first: 0, rows: 5 };

  private readonly subscriptions = new Subscription();

  ngOnInit(): void {
    this.subscriptions.add(
      this.loadLazyMain
        .pipe(
          debounceTime(300),
          switchMap((event) => {
            this.isLoading = true;
            this.firstMain = event.first;
            this.rowsMain = event.rows;
            const page = event.first / event.rows + 1;
            return this.mainCategoryService.loadMainCategories(
              page,
              event.rows,
              this.searchTermMain,
            );
          }),
        )
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response && response.totalCount !== undefined)
              this.totalRecordsMain = response.totalCount;
          },
          error: (err) => {
            this.isLoading = false;
            this.toastService.handleApiError(err);
          },
        }),
    );

    this.subscriptions.add(
      this.loadLazySub
        .pipe(
          debounceTime(300),
          switchMap((event) => {
            this.isLoading = true;
            this.firstSub = event.first;
            this.rowsSub = event.rows;
            const page = event.first / event.rows + 1;
            return this.subCategoryService.loadSubCategories(
              page,
              event.rows,
              this.searchTermSub,
            );
          }),
        )
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response && response.totalCount !== undefined)
              this.totalRecordsSub = response.totalCount;
          },
          error: (err) => {
            this.isLoading = false;
            this.toastService.handleApiError(err);
          },
        }),
    );

    this.loadLazyMain.next(this.lastLazyEventMain);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get isLoading(): boolean {
    return false;
  }
  private _loading = false;
  set isLoading(v: boolean) {
    this._loading = v;
  }

  onTabChange(tab: string | unknown): void {
    const tabString = tab as string;
    this.activeTab = tabString;
    if (tabString === 'main') {
      this.loadMainCategories(this.lastLazyEventMain);
    } else {
      this.loadSubCategories(this.lastLazyEventSub);
    }
  }

  loadMainCategories(event: any): void {
    this.lastLazyEventMain = event;
    this.loadLazyMain.next(event);
  }

  onSearchMain(value: string): void {
    this.searchTermMain = value;
    this.loadMainCategories({ first: 0, rows: this.lastLazyEventMain.rows });
  }

  openMainForm(mode: FormMode, category?: MainCategory): void {
    this.formMode = mode;
    this.selectedMainCategory = category;
    this.displayMainDrawer = true;
  }

  async saveMainCategory(formValue: MainCategory): Promise<void> {
    this.isLoading = true;
    const op$ =
      this.formMode === FormMode.Create
        ? this.mainCategoryService.createMainCategory(formValue)
        : this.mainCategoryService.updateMainCategory(formValue, formValue.id);

    try {
      if (await firstValueFrom(op$)) {
        this.displayMainDrawer = false;
        this.loadLazyMain.next(this.lastLazyEventMain);
      }
    } catch (err) {
      this.toastService.handleApiError(err);
    } finally {
      this.isLoading = false;
    }
  }

  async changeStatusMainCategory(category: MainCategory): Promise<void> {
    const dialog = this.confirmDialog();
    if (!dialog) return;

    const isActivating = !category.isActive;
    const msg = `Deseja realmente ${category.isActive ? 'desativar' : 'ativar'} a categoria "${category.name}"?`;
    const confirmed = await firstValueFrom(
      dialog.show(
        msg,
        category.isActive ? 'Confirmar Desativação' : 'Confirmar Ativação',
      ),
    );
    if (!confirmed) return;

    this.isLoading = true;
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
      this.loadLazyMain.next(this.lastLazyEventMain);
    } catch (err) {
      this.toastService.handleApiError(err);
    } finally {
      this.isLoading = false;
    }
  }

  loadSubCategories(event: any): void {
    this.lastLazyEventSub = event;
    this.loadLazySub.next(event);
  }

  onSearchSub(value: string): void {
    this.searchTermSub = value;
    this.loadSubCategories({ first: 0, rows: this.lastLazyEventSub.rows });
  }

  openSubForm(mode: FormMode, subCategory?: SubCategory): void {
    this.formMode = mode;
    this.selectedSubCategory = subCategory;
    this.displaySubDrawer = true;
  }

  async saveSubCategory(formValue: SubCategory): Promise<void> {
    this.isLoading = true;
    const op$ =
      this.formMode === FormMode.Create
        ? this.subCategoryService.createSubCategory(formValue)
        : this.subCategoryService.updateSubCategory(formValue, formValue.id);

    try {
      if (await firstValueFrom(op$)) {
        this.displaySubDrawer = false;
        this.loadLazySub.next(this.lastLazyEventSub);
      }
    } catch (err) {
      this.toastService.handleApiError(err);
    } finally {
      this.isLoading = false;
    }
  }

  async changeStatusSubCategory(subCategory: SubCategory): Promise<void> {
    const dialog = this.confirmDialog();
    if (!dialog) return;

    const isActivating = !subCategory.isActive;
    const msg = `Deseja realmente ${subCategory.isActive ? 'desativar' : 'ativar'} a subcategoria "${subCategory.name}"?`;
    const confirmed = await firstValueFrom(
      dialog.show(
        msg,
        subCategory.isActive ? 'Confirmar Desativação' : 'Confirmar Ativação',
      ),
    );
    if (!confirmed) return;

    this.isLoading = true;
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
      this.loadLazySub.next(this.lastLazyEventSub);
    } catch (err) {
      this.toastService.handleApiError(err);
    } finally {
      this.isLoading = false;
    }
  }
}
