import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  OnDestroy,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectLazyLoadEvent, SelectModule } from 'primeng/select';
import {
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  Subject,
  Subscription,
} from 'rxjs';
import { FormHelperService } from '../../../../../../core/services/form-helper/form-helper.service';
import { ConfirmDialogComponent } from '../../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DrawerComponent } from '../../../../../../shared/components/drawer/drawer.component';
import { FormMode } from '../../../../../../shared/enums/form-mode.enum';
import { SelectOptions } from '../../../../../../shared/interfaces/select-options';
import { ToastService } from '../../../../../../shared/services/toast/toast.service';
import { Product } from '../../interfaces/product';
import { MainCategoryService } from '../../services/main-category/main-category.service';
import { PackagingTypeService } from '../../services/packaging-type/packaging-type.service';
import { SubCategoryService } from '../../services/sub-category/sub-category.service';

@Component({
  selector: 'app-product-drawer-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DrawerComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './product-drawer-form.component.html',
  styleUrl: './product-drawer-form.component.scss',
})
export class ProductDrawerFormComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly formHelperService = inject(FormHelperService);
  private readonly mainCategoryService = inject(MainCategoryService);
  private readonly subCategoryService = inject(SubCategoryService);
  private readonly packagingTypeService = inject(PackagingTypeService);
  private readonly toastService = inject(ToastService);
  private readonly confirmDialog =
    viewChild<ConfirmDialogComponent>('confirmDialog');

  readonly visible = model<boolean>(false);
  readonly formMode = input<FormMode>(FormMode.Create);
  readonly productData = input<Product | undefined>(undefined);
  readonly onSave = output<Product>();

  protected readonly FormMode = FormMode;
  protected readonly productForm: FormGroup;

  protected readonly isMainCategoryLoading = signal<boolean>(false);
  protected readonly isSubCategoryLoading = signal<boolean>(false);
  protected readonly isPackagingTypeLoading = signal<boolean>(false);
  protected readonly isGlobalLoading = computed(
    () =>
      this.isMainCategoryLoading() ||
      this.isSubCategoryLoading() ||
      this.isPackagingTypeLoading(),
  );
  protected readonly formSubmitted = signal<boolean>(false);

  protected readonly mainCategoryOptions = signal<SelectOptions<number>[]>([]);
  protected readonly subCategoryOptions = signal<SelectOptions<number>[]>([]);
  protected readonly packagingTypeOptions = signal<SelectOptions<number>[]>([]);
  protected readonly statusLabel = signal<string>('Ativo');

  private mainCategoryPage = 1;
  private readonly dropdownPageSize = 10;
  private mainCategorySearchTerm = '';
  private hasNextMainCategoryPage = true;
  private isMainCategoryRequestInProgress = false;

  private subCategoryPage = 1;
  private subCategorySearchTerm = '';
  private hasNextSubCategoryPage = true;
  private isSubCategoryRequestInProgress = false;

  private packagingTypePage = 1;
  private packagingTypeSearchTerm = '';
  private hasNextPackagingTypePage = true;
  private isPackagingTypeRequestInProgress = false;

  private isInitializing = false;

  private readonly mainCategoryFilterSubject = new Subject<string>();
  private readonly subCategoryFilterSubject = new Subject<string>();
  private readonly packagingTypeFilterSubject = new Subject<string>();

  private mainCategoryFilterSubscription?: Subscription;
  private subCategoryFilterSubscription?: Subscription;
  private packagingTypeFilterSubscription?: Subscription;
  private mainCategoryValueChangesSub?: Subscription;

  private readonly formLabels: Record<string, string> = {
    name: 'Nome',
    description: 'Descrição',
    mainCategoryId: 'Categoria Principal',
    subCategoryId: 'Subcategoria',
    packagingTypeId: 'Tipo de Embalagem',
  };

  protected readonly headerText = computed(() => {
    switch (this.formMode()) {
      case FormMode.Create:
        return 'Novo Produto';
      case FormMode.Update:
        return 'Editar Produto';
      case FormMode.Detail:
        return 'Detalhes do Produto';
      default:
        return 'Produto';
    }
  });

  protected readonly isReadOnly = computed(() => {
    const mode = this.formMode();
    const data = this.productData();

    return (
      mode === FormMode.Detail ||
      (mode === FormMode.Update && data?.isActive === false)
    );
  });

  constructor() {
    this.productForm = this.fb.group({
      id: [{ value: null, disabled: true }],
      name: ['', [Validators.required, Validators.maxLength(150)]],
      description: ['', [Validators.required, Validators.maxLength(200)]],
      mainCategoryId: [null, Validators.required],
      subCategoryId: [null, Validators.required],
      packagingTypeId: [null, Validators.required],
      isActive: [{ value: true, disabled: true }],
    });

    this.registerFilterDebounces();
    this.registerCategoryRelationListener();

    effect(() => {
      const isVisible = this.visible();
      const data = this.productData();
      const mode = this.formMode();

      if (isVisible) {
        this.initializeDropdownsAndForm(data, mode);
      } else {
        this.isInitializing = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.mainCategoryFilterSubscription?.unsubscribe();
    this.subCategoryFilterSubscription?.unsubscribe();
    this.packagingTypeFilterSubscription?.unsubscribe();
    this.mainCategoryValueChangesSub?.unsubscribe();
  }

  private registerFilterDebounces(): void {
    this.mainCategoryFilterSubscription = this.mainCategoryFilterSubject
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe((searchTerm) => {
        this.mainCategorySearchTerm = searchTerm;
        this.resetAndReloadMainCategoryDropdown();
      });

    this.subCategoryFilterSubscription = this.subCategoryFilterSubject
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe((searchTerm) => {
        this.subCategorySearchTerm = searchTerm;
        this.resetAndReloadSubCategoryDropdown();
      });

    this.packagingTypeFilterSubscription = this.packagingTypeFilterSubject
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe((searchTerm) => {
        this.packagingTypeSearchTerm = searchTerm;
        this.resetAndReloadPackagingTypeDropdown();
      });
  }

  private registerCategoryRelationListener(): void {
    const mainCategoryControl = this.productForm.get('mainCategoryId');

    this.mainCategoryValueChangesSub = mainCategoryControl?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe((selectedMainCategoryId) => {
        if (this.isInitializing) return;

        this.productForm.get('subCategoryId')?.setValue(null);
        this.subCategoryOptions.set([]);
        this.subCategoryPage = 1;
        this.hasNextSubCategoryPage = true;

        if (selectedMainCategoryId) {
          this.loadFirstPageSubCategoryComplement(selectedMainCategoryId);
        }
      });
  }

  private async initializeDropdownsAndForm(
    data: Product | undefined,
    mode: FormMode,
  ): Promise<void> {
    if (this.isInitializing) return;
    this.isInitializing = true;

    this.mainCategoryPage = 1;
    this.hasNextMainCategoryPage = true;
    this.isMainCategoryRequestInProgress = false;
    this.mainCategoryOptions.set([]);

    this.subCategoryPage = 1;
    this.hasNextSubCategoryPage = true;
    this.isSubCategoryRequestInProgress = false;
    this.subCategoryOptions.set([]);

    this.packagingTypePage = 1;
    this.hasNextPackagingTypePage = true;
    this.isPackagingTypeRequestInProgress = false;
    this.packagingTypeOptions.set([]);

    if (data?.mainCategoryId) {
      await this.ensureSelectedMainCategoryIsLoaded(data.mainCategoryId);
    }
    if (data?.subCategoryId) {
      await this.ensureSelectedSubCategoryIsLoaded(data.subCategoryId);
    }
    if (data?.packagingTypeId) {
      await this.ensureSelectedPackagingTypeIsLoaded(data.packagingTypeId);
    }

    const selectedMainCatId = data?.mainCategoryId;
    await Promise.all([
      this.loadFirstPageMainCategoryComplement(),
      this.loadFirstPagePackagingTypeComplement(),
      selectedMainCatId
        ? this.loadFirstPageSubCategoryComplement(selectedMainCatId)
        : Promise.resolve(),
    ]);

    this.syncFormState(data, mode);
    this.isInitializing = false;
  }

  private async resetAndReloadMainCategoryDropdown(): Promise<void> {
    this.mainCategoryPage = 1;
    this.hasNextMainCategoryPage = true;
    this.isMainCategoryRequestInProgress = false;

    const selectedId = this.productForm.get('mainCategoryId')?.value;
    const currentOptions = this.mainCategoryOptions();
    const selectedOption = currentOptions.find(
      (opt) => opt.value === selectedId,
    );

    this.mainCategoryOptions.set(selectedOption ? [selectedOption] : []);
    await this.loadNextMainCategoryPage();
  }

  private loadFirstPageMainCategoryComplement(): Promise<void> {
    if (this.isMainCategoryRequestInProgress) return Promise.resolve();

    this.isMainCategoryRequestInProgress = true;
    this.isMainCategoryLoading.set(true);

    const filterActive = this.formMode() === FormMode.Detail ? undefined : true;

    return new Promise((resolve) => {
      this.mainCategoryService
        .getMainCategoryPagedOptions(
          1,
          this.dropdownPageSize,
          this.mainCategorySearchTerm,
          filterActive,
        )
        .subscribe({
          next: (response) => {
            const incomingOptions = response.data || [];

            this.hasNextMainCategoryPage =
              response.hasNextPage ??
              incomingOptions.length === this.dropdownPageSize;

            this.mainCategoryOptions.update((existing) => {
              const existingIds = new Set(existing.map((item) => item.value));
              const filteredNew = incomingOptions.filter(
                (item: any) => !existingIds.has(item.value),
              );
              return [...existing, ...filteredNew];
            });

            this.mainCategoryPage = 2;
            this.isMainCategoryRequestInProgress = false;
            this.isMainCategoryLoading.set(false);
            resolve();
          },
          error: () => {
            this.isMainCategoryRequestInProgress = false;
            this.isMainCategoryLoading.set(false);
            resolve();
          },
        });
    });
  }

  private loadNextMainCategoryPage(): Promise<void> {
    if (this.isMainCategoryRequestInProgress || !this.hasNextMainCategoryPage) {
      return Promise.resolve();
    }

    this.isMainCategoryRequestInProgress = true;
    this.isMainCategoryLoading.set(true);

    const filterActive = this.formMode() === FormMode.Detail ? undefined : true;

    return new Promise((resolve) => {
      this.mainCategoryService
        .getMainCategoryPagedOptions(
          this.mainCategoryPage,
          this.dropdownPageSize,
          this.mainCategorySearchTerm,
          filterActive,
        )
        .subscribe({
          next: (response) => {
            const incomingOptions = response.data || [];

            this.hasNextMainCategoryPage =
              response.hasNextPage ??
              incomingOptions.length === this.dropdownPageSize;

            this.mainCategoryOptions.update((existing) => {
              const existingIds = new Set(existing.map((item) => item.value));
              const filteredNew = incomingOptions.filter(
                (item: any) => !existingIds.has(item.value),
              );
              return [...existing, ...filteredNew];
            });

            this.mainCategoryPage++;
            this.isMainCategoryRequestInProgress = false;
            this.isMainCategoryLoading.set(false);
            resolve();
          },
          error: () => {
            this.isMainCategoryRequestInProgress = false;
            this.isMainCategoryLoading.set(false);
            resolve();
          },
        });
    });
  }

  private ensureSelectedMainCategoryIsLoaded(
    selectedId: number,
  ): Promise<void> {
    const alreadyLoaded = this.mainCategoryOptions().some(
      (item) => item.value === selectedId,
    );

    if (alreadyLoaded) return Promise.resolve();

    this.isMainCategoryLoading.set(true);

    return new Promise((resolve) => {
      this.mainCategoryService.getMainCategoryById(selectedId).subscribe({
        next: (response) => {
          if (response && response.data) {
            const matchedItem: SelectOptions<number> = {
              label: response.data.name,
              value: response.data.id,
            };

            this.mainCategoryOptions.set([matchedItem]);
          }
          this.isMainCategoryLoading.set(false);
          resolve();
        },
        error: () => {
          this.isMainCategoryLoading.set(false);
          resolve();
        },
      });
    });
  }

  protected onMainCategoryLazyLoad(event: SelectLazyLoadEvent): void {
    if (
      this.isMainCategoryRequestInProgress ||
      !this.hasNextMainCategoryPage ||
      this.isMainCategoryLoading()
    )
      return;

    const lastLoadedIndex = event.last ?? 0;
    const currentListLength = this.mainCategoryOptions().length;

    if (lastLoadedIndex >= currentListLength - 3 || currentListLength === 0) {
      this.loadNextMainCategoryPage();
    }
  }

  protected onMainCategoryFilter(event: { filter: string }): void {
    this.mainCategoryFilterSubject.next(event.filter || '');
  }

  private async resetAndReloadSubCategoryDropdown(): Promise<void> {
    this.subCategoryPage = 1;
    this.hasNextSubCategoryPage = true;
    this.isSubCategoryRequestInProgress = false;

    const selectedId = this.productForm.get('subCategoryId')?.value;
    const currentOptions = this.subCategoryOptions();
    const selectedOption = currentOptions.find(
      (opt) => opt.value === selectedId,
    );

    this.subCategoryOptions.set(selectedOption ? [selectedOption] : []);
    await this.loadNextSubCategoryPage();
  }

  private loadFirstPageSubCategoryComplement(
    mainCategoryId: number,
  ): Promise<void> {
    if (this.isSubCategoryRequestInProgress) return Promise.resolve();

    this.isSubCategoryRequestInProgress = true;
    this.isSubCategoryLoading.set(true);

    const filterActive = this.formMode() === FormMode.Detail ? undefined : true;

    return new Promise((resolve) => {
      this.subCategoryService
        .getSubCategoryPagedOptions(
          1,
          this.dropdownPageSize,
          this.subCategorySearchTerm,
          mainCategoryId,
          filterActive,
        )
        .subscribe({
          next: (response) => {
            const incomingOptions = response.data || [];

            this.hasNextSubCategoryPage =
              response.hasNextPage ??
              incomingOptions.length === this.dropdownPageSize;

            this.subCategoryOptions.update((existing) => {
              const existingIds = new Set(existing.map((item) => item.value));
              const filteredNew = incomingOptions.filter(
                (item: any) => !existingIds.has(item.value),
              );
              return [...existing, ...filteredNew];
            });

            this.subCategoryPage = 2;
            this.isSubCategoryRequestInProgress = false;
            this.isSubCategoryLoading.set(false);
            resolve();
          },
          error: () => {
            this.isSubCategoryRequestInProgress = false;
            this.isSubCategoryLoading.set(false);
            resolve();
          },
        });
    });
  }

  private loadNextSubCategoryPage(): Promise<void> {
    const mainCategoryId = this.productForm.get('mainCategoryId')?.value;

    if (
      this.isSubCategoryRequestInProgress ||
      !this.hasNextSubCategoryPage ||
      !mainCategoryId
    ) {
      return Promise.resolve();
    }

    this.isSubCategoryRequestInProgress = true;
    this.isSubCategoryLoading.set(true);

    const filterActive = this.formMode() === FormMode.Detail ? undefined : true;

    return new Promise((resolve) => {
      this.subCategoryService
        .getSubCategoryPagedOptions(
          this.subCategoryPage,
          this.dropdownPageSize,
          this.subCategorySearchTerm,
          mainCategoryId,
          filterActive,
        )
        .subscribe({
          next: (response) => {
            const incomingOptions = response.data || [];

            this.hasNextSubCategoryPage =
              response.hasNextPage ??
              incomingOptions.length === this.dropdownPageSize;

            this.subCategoryOptions.update((existing) => {
              const existingIds = new Set(existing.map((item) => item.value));
              const filteredNew = incomingOptions.filter(
                (item: any) => !existingIds.has(item.value),
              );
              return [...existing, ...filteredNew];
            });

            this.subCategoryPage++;
            this.isSubCategoryRequestInProgress = false;
            this.isSubCategoryLoading.set(false);
            resolve();
          },
          error: () => {
            this.isSubCategoryRequestInProgress = false;
            this.isSubCategoryLoading.set(false);
            resolve();
          },
        });
    });
  }

  private ensureSelectedSubCategoryIsLoaded(selectedId: number): Promise<void> {
    const alreadyLoaded = this.subCategoryOptions().some(
      (item) => item.value === selectedId,
    );

    if (alreadyLoaded) return Promise.resolve();

    this.isSubCategoryLoading.set(true);

    return new Promise((resolve) => {
      this.subCategoryService.getSubCategoryById(selectedId).subscribe({
        next: (response) => {
          if (response && response.data) {
            const matchedItem: SelectOptions<number> = {
              label: response.data.name,
              value: response.data.id,
            };

            this.subCategoryOptions.set([matchedItem]);
          }
          this.isSubCategoryLoading.set(false);
          resolve();
        },
        error: () => {
          this.isSubCategoryLoading.set(false);
          resolve();
        },
      });
    });
  }

  protected onSubCategoryLazyLoad(event: SelectLazyLoadEvent): void {
    if (
      this.isSubCategoryRequestInProgress ||
      !this.hasNextSubCategoryPage ||
      this.isSubCategoryLoading()
    )
      return;

    const lastLoadedIndex = event.last ?? 0;
    const currentListLength = this.subCategoryOptions().length;

    if (lastLoadedIndex >= currentListLength - 3 || currentListLength === 0) {
      this.loadNextSubCategoryPage();
    }
  }

  protected onSubCategoryFilter(event: { filter: string }): void {
    this.subCategoryFilterSubject.next(event.filter || '');
  }

  private async resetAndReloadPackagingTypeDropdown(): Promise<void> {
    this.packagingTypePage = 1;
    this.hasNextPackagingTypePage = true;
    this.isPackagingTypeRequestInProgress = false;

    const selectedId = this.productForm.get('packagingTypeId')?.value;
    const currentOptions = this.packagingTypeOptions();
    const selectedOption = currentOptions.find(
      (opt) => opt.value === selectedId,
    );

    this.packagingTypeOptions.set(selectedOption ? [selectedOption] : []);
    await this.loadNextPackagingTypePage();
  }

  private loadFirstPagePackagingTypeComplement(): Promise<void> {
    if (this.isPackagingTypeRequestInProgress) return Promise.resolve();

    this.isPackagingTypeRequestInProgress = true;
    this.isPackagingTypeLoading.set(true);

    const filterActive = this.formMode() === FormMode.Detail ? undefined : true;

    return new Promise((resolve) => {
      this.packagingTypeService
        .getPackagingTypePagedOptions(
          1,
          this.dropdownPageSize,
          this.packagingTypeSearchTerm,
          filterActive,
        )
        .subscribe({
          next: (response) => {
            const incomingOptions = response.data || [];

            this.hasNextPackagingTypePage =
              response.hasNextPage ??
              incomingOptions.length === this.dropdownPageSize;

            this.packagingTypeOptions.update((existing) => {
              const existingIds = new Set(existing.map((item) => item.value));
              const filteredNew = incomingOptions.filter(
                (item: any) => !existingIds.has(item.value),
              );
              return [...existing, ...filteredNew];
            });

            this.packagingTypePage = 2;
            this.isPackagingTypeRequestInProgress = false;
            this.isPackagingTypeLoading.set(false);
            resolve();
          },
          error: () => {
            this.isPackagingTypeRequestInProgress = false;
            this.isPackagingTypeLoading.set(false);
            resolve();
          },
        });
    });
  }

  private loadNextPackagingTypePage(): Promise<void> {
    if (
      this.isPackagingTypeRequestInProgress ||
      !this.hasNextPackagingTypePage
    ) {
      return Promise.resolve();
    }

    this.isPackagingTypeRequestInProgress = true;
    this.isPackagingTypeLoading.set(true);

    const filterActive = this.formMode() === FormMode.Detail ? undefined : true;

    return new Promise((resolve) => {
      this.packagingTypeService
        .getPackagingTypePagedOptions(
          this.packagingTypePage,
          this.dropdownPageSize,
          this.packagingTypeSearchTerm,
          filterActive,
        )
        .subscribe({
          next: (response) => {
            const incomingOptions = response.data || [];

            this.hasNextPackagingTypePage =
              response.hasNextPage ??
              incomingOptions.length === this.dropdownPageSize;

            this.packagingTypeOptions.update((existing) => {
              const existingIds = new Set(existing.map((item) => item.value));
              const filteredNew = incomingOptions.filter(
                (item: any) => !existingIds.has(item.value),
              );
              return [...existing, ...filteredNew];
            });

            this.packagingTypePage++;
            this.isPackagingTypeRequestInProgress = false;
            this.isPackagingTypeLoading.set(false);
            resolve();
          },
          error: () => {
            this.isPackagingTypeRequestInProgress = false;
            this.isPackagingTypeLoading.set(false);
            resolve();
          },
        });
    });
  }

  private ensureSelectedPackagingTypeIsLoaded(
    selectedId: number,
  ): Promise<void> {
    const alreadyLoaded = this.packagingTypeOptions().some(
      (item) => item.value === selectedId,
    );

    if (alreadyLoaded) return Promise.resolve();

    this.isPackagingTypeLoading.set(true);

    return new Promise((resolve) => {
      this.packagingTypeService.getPackagingTypeById(selectedId).subscribe({
        next: (response) => {
          if (response && response.data) {
            const matchedItem: SelectOptions<number> = {
              label: response.data.name,
              value: response.data.id,
            };

            this.packagingTypeOptions.set([matchedItem]);
          }
          this.isPackagingTypeLoading.set(false);
          resolve();
        },
        error: () => {
          this.isPackagingTypeLoading.set(false);
          resolve();
        },
      });
    });
  }

  protected onPackagingTypeLazyLoad(event: SelectLazyLoadEvent): void {
    if (
      this.isPackagingTypeRequestInProgress ||
      !this.hasNextPackagingTypePage ||
      this.isPackagingTypeLoading()
    )
      return;

    const lastLoadedIndex = event.last ?? 0;
    const currentListLength = this.packagingTypeOptions().length;

    if (lastLoadedIndex >= currentListLength - 3 || currentListLength === 0) {
      this.loadNextPackagingTypePage();
    }
  }

  protected onPackagingTypeFilter(event: { filter: string }): void {
    this.packagingTypeFilterSubject.next(event.filter || '');
  }

  private syncFormState(
    currentData: Product | undefined,
    mode: FormMode,
  ): void {
    this.productForm.reset();
    this.formSubmitted.set(false);

    if (currentData) {
      this.productForm.patchValue(currentData);
      this.statusLabel.set(currentData.isActive ? 'Ativo' : 'Inativo');
    } else {
      this.statusLabel.set('Ativo');
    }

    if (
      mode === FormMode.Detail ||
      (mode === FormMode.Update && currentData?.isActive === false)
    ) {
      this.productForm.disable();
    } else {
      this.productForm.enable();
      this.productForm.get('id')?.disable();
      this.productForm.get('isActive')?.disable();

      if (mode === FormMode.Create) {
        this.productForm.get('isActive')?.setValue(true);
      }
    }
  }

  protected clearForm(): void {
    this.formSubmitted.set(false);
    this.toastService.clearAll();

    const data = this.productData();
    const mode = this.formMode();

    if (mode === FormMode.Update && data) {
      this.productForm.patchValue({
        id: data.id,
        name: '',
        description: '',
        mainCategoryId: null,
        subCategoryId: null,
        packagingTypeId: null,
        isActive: data.isActive,
      });
    } else {
      this.productForm.reset();
      this.productForm.get('isActive')?.setValue(true);
      this.statusLabel.set('Ativo');
    }
  }

  protected async submitForm(): Promise<void> {
    this.formSubmitted.set(true);

    const isFormValid = this.formHelperService.validateAndShowErrors(
      this.productForm,
      this.formLabels,
    );

    if (!isFormValid) {
      return;
    }

    const dialog = this.confirmDialog();
    if (!dialog) {
      this.onSave.emit(this.productForm.getRawValue());
      return;
    }

    const isCreate = this.formMode() === FormMode.Create;
    const title = isCreate ? 'Confirmar Cadastro' : 'Confirmar Alteração';
    const msg = isCreate
      ? 'Deseja realmente cadastrar este novo produto?'
      : 'Deseja salvar as alterações feitas no registro deste produto?';

    const confirmed = await firstValueFrom(dialog.show(msg, title));

    if (confirmed) {
      this.onSave.emit(this.productForm.getRawValue());
    }
  }
}
