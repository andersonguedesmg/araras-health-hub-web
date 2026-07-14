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
import { firstValueFrom } from 'rxjs';
import { FormHelperService } from '../../../../core/services/form-helper.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DrawerComponent } from '../../../../shared/components/drawer/drawer.component';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ToastService } from '../../../../shared/services/toast.service';
import { PackagingType } from '../../interfaces/packaging-type';

@Component({
  selector: 'app-packaging-type-drawer-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DrawerComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './packaging-type-drawer-form.component.html',
  styleUrl: './packaging-type-drawer-form.component.scss',
})
export class PackagingTypeDrawerFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly formHelperService = inject(FormHelperService);
  private readonly toastService = inject(ToastService);
  private readonly confirmDialog =
    viewChild<ConfirmDialogComponent>('confirmDialog');

  readonly visible = model<boolean>(false);
  readonly formMode = input<FormMode>(FormMode.Create);
  readonly packagingTypeData = input<PackagingType | undefined>(undefined);
  readonly onSave = output<PackagingType>();

  protected readonly FormMode = FormMode;
  protected readonly packagingTypeForm: FormGroup;
  protected readonly statusLabel = signal<string>('Ativo');
  protected readonly formSubmitted = signal<boolean>(false);

  private readonly formLabels: Record<string, string> = {
    name: 'Nome',
  };

  protected readonly headerText = computed(() => {
    switch (this.formMode()) {
      case FormMode.Create:
        return 'Novo Tipo de Embalagem';
      case FormMode.Update:
        return 'Editar Tipo de Embalagem';
      case FormMode.Detail:
        return 'Detalhes do Tipo de Embalagem';
      default:
        return 'Tipo de Embalagem';
    }
  });

  protected readonly isReadOnly = computed(() => {
    const mode = this.formMode();
    const data = this.packagingTypeData();

    return (
      mode === FormMode.Detail ||
      (mode === FormMode.Update && data?.isActive === false)
    );
  });

  constructor() {
    this.packagingTypeForm = this.fb.group({
      id: [{ value: null, disabled: true }],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      isActive: [{ value: true, disabled: true }],
    });

    effect(() => {
      const isVisible = this.visible();
      const data = this.packagingTypeData();
      const mode = this.formMode();

      if (isVisible) {
        this.syncFormState(data, mode);
      }
    });
  }

  private syncFormState(
    currentData: PackagingType | undefined,
    mode: FormMode,
  ): void {
    this.packagingTypeForm.reset();
    this.formSubmitted.set(false);

    if (currentData) {
      this.packagingTypeForm.patchValue(currentData);
      this.statusLabel.set(currentData.isActive ? 'Ativo' : 'Inativo');
    } else {
      this.statusLabel.set('Ativo');
    }

    if (
      mode === FormMode.Detail ||
      (mode === FormMode.Update && currentData?.isActive === false)
    ) {
      this.packagingTypeForm.disable();
    } else {
      this.packagingTypeForm.enable();
      this.packagingTypeForm.get('id')?.disable();
      this.packagingTypeForm.get('isActive')?.disable();

      if (mode === FormMode.Create) {
        this.packagingTypeForm.get('isActive')?.setValue(true);
      }
    }
  }

  clearForm(): void {
    this.formSubmitted.set(false);
    this.toastService.clearAll();
    const data = this.packagingTypeData();
    const mode = this.formMode();

    if (mode === FormMode.Update && data) {
      this.packagingTypeForm.patchValue({
        id: data.id,
        name: '',
        isActive: data.isActive,
      });
    } else {
      this.packagingTypeForm.reset();
      this.packagingTypeForm.get('isActive')?.setValue(true);
      this.statusLabel.set('Ativo');
    }
  }

  async submitForm(): Promise<void> {
    this.formSubmitted.set(true);

    const isFormValid = this.formHelperService.validateAndShowErrors(
      this.packagingTypeForm,
      this.formLabels,
    );

    if (!isFormValid) {
      return;
    }

    const dialog = this.confirmDialog();
    if (!dialog) {
      this.onSave.emit(this.packagingTypeForm.getRawValue());
      return;
    }

    const isCreate = this.formMode() === FormMode.Create;
    const title = isCreate ? 'Confirmar Cadastro' : 'Confirmar Alteração';
    const msg = isCreate
      ? 'Deseja realmente cadastrar este novo tipo de embalagem?'
      : 'Deseja salvar as alterações feitas no registro deste tipo de embalagem?';

    const confirmed = await firstValueFrom(dialog.show(msg, title));

    if (confirmed) {
      this.onSave.emit(this.packagingTypeForm.getRawValue());
    }
  }
}
