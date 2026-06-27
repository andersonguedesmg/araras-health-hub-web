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
import { firstValueFrom } from 'rxjs';
import { FormHelperService } from '../../../../core/services/form-helper.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DrawerComponent } from '../../../../shared/components/drawer/drawer.component';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { MainCategory } from '../../interfaces/main-category';

@Component({
  selector: 'app-main-category-drawer-form',
  standalone: true,
  imports: [
    CommonModule,
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
  private readonly confirmDialog =
    viewChild<ConfirmDialogComponent>('confirmDialog');

  visible = model<boolean>(false);
  formMode = input<FormMode>(FormMode.Create);
  mainCategoryData = input<MainCategory | undefined>(undefined);
  onSave = output<MainCategory>();

  FormMode = FormMode;
  mainCategoryForm: FormGroup;

  isSubmitting = signal<boolean>(false);
  isGlobalLoading = computed(() => this.isSubmitting());

  protected statusLabel = signal<string>('Ativo');

  private readonly formLabels: { [key: string]: string } = {
    name: 'Nome',
  };

  headerText = computed(() => {
    switch (this.formMode()) {
      case FormMode.Create:
        return 'Nova Categoria Principal';
      case FormMode.Update:
        return 'Editar Categoria Principal';
      case FormMode.Detail:
        return 'Detalhes da Categoria';
    }
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
        setTimeout(() => this.syncFormState(data, mode), 0);
      }
    });
  }

  private syncFormState(
    currentData: MainCategory | undefined,
    mode: FormMode,
  ): void {
    this.mainCategoryForm.reset();

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

  protected isReadOnly = computed(() => {
    const mode = this.formMode();
    const data = this.mainCategoryData();

    return (
      mode === FormMode.Detail ||
      (mode === FormMode.Update && data?.isActive === false)
    );
  });

  async submitForm(): Promise<void> {
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
