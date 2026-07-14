import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
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
import { SelectModule } from 'primeng/select';
import { firstValueFrom } from 'rxjs';
import { FormHelperService } from '../../../../core/services/form-helper.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DrawerComponent } from '../../../../shared/components/drawer/drawer.component';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { SelectOptions } from '../../../../shared/interfaces/select-options';
import { ToastService } from '../../../../shared/services/toast.service';
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
export class SubCategoryDrawerFormComponent {
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

    effect(() => {
      const isVisible = this.visible();
      const data = this.subCategoryData();
      const mode = this.formMode();

      if (isVisible) {
        this.loadMainCategoryOptions();
        setTimeout(() => this.syncFormState(data, mode), 0);
      }
    });
  }

  private loadMainCategoryOptions(): void {
    this.isOptionsLoading.set(true);
    this.mainCategoryService.getMainCategoryOptions().subscribe({
      next: (options) => {
        this.mainCategoryOptions.set(options);
        this.isOptionsLoading.set(false);
      },
      error: () => this.isOptionsLoading.set(false),
    });
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
