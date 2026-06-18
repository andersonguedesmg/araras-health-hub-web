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
import { MainCategory } from '../../interfaces/main-category';

@Component({
  selector: 'app-main-category-drawer-form',
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
  templateUrl: './main-category-drawer-form.component.html',
  styleUrl: './main-category-drawer-form.component.scss',
})
export class MainCategoryDrawerFormComponent {
  private fb = inject(FormBuilder);
  private formHelperService = inject(FormHelperService);

  visible = model<boolean>(false);
  formMode = input<FormMode>(FormMode.Create);
  mainCategoryData = input<MainCategory | undefined>(undefined);
  onSave = output<MainCategory>();

  FormMode = FormMode;
  mainCategoryForm: FormGroup;
  statusOptions = [
    { label: 'Ativo', value: true },
    { label: 'Inativo', value: false },
  ];

  private readonly formLabels = { name: 'Nome da Categoria' };
  headerText = computed(() =>
    this.formMode() === FormMode.Create
      ? 'Nova Categoria Principal'
      : this.formMode() === FormMode.Update
        ? 'Editar Categoria Principal'
        : 'Detalhes da Categoria',
  );

  constructor() {
    this.mainCategoryForm = this.fb.group({
      id: [{ value: null, disabled: true }],
      name: ['', Validators.required],
      isActive: [{ value: true, disabled: true }],
    });

    effect(() => {
      if (this.visible()) {
        this.mainCategoryForm.reset();
        if (this.mainCategoryData())
          this.mainCategoryForm.patchValue(this.mainCategoryData()!);
        if (this.formMode() === FormMode.Detail) {
          this.mainCategoryForm.disable();
        } else {
          this.mainCategoryForm.enable();
          if (this.formMode() === FormMode.Create) {
            this.mainCategoryForm.get('isActive')?.setValue(true);
            this.mainCategoryForm.get('isActive')?.disable();
          }
        }
      }
    });
  }

  submitForm(): void {
    if (
      this.formHelperService.validateAndShowErrors(
        this.mainCategoryForm,
        this.formLabels,
      )
    ) {
      this.onSave.emit(this.mainCategoryForm.getRawValue());
    }
  }
}
