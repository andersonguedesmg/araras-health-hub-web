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
import { Product } from '../../interfaces/product';

@Component({
  selector: 'app-product-drawer-form',
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
  templateUrl: './product-drawer-form.component.html',
  styleUrl: './product-drawer-form.component.scss',
})
export class ProductDrawerFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly formHelperService = inject(FormHelperService);
  private readonly confirmDialog =
    viewChild<ConfirmDialogComponent>('confirmDialog');

  visible = model<boolean>(false);
  formMode = input<FormMode>(FormMode.Create);
  productData = input<Product | undefined>(undefined);
  onSave = output<Product>();

  FormMode = FormMode;
  productForm: FormGroup;
  isLoading = signal<boolean>(false);

  isGlobalLoading = computed(() => this.isLoading());
  protected statusLabel = signal<string>('Ativo');

  private readonly formLabels: { [key: string]: string } = {
    name: 'Nome',
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
      this.statusLabel.set(currentData.isActive ? 'Ativo' : 'Inativo');
    } else {
      this.statusLabel.set('Ativo');
    }

    if (
      mode === FormMode.Detail ||
      (mode === FormMode.Update && currentData?.isActive === false)
    ) {
      this.productForm.disable();
    } else {
      this.productForm.enable();
      this.productForm.get('id')?.disable();
      this.productForm.get('isActive')?.disable();

      if (mode === FormMode.Create) {
        this.productForm.get('isActive')?.setValue(true);
      }
    }
  }

  protected isReadOnly = computed(() => {
    const mode = this.formMode();
    const data = this.productData();

    return (
      mode === FormMode.Detail ||
      (mode === FormMode.Update && data?.isActive === false)
    );
  });

  async submitForm(): Promise<void> {
    const isFormValid = this.formHelperService.validateAndShowErrors(
      this.productForm,
      this.formLabels,
    );

    if (!isFormValid) {
      return;
    }

    const dialog = this.confirmDialog();
    if (!dialog) {
      this.onSave.emit(this.productForm.getRawValue());
      return;
    }

    const isCreate = this.formMode() === FormMode.Create;
    const title = isCreate ? 'Confirmar Cadastro' : 'Confirmar Alteração';
    const msg = isCreate
      ? 'Deseja realmente cadastrar este novo produto?'
      : 'Deseja salvar as alterações feitas no registro deste produto?';

    const confirmed = await firstValueFrom(dialog.show(msg, title));

    if (confirmed) {
      this.onSave.emit(this.productForm.getRawValue());
    }
  }
}
