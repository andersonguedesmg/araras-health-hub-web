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
import { FormHelperService } from '../../../../../../core/services/form-helper.service';
import { ConfirmDialogComponent } from '../../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DrawerComponent } from '../../../../../../shared/components/drawer/drawer.component';
import { FormMode } from '../../../../../../shared/enums/form-mode.enum';
import { SelectOptions } from '../../../../../../shared/interfaces/select-options';
import { ToastService } from '../../../../../../shared/services/toast/toast.service';
import { SubCategory } from '../../interfaces/sub-category';
import { MainCategoryService } from '../../services/main-category.service';

@Component({
  selector: 'app-sub-category-drawer-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DrawerComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './sub-category-drawer-form.component.html',
  styleUrl: './sub-category-drawer-form.component.scss',
})
export class SubCategoryDrawerFormComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly formHelperService = inject(FormHelperService);
  private readonly mainCategoryService = inject(MainCategoryService);
  private readonly toastService = inject(ToastService);
  private readonly confirmDialog =
    viewChild<ConfirmDialogComponent>('confirmDialog');

  readonly visible = model<boolean>(false);
  readonly formMode = input<FormMode>(FormMode.Create);
  readonly subCategoryData = input<SubCategory | undefined>(undefined);
  readonly onSave = output<SubCategory>();

  protected readonly FormMode = FormMode;
  protected readonly subCategoryForm: FormGroup;

  protected readonly isOptionsLoading = signal<boolean>(false);
  protected readonly isGlobalLoading = computed(() => this.isOptionsLoading());
  protected readonly formSubmitted = signal<boolean>(false);

  protected readonly mainCategoryOptions = signal<SelectOptions<number>[]>([]);
  protected readonly statusLabel = signal<string>('Ativo');

  private currentDropdownPage = 1;
  private readonly dropdownPageSize = 10;
  private dropdownSearchTerm = '';
  private hasNextDropdownPage = true;
  private isRequestInProgress = false;
  private isInitializing = false;

  private readonly filterSubject = new Subject<string>();
  private filterSubscription?: Subscription;

  private readonly formLabels: Record<string, string> = {
    name: 'Nome',
    mainCategoryId: 'Categoria Principal Vinculada',
  };

  protected readonly headerText = computed(() => {
    switch (this.formMode()) {
      case FormMode.Create:
        return 'Nova Subcategoria';
      case FormMode.Update:
        return 'Editar Subcategoria';
      case FormMode.Detail:
        return 'Detalhes da Subcategoria';
      default:
        return 'Subcategoria';
    }
  });

  protected readonly isReadOnly = computed(() => {
    const mode = this.formMode();
    const data = this.subCategoryData();

    return (
      mode === FormMode.Detail ||
      (mode === FormMode.Update && data?.isActive === false)
    );
  });

  constructor() {
    this.subCategoryForm = this.fb.group({
      id: [{ value: null, disabled: true }],
      mainCategoryId: [null, Validators.required],
      name: ['', Validators.required],
      isActive: [{ value: true, disabled: true }],
    });

    this.registerFilterDebounce();

    effect(() => {
      const isVisible = this.visible();
      const data = this.subCategoryData();
      const mode = this.formMode();

      if (isVisible) {
        this.initializeDropdownAndForm(data, mode);
      } else {
        this.isInitializing = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.filterSubscription?.unsubscribe();
  }

  private registerFilterDebounce(): void {
    this.filterSubscription = this.filterSubject
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe((searchTerm) => {
        this.dropdownSearchTerm = searchTerm;
        this.resetAndReloadDropdown();
      });
  }

  private async initializeDropdownAndForm(
    data: SubCategory | undefined,
    mode: FormMode,
  ): Promise<void> {
    if (this.isInitializing) return;
    this.isInitializing = true;

    this.currentDropdownPage = 1;
    this.hasNextDropdownPage = true;
    this.isRequestInProgress = false;
    this.mainCategoryOptions.set([]);

    if (data?.mainCategoryId) {
      await this.ensureSelectedValueIsLoaded(data.mainCategoryId);
    }

    await this.loadFirstPageComplement();

    this.syncFormState(data, mode);
  }

  private async resetAndReloadDropdown(): Promise<void> {
    this.currentDropdownPage = 1;
    this.hasNextDropdownPage = true;
    this.isRequestInProgress = false;

    const selectedId = this.subCategoryForm.get('mainCategoryId')?.value;
    const currentOptions = this.mainCategoryOptions();
    const selectedOption = currentOptions.find(
      (opt) => opt.value === selectedId,
    );

    this.mainCategoryOptions.set(selectedOption ? [selectedOption] : []);
    await this.loadNextDropdownPage();
  }

  private loadFirstPageComplement(): Promise<void> {
    if (this.isRequestInProgress) return Promise.resolve();

    this.isRequestInProgress = true;
    this.isOptionsLoading.set(true);

    const filterActive = this.formMode() === FormMode.Detail ? undefined : true;

    return new Promise((resolve) => {
      this.mainCategoryService
        .getMainCategoryPagedOptions(
          1,
          this.dropdownPageSize,
          this.dropdownSearchTerm,
          filterActive,
        )
        .subscribe({
          next: (response) => {
            const incomingOptions = response.data || [];

            this.hasNextDropdownPage =
              response.hasNextPage ??
              incomingOptions.length === this.dropdownPageSize;

            this.mainCategoryOptions.update((existing) => {
              const existingIds = new Set(existing.map((item) => item.value));
              const filteredNew = incomingOptions.filter(
                (item: any) => !existingIds.has(item.value),
              );
              return [...existing, ...filteredNew];
            });

            this.currentDropdownPage = 2;
            this.isRequestInProgress = false;
            this.isOptionsLoading.set(false);
            resolve();
          },
          error: () => {
            this.isRequestInProgress = false;
            this.isOptionsLoading.set(false);
            resolve();
          },
        });
    });
  }

  private loadNextDropdownPage(): Promise<void> {
    if (this.isRequestInProgress || !this.hasNextDropdownPage) {
      return Promise.resolve();
    }

    this.isRequestInProgress = true;
    this.isOptionsLoading.set(true);

    const filterActive = this.formMode() === FormMode.Detail ? undefined : true;

    return new Promise((resolve) => {
      this.mainCategoryService
        .getMainCategoryPagedOptions(
          this.currentDropdownPage,
          this.dropdownPageSize,
          this.dropdownSearchTerm,
          filterActive,
        )
        .subscribe({
          next: (response) => {
            const incomingOptions = response.data || [];

            this.hasNextDropdownPage =
              response.hasNextPage ??
              incomingOptions.length === this.dropdownPageSize;

            this.mainCategoryOptions.update((existing) => {
              const existingIds = new Set(existing.map((item) => item.value));
              const filteredNew = incomingOptions.filter(
                (item: any) => !existingIds.has(item.value),
              );
              return [...existing, ...filteredNew];
            });

            this.currentDropdownPage++;
            this.isRequestInProgress = false;
            this.isOptionsLoading.set(false);
            resolve();
          },
          error: () => {
            this.isRequestInProgress = false;
            this.isOptionsLoading.set(false);
            resolve();
          },
        });
    });
  }

  private ensureSelectedValueIsLoaded(selectedId: number): Promise<void> {
    const alreadyLoaded = this.mainCategoryOptions().some(
      (item) => item.value === selectedId,
    );

    if (alreadyLoaded) {
      return Promise.resolve();
    }

    this.isOptionsLoading.set(true);

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
          this.isOptionsLoading.set(false);
          resolve();
        },
        error: () => {
          this.isOptionsLoading.set(false);
          resolve();
        },
      });
    });
  }

  protected onDropdownLazyLoad(event: SelectLazyLoadEvent): void {
    if (
      this.isRequestInProgress ||
      !this.hasNextDropdownPage ||
      this.isOptionsLoading()
    )
      return;

    const lastLoadedIndex = event.last ?? 0;
    const currentListLength = this.mainCategoryOptions().length;

    if (lastLoadedIndex >= currentListLength - 3 || currentListLength === 0) {
      this.loadNextDropdownPage();
    }
  }

  protected onDropdownFilter(event: { filter: string }): void {
    this.filterSubject.next(event.filter || '');
  }

  private syncFormState(
    currentData: SubCategory | undefined,
    mode: FormMode,
  ): void {
    this.subCategoryForm.reset();
    this.formSubmitted.set(false);

    if (currentData) {
      this.subCategoryForm.patchValue(currentData);
      this.statusLabel.set(currentData.isActive ? 'Ativo' : 'Inativo');
    } else {
      this.statusLabel.set('Ativo');
    }

    if (
      mode === FormMode.Detail ||
      (mode === FormMode.Update && currentData?.isActive === false)
    ) {
      this.subCategoryForm.disable();
    } else {
      this.subCategoryForm.enable();
      this.subCategoryForm.get('id')?.disable();
      this.subCategoryForm.get('isActive')?.disable();

      if (mode === FormMode.Create) {
        this.subCategoryForm.get('isActive')?.setValue(true);
      }
    }
  }

  protected clearForm(): void {
    this.formSubmitted.set(false);
    this.toastService.clearAll();

    const data = this.subCategoryData();
    const mode = this.formMode();

    if (mode === FormMode.Update && data) {
      this.subCategoryForm.patchValue({
        id: data.id,
        name: '',
        mainCategoryId: null,
        isActive: data.isActive,
      });
    } else {
      this.subCategoryForm.reset();
      this.subCategoryForm.get('isActive')?.setValue(true);
      this.statusLabel.set('Ativo');
    }
  }

  protected async submitForm(): Promise<void> {
    this.formSubmitted.set(true);

    const isFormValid = this.formHelperService.validateAndShowErrors(
      this.subCategoryForm,
      this.formLabels,
    );

    if (!isFormValid) {
      return;
    }

    const dialog = this.confirmDialog();
    if (!dialog) {
      this.onSave.emit(this.subCategoryForm.getRawValue());
      return;
    }

    const isCreate = this.formMode() === FormMode.Create;
    const title = isCreate ? 'Confirmar Cadastro' : 'Confirmar Alteração';
    const msg = isCreate
      ? 'Deseja realmente cadastrar esta nova subcategoria?'
      : 'Deseja salvar as alterações feitas no registro desta subcategoria?';

    const confirmed = await firstValueFrom(dialog.show(msg, title));

    if (confirmed) {
      this.onSave.emit(this.subCategoryForm.getRawValue());
    }
  }
}
