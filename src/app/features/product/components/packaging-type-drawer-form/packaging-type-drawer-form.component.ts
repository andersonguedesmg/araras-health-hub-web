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
import { PackagingType } from '../../interfaces/packaging-type';

@Component({
  selector: 'app-packaging-type-drawer-form',
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
  templateUrl: './packaging-type-drawer-form.component.html',
  styleUrl: './packaging-type-drawer-form.component.scss',
})
export class PackagingTypeDrawerFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly formHelperService = inject(FormHelperService);
  private readonly confirmDialog =
    viewChild<ConfirmDialogComponent>('confirmDialog');

  visible = model<boolean>(false);
  formMode = input<FormMode>(FormMode.Create);
  packagingTypeData = input<PackagingType | undefined>(undefined);
  onSave = output<PackagingType>();

  FormMode = FormMode;
  packagingTypeForm: FormGroup;

  protected statusLabel = signal<string>('Ativo');

  private readonly formLabels: { [key: string]: string } = {
    name: 'Nome',
  };

  headerText = computed(() => {
    switch (this.formMode()) {
      case FormMode.Create:
        return 'Novo Tipo de Embalagem';
      case FormMode.Update:
        return 'Editar Tipo de Embalagem';
      case FormMode.Detail:
        return 'Detalhes do Tipo de Embalagem';
    }
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
        setTimeout(() => this.syncFormState(data, mode), 0);
      }
    });
  }

  private syncFormState(
    currentData: PackagingType | undefined,
    mode: FormMode,
  ): void {
    this.packagingTypeForm.reset();

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

  protected isReadOnly = computed(() => {
    const mode = this.formMode();
    const data = this.packagingTypeData();

    return (
      mode === FormMode.Detail ||
      (mode === FormMode.Update && data?.isActive === false)
    );
  });

  async submitForm(): Promise<void> {
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
