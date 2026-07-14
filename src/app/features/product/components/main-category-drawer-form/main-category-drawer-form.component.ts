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
import { firstValueFrom } from 'rxjs';
import { FormHelperService } from '../../../../core/services/form-helper.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DrawerComponent } from '../../../../shared/components/drawer/drawer.component';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ToastService } from '../../../../shared/services/toast.service';
import { MainCategory } from '../../interfaces/main-category';

@Component({
  selector: 'app-main-category-drawer-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DrawerComponent,
    ConfirmDialogComponent,
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './main-category-drawer-form.component.html',
  styleUrl: './main-category-drawer-form.component.scss',
})
export class MainCategoryDrawerFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly formHelperService = inject(FormHelperService);
  private readonly toastService = inject(ToastService);
  private readonly confirmDialog =
    viewChild<ConfirmDialogComponent>('confirmDialog');

  readonly visible = model<boolean>(false);
  readonly formMode = input<FormMode>(FormMode.Create);
  readonly mainCategoryData = input<MainCategory | undefined>(undefined);
  readonly onSave = output<MainCategory>();

  protected readonly FormMode = FormMode;
  protected mainCategoryForm: FormGroup;

  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly formSubmitted = signal<boolean>(false);
  protected readonly statusLabel = signal<string>('Ativo');

  protected readonly isGlobalLoading = computed(() => this.isSubmitting());

  private readonly formLabels: Record<string, string> = {
    name: 'Nome',
  };

  protected readonly headerText = computed(() => {
    switch (this.formMode()) {
      case FormMode.Create:
        return 'Nova Categoria Principal';
      case FormMode.Update:
        return 'Editar Categoria Principal';
      case FormMode.Detail:
        return 'Detalhes da Categoria';
      default:
        return 'Categoria Principal';
    }
  });

  protected readonly isReadOnly = computed(() => {
    const mode = this.formMode();
    const data = this.mainCategoryData();
    return (
      mode === FormMode.Detail ||
      (mode === FormMode.Update && data?.isActive === false)
    );
  });

  constructor() {
    this.mainCategoryForm = this.fb.group({
      id: [{ value: null, disabled: true }],
      name: ['', Validators.required],
      isActive: [{ value: true, disabled: true }],
    });

    effect(() => {
      const isVisible = this.visible();
      const data = this.mainCategoryData();
      const mode = this.formMode();

      if (isVisible) {
        this.syncFormState(data, mode);
      }
    });
  }

  private syncFormState(
    currentData: MainCategory | undefined,
    mode: FormMode,
  ): void {
    this.mainCategoryForm.reset();
    this.formSubmitted.set(false);

    if (currentData) {
      this.mainCategoryForm.patchValue(currentData);
      this.statusLabel.set(currentData.isActive ? 'Ativo' : 'Inativo');
    } else {
      this.statusLabel.set('Ativo');
    }

    if (
      mode === FormMode.Detail ||
      (mode === FormMode.Update && currentData?.isActive === false)
    ) {
      this.mainCategoryForm.disable();
    } else {
      this.mainCategoryForm.enable();
      this.mainCategoryForm.get('id')?.disable();
      this.mainCategoryForm.get('isActive')?.disable();

      if (mode === FormMode.Create) {
        this.mainCategoryForm.get('isActive')?.setValue(true);
      }
    }
  }

  protected clearForm(): void {
    this.formSubmitted.set(false);
    this.toastService.clearAll();
    const data = this.mainCategoryData();
    const mode = this.formMode();

    if (mode === FormMode.Update && data) {
      this.mainCategoryForm.patchValue({
        id: data.id,
        name: '',
        isActive: data.isActive,
      });
    } else {
      this.mainCategoryForm.reset();
      this.mainCategoryForm.get('isActive')?.setValue(true);
      this.statusLabel.set('Ativo');
    }
  }

  protected async submitForm(): Promise<void> {
    this.formSubmitted.set(true);

    const isFormValid = this.formHelperService.validateAndShowErrors(
      this.mainCategoryForm,
      this.formLabels,
    );

    if (!isFormValid) {
      return;
    }

    const dialog = this.confirmDialog();
    if (!dialog) {
      this.onSave.emit(this.mainCategoryForm.getRawValue());
      return;
    }

    const isCreate = this.formMode() === FormMode.Create;
    const title = isCreate ? 'Confirmar Cadastro' : 'Confirmar Alteração';
    const msg = isCreate
      ? 'Deseja realmente cadastrar esta nova categoria principal?'
      : 'Deseja salvar as alterações feitas no registro desta categoria principal?';

    const confirmed = await firstValueFrom(dialog.show(msg, title));

    if (confirmed) {
      this.onSave.emit(this.mainCategoryForm.getRawValue());
    }
  }
}
