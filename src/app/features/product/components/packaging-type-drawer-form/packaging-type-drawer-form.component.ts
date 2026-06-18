import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
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
import { FormHelperService } from '../../../../core/services/form-helper.service';
import { DrawerComponent } from '../../../../shared/components/drawer/drawer.component';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { PackagingType } from '../../interfaces/packaging-type.interface';

@Component({
  selector: 'app-packaging-type-drawer-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DrawerComponent,
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './packaging-type-drawer-form.component.html',
  styleUrl: './packaging-type-drawer-form.component.scss',
})
export class PackagingTypeDrawerFormComponent {
  private fb = inject(FormBuilder);
  private formHelperService = inject(FormHelperService);

  visible = model<boolean>(false);
  formMode = input<FormMode>(FormMode.Create);
  packagingTypeData = input<PackagingType | undefined>(undefined);
  onSave = output<PackagingType>();

  FormMode = FormMode;
  packagingTypeForm: FormGroup;

  statusOptions = [
    { label: 'Ativo', value: true },
    { label: 'Inativo', value: false },
  ];

  private readonly formLabels: { [key: string]: string } = {
    name: 'Nome da Embalagem',
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
    }

    if (mode === FormMode.Detail) {
      this.packagingTypeForm.disable();
    } else {
      this.packagingTypeForm.enable();
      if (mode === FormMode.Create) {
        this.packagingTypeForm.get('isActive')?.setValue(true);
        this.packagingTypeForm.get('isActive')?.disable();
      }
    }
  }

  submitForm(): void {
    const isFormValid = this.formHelperService.validateAndShowErrors(
      this.packagingTypeForm,
      this.formLabels,
    );

    if (isFormValid) {
      this.onSave.emit(this.packagingTypeForm.getRawValue());
    }
  }
}
