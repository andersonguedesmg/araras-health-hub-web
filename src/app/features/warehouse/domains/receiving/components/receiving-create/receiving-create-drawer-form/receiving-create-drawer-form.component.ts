import { CommonModule } from '@angular/common';
import { Component, OnDestroy, computed, effect, inject, input, model, output, signal, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Subject, Subscription, firstValueFrom } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormHelperService } from '../../../../../../../core/services/form-helper/form-helper.service';
import { ConfirmDialogComponent } from '../../../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DrawerComponent } from '../../../../../../../shared/components/drawer/drawer.component';
import { FormMode } from '../../../../../../../shared/enums/form-mode.enum';
import { ToastService } from '../../../../../../../shared/services/toast/toast.service';
import { ProductService } from '../../../../../../admin/domains/product/services/product/product.service';
import { ReceivingItemRequest } from '../../../interfaces/receiving';

export interface SelectOptions<T> {
  label: string;
  value: T;
  brand?: string;
}

export interface SelectLazyLoadEvent {
  first?: number;
  last?: number;
}

@Component({
  selector: 'app-receiving-create-drawer-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    SelectModule,
    DrawerComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './receiving-create-drawer-form.component.html',
  styleUrl: './receiving-create-drawer-form.component.scss',
})
export class ReceivingCreateDrawerFormComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly formHelperService = inject(FormHelperService);
  private readonly productService = inject(ProductService);
  private readonly toastService = inject(ToastService);

  private readonly confirmDialog = viewChild<ConfirmDialogComponent>('confirmDialog');

  readonly visible = model<boolean>(false);
  readonly formMode = input<FormMode>(FormMode.Create);
  readonly itemData = input<ReceivingItemRequest | undefined>(undefined);
  readonly save = output<ReceivingItemRequest>();

  protected readonly FormMode = FormMode;
  protected readonly form: FormGroup;

  protected readonly isProductLoading = signal<boolean>(false);
  protected readonly isGlobalLoading = computed(() => this.isProductLoading());
  protected readonly formSubmitted = signal<boolean>(false);

  protected readonly productOptions = signal<SelectOptions<number>[]>([]);

  private productPage = 1;
  private readonly dropdownPageSize = 10;
  private productSearchTerm = '';
  private hasNextProductPage = true;
  private isProductRequestInProgress = false;
  private isInitializing = false;

  private readonly productFilterSubject = new Subject<string>();
  private productFilterSubscription?: Subscription;

  private readonly formLabels: Record<string, string> = {
    product: 'Produto',
    brand: 'Marca',
    batch: 'Lote',
    expiryDate: 'Data de Validade',
    quantity: 'Quantidade',
    unitValue: 'Valor Unitário',
  };

  protected readonly headerText = computed(() => {
    switch (this.formMode()) {
      case FormMode.Update:
        return 'Editar Item de Recebimento';
      case FormMode.Detail:
        return 'Detalhes do Item';
      case FormMode.Create:
      default:
        return 'Adicionar Novo Item ao Recebimento';
    }
  });

  protected readonly isReadOnly = computed(() => {
    return this.formMode() === FormMode.Detail;
  });

  constructor() {
    this.form = this.fb.group({
      product: [null as SelectOptions<number> | null, [Validators.required]],
      brand: ['', [Validators.required]],
      batch: ['', [Validators.required, Validators.minLength(2)]],
      expiryDate: [null as Date | null, [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitValue: [0.01, [Validators.required, Validators.min(0.01)]],
    });

    this.registerFilterDebounces();

    effect(() => {
      const isVisible = this.visible();
      const data = this.itemData();
      const mode = this.formMode();

      if (isVisible) {
        this.initializeDropdownsAndForm(data, mode);
      } else {
        this.isInitializing = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.productFilterSubscription?.unsubscribe();
  }

  private registerFilterDebounces(): void {
    this.productFilterSubscription = this.productFilterSubject
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe((searchTerm) => {
        this.productSearchTerm = searchTerm;
        this.resetAndReloadProductDropdown();
      });
  }

  private async initializeDropdownsAndForm(data: ReceivingItemRequest | undefined, mode: FormMode): Promise<void> {
    if (this.isInitializing) return;
    this.isInitializing = true;

    this.productPage = 1;
    this.hasNextProductPage = true;
    this.isProductRequestInProgress = false;
    this.productOptions.set([]);

    if (data?.productId) {
      await this.ensureSelectedProductIsLoaded(data.productId);
    }

    await this.loadFirstPageProductComplement();

    this.syncFormState(data, mode);
    this.isInitializing = false;
  }

  private async resetAndReloadProductDropdown(): Promise<void> {
    this.productPage = 1;
    this.hasNextProductPage = true;
    this.isProductRequestInProgress = false;

    const selectedProduct = this.form.get('product')?.value as SelectOptions<number> | null;
    this.productOptions.set(selectedProduct ? [selectedProduct] : []);

    await this.loadNextProductPage();
  }

  private loadFirstPageProductComplement(): Promise<void> {
    if (this.isProductRequestInProgress) return Promise.resolve();

    this.isProductRequestInProgress = true;
    this.isProductLoading.set(true);

    return new Promise((resolve) => {
      this.productService.getProductPagedOptions(1, this.dropdownPageSize, this.productSearchTerm, true).subscribe({
        next: (response) => {
          const incomingOptions: SelectOptions<number>[] = response?.data || [];

          this.hasNextProductPage = response.hasNextPage ?? incomingOptions.length === this.dropdownPageSize;

          this.productOptions.update((existing) => {
            const existingIds = new Set(existing.map((item) => item.value));
            const filteredNew = incomingOptions.filter((item) => !existingIds.has(item.value));
            return [...existing, ...filteredNew];
          });

          this.productPage = 2;
          this.isProductRequestInProgress = false;
          this.isProductLoading.set(false);
          resolve();
        },
        error: () => {
          this.isProductRequestInProgress = false;
          this.isProductLoading.set(false);
          resolve();
        },
      });
    });
  }

  private loadNextProductPage(): Promise<void> {
    if (this.isProductRequestInProgress || !this.hasNextProductPage) {
      return Promise.resolve();
    }

    this.isProductRequestInProgress = true;
    this.isProductLoading.set(true);

    return new Promise((resolve) => {
      this.productService
        .getProductPagedOptions(this.productPage, this.dropdownPageSize, this.productSearchTerm, true)
        .subscribe({
          next: (response) => {
            const incomingOptions: SelectOptions<number>[] = response?.data || [];

            this.hasNextProductPage = response.hasNextPage ?? incomingOptions.length === this.dropdownPageSize;

            this.productOptions.update((existing) => {
              const existingIds = new Set(existing.map((item) => item.value));
              const filteredNew = incomingOptions.filter((item) => !existingIds.has(item.value));
              return [...existing, ...filteredNew];
            });

            this.productPage++;
            this.isProductRequestInProgress = false;
            this.isProductLoading.set(false);
            resolve();
          },
          error: () => {
            this.isProductRequestInProgress = false;
            this.isProductLoading.set(false);
            resolve();
          },
        });
    });
  }

  private ensureSelectedProductIsLoaded(selectedId: number): Promise<void> {
    const alreadyLoaded = this.productOptions().some((item) => item.value === selectedId);
    if (alreadyLoaded) return Promise.resolve();

    this.isProductLoading.set(true);

    return new Promise((resolve) => {
      this.productService.getProductById(selectedId).subscribe({
        next: (response) => {
          if (response && response.data) {
            const matchedItem: SelectOptions<number> = {
              label: response.data.name,
              value: response.data.id,
            };
            this.productOptions.set([matchedItem]);
          }
          this.isProductLoading.set(false);
          resolve();
        },
        error: () => {
          this.isProductLoading.set(false);
          resolve();
        },
      });
    });
  }

  protected onProductLazyLoad(event: SelectLazyLoadEvent): void {
    if (this.isProductRequestInProgress || !this.hasNextProductPage || this.isProductLoading()) {
      return;
    }

    const lastLoadedIndex = event.last ?? 0;
    const currentListLength = this.productOptions().length;

    if (lastLoadedIndex >= currentListLength - 3 || currentListLength === 0) {
      this.loadNextProductPage();
    }
  }

  protected onProductFilter(event: { filter: string }): void {
    this.productFilterSubject.next(event.filter || '');
  }

  protected onProductSelect(option: SelectOptions<number>): void {
    if (option && option.brand) {
      this.form.patchValue({ brand: option.brand });
    }
  }

  private syncFormState(currentData: ReceivingItemRequest | undefined, mode: FormMode): void {
    this.form.reset();
    this.formSubmitted.set(false);

    if (currentData) {
      const selectedProduct = this.productOptions().find((p) => p.value === currentData.productId) || {
        label: `Produto #${currentData.productId}`,
        value: currentData.productId,
        brand: currentData.brand,
      };

      this.form.patchValue({
        product: selectedProduct,
        brand: currentData.brand,
        batch: currentData.batch,
        expiryDate: currentData.expiryDate ? new Date(currentData.expiryDate) : null,
        quantity: currentData.quantity,
        unitValue: currentData.unitValue,
      });
    } else {
      this.form.patchValue({
        quantity: 1,
        unitValue: 0.01,
      });
    }

    if (mode === FormMode.Detail) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  protected clearForm(): void {
    this.formSubmitted.set(false);
    this.toastService.clearAll();

    const data = this.itemData();
    const mode = this.formMode();

    if (mode === FormMode.Update && data) {
      this.syncFormState(data, mode);
    } else {
      this.form.reset({
        product: null,
        brand: '',
        batch: '',
        expiryDate: null,
        quantity: 1,
        unitValue: 0.01,
      });
    }
  }

  protected async submitForm(): Promise<void> {
    this.formSubmitted.set(true);

    const isFormValid = this.formHelperService.validateAndShowErrors(this.form, this.formLabels);

    if (!isFormValid) {
      return;
    }

    const dialog = this.confirmDialog();
    if (!dialog) {
      this.executeSave();
      return;
    }

    const isCreate = this.formMode() === FormMode.Create;
    const title = isCreate ? 'Confirmar Adição' : 'Confirmar Alteração';
    const msg = isCreate
      ? 'Deseja realmente adicionar este item ao lote de recebimento?'
      : 'Deseja salvar as alterações neste item?';

    const confirmed = await firstValueFrom(dialog.show(msg, title));

    if (confirmed) {
      this.executeSave();
    }
  }

  private executeSave(): void {
    const raw = this.form.getRawValue();
    const selectedProduct = raw.product as SelectOptions<number>;

    const itemPayload: ReceivingItemRequest = {
      productId: selectedProduct.value,
      brand: raw.brand,
      batch: raw.batch,
      expiryDate: raw.expiryDate,
      quantity: raw.quantity,
      unitValue: raw.unitValue,
    };

    this.save.emit(itemPayload);
    this.closeDrawer();
  }

  protected closeDrawer(): void {
    this.visible.set(false);
    this.formSubmitted.set(false);
  }
}
