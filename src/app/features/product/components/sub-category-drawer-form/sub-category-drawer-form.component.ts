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
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './sub-category-drawer-form.component.html',
  styleUrl: './sub-category-drawer-form.component.scss',
})
export class SubCategoryDrawerFormComponent {
  private fb = inject(FormBuilder);
  private formHelperService = inject(FormHelperService);
  private mainCategoryService = inject(MainCategoryService);

  visible = model<boolean>(false);
  formMode = input<FormMode>(FormMode.Create);
  subCategoryData = input<SubCategory | undefined>(undefined);
  onSave = output<SubCategory>();

  FormMode = FormMode;
  subCategoryForm: FormGroup;
  statusOptions = [
    { label: 'Ativo', value: true },
    { label: 'Inativo', value: false },
  ];
  mainCategoryOptions = signal<SelectOptions<number>[]>([]);

  private readonly formLabels = {
    name: 'Nome da Subcategoria',
    mainCategoryId: 'Categoria Principal Vinculada',
  };
  headerText = computed(() =>
    this.formMode() === FormMode.Create
      ? 'Nova Subcategoria'
      : this.formMode() === FormMode.Update
        ? 'Editar Subcategoria'
        : 'Detalhes da Subcategoria',
  );

  constructor() {
    this.subCategoryForm = this.fb.group({
      id: [{ value: null, disabled: true }],
      mainCategoryId: [null, Validators.required],
      name: ['', Validators.required],
      isActive: [{ value: true, disabled: true }],
    });

    effect(() => {
      if (this.visible()) {
        this.loadMainCategoryOptions();
        this.subCategoryForm.reset();

        if (this.subCategoryData())
          this.subCategoryForm.patchValue(this.subCategoryData()!);
        if (this.formMode() === FormMode.Detail) {
          this.subCategoryForm.disable();
        } else {
          this.subCategoryForm.enable();
          if (this.formMode() === FormMode.Create) {
            this.subCategoryForm.get('isActive')?.setValue(true);
            this.subCategoryForm.get('isActive')?.disable();
          }
        }
      }
    });
  }

  private loadMainCategoryOptions(): void {
    this.mainCategoryService.getMainCategoryOptions().subscribe({
      next: (options) => this.mainCategoryOptions.set(options),
    });
  }

  submitForm(): void {
    if (
      this.formHelperService.validateAndShowErrors(
        this.subCategoryForm,
        this.formLabels,
      )
    ) {
      this.onSave.emit(this.subCategoryForm.getRawValue());
    }
  }
}
