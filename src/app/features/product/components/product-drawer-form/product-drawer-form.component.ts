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
import { Product } from '../../interfaces/product';

@Component({
  selector: 'app-product-drawer-form',
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
  templateUrl: './product-drawer-form.component.html',
  styleUrl: './product-drawer-form.component.scss',
})
export class ProductDrawerFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly formHelperService = inject(FormHelperService);

  visible = model<boolean>(false);
  formMode = input<FormMode>(FormMode.Create);
  productData = input<Product | undefined>(undefined);
  onSave = output<Product>();

  FormMode = FormMode;
  productForm: FormGroup;
  isLoading = signal<boolean>(false);

  statusOptions = [
    { label: 'Ativo', value: true },
    { label: 'Inativo', value: false },
  ];

  private readonly formLabels: { [key: string]: string } = {
    name: 'Nome do Produto',
    description: 'Descrição',
    mainCategory: 'Categoria Principal',
    subCategory: 'Subcategoria',
    packagingType: 'Tipo de Embalagem',
  };

  headerText = computed(() => {
    switch (this.formMode()) {
      case FormMode.Create:
        return 'Novo Produto';
      case FormMode.Update:
        return 'Editar Produto';
      case FormMode.Detail:
        return 'Detalhes do Produto';
    }
  });

  constructor() {
    this.productForm = this.fb.group({
      id: [{ value: null, disabled: true }],
      name: ['', Validators.required],
      description: ['', Validators.required],
      mainCategory: ['', Validators.required],
      subCategory: ['', Validators.required],
      packagingType: ['', Validators.required],
      isActive: [{ value: true, disabled: true }],
    });

    effect(() => {
      const isVisible = this.visible();
      const data = this.productData();
      const mode = this.formMode();

      if (isVisible) {
        setTimeout(() => this.syncFormState(data, mode), 0);
      }
    });
  }

  private syncFormState(
    currentData: Product | undefined,
    mode: FormMode,
  ): void {
    this.productForm.reset();

    if (currentData) {
      this.productForm.patchValue(currentData);
    }

    if (mode === FormMode.Detail) {
      this.productForm.disable();
    } else {
      this.productForm.enable();
      if (mode === FormMode.Create) {
        this.productForm.get('isActive')?.setValue(true);
        this.productForm.get('isActive')?.disable();
      }
    }
  }

  submitForm(): void {
    const isFormValid = this.formHelperService.validateAndShowErrors(
      this.productForm,
      this.formLabels,
    );

    if (isFormValid) {
      this.onSave.emit(this.productForm.getRawValue());
    }
  }
}
