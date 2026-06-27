import { CommonModule } from '@angular/common';
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
  ViewEncapsulation,
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
import { SubCategory } from '../../interfaces/sub-category';
import { MainCategoryService } from '../../services/main-category.service';

@Component({
  selector: 'app-sub-category-drawer-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DrawerComponent,
    ConfirmDialogComponent,
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './sub-category-drawer-form.component.html',
  styleUrl: './sub-category-drawer-form.component.scss',
})
export class SubCategoryDrawerFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly formHelperService = inject(FormHelperService);
  private readonly mainCategoryService = inject(MainCategoryService);
  private readonly confirmDialog =
    viewChild<ConfirmDialogComponent>('confirmDialog');

  visible = model<boolean>(false);
  formMode = input<FormMode>(FormMode.Create);
  subCategoryData = input<SubCategory | undefined>(undefined);
  onSave = output<SubCategory>();

  FormMode = FormMode;
  subCategoryForm: FormGroup;

  isOptionsLoading = signal<boolean>(false);
  isGlobalLoading = computed(() => this.isOptionsLoading());

  mainCategoryOptions = signal<SelectOptions<number>[]>([]);
  protected statusLabel = signal<string>('Ativo');

  private readonly formLabels: { [key: string]: string } = {
    name: 'Nome',
    mainCategoryId: 'Categoria Principal Vinculada',
  };

  headerText = computed(() => {
    switch (this.formMode()) {
      case FormMode.Create:
        return 'Nova Subcategoria';
      case FormMode.Update:
        return 'Editar Subcategoria';
      case FormMode.Detail:
        return 'Detalhes da Subcategoria';
    }
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

  protected isReadOnly = computed(() => {
    const mode = this.formMode();
    const data = this.subCategoryData();

    return (
      mode === FormMode.Detail ||
      (mode === FormMode.Update && data?.isActive === false)
    );
  });

  async submitForm(): Promise<void> {
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
