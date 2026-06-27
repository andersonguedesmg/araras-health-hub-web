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
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { firstValueFrom } from 'rxjs';
import { CepService } from '../../../../core/services/cep.service';
import { FormHelperService } from '../../../../core/services/form-helper.service';
import { cnpjValidator } from '../../../../core/validators/cpf-cnpj.validator';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DrawerComponent } from '../../../../shared/components/drawer/drawer.component';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ToastService } from '../../../../shared/services/toast.service';
import { Supplier } from '../../interfaces/supplier';

@Component({
  selector: 'app-supplier-drawer-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputMaskModule,
    DrawerComponent,
    ConfirmDialogComponent,
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './supplier-drawer-form.component.html',
  styleUrl: './supplier-drawer-form.component.scss',
})
export class SupplierDrawerFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly formHelperService = inject(FormHelperService);
  protected readonly cepService = inject(CepService);
  private readonly toastService = inject(ToastService);
  private readonly confirmDialog =
    viewChild<ConfirmDialogComponent>('confirmDialog');

  visible = model<boolean>(false);
  formMode = input<FormMode>(FormMode.Create);
  supplierData = input<Supplier | undefined>(undefined);
  onSave = output<Supplier>();

  FormMode = FormMode;
  supplierForm: FormGroup;
  isCnpjValidating = signal<boolean>(false);

  isGlobalLoading = computed(
    () => this.cepService.isLoading() || this.isCnpjValidating(),
  );

  protected statusLabel = signal<string>('Ativo');

  private readonly formLabels: { [key: string]: string } = {
    legalName: 'Razão Social',
    cnpj: 'CNPJ',
    'address.cep': 'CEP',
    'address.street': 'Logradouro',
    'address.number': 'Número',
    'address.neighborhood': 'Bairro',
    'address.city': 'Cidade',
    'address.state': 'UF',
    'contact.email': 'E-mail do Contato',
    'contact.phone': 'Telefone do Contato',
  };

  headerText = computed(() => {
    switch (this.formMode()) {
      case FormMode.Create:
        return 'Novo Fornecedor';
      case FormMode.Update:
        return 'Editar Fornecedor';
      case FormMode.Detail:
        return 'Detalhes do Fornecedor';
    }
  });

  constructor() {
    this.supplierForm = this.fb.group({
      id: [{ value: null, disabled: true }],
      legalName: ['', Validators.required],
      tradeName: [''],
      cnpj: ['', [Validators.required, cnpjValidator()]],
      isActive: [{ value: true, disabled: true }],
      address: this.fb.group({
        cep: ['', Validators.required],
        street: ['', Validators.required],
        number: ['', Validators.required],
        complement: [''],
        neighborhood: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
      }),
      contact: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
      }),
    });

    effect(() => {
      const isVisible = this.visible();
      const data = this.supplierData();
      const mode = this.formMode();

      if (isVisible) {
        setTimeout(() => this.syncFormState(data, mode), 0);
      }
    });
  }

  private syncFormState(
    currentData: Supplier | undefined,
    mode: FormMode,
  ): void {
    this.supplierForm.reset();

    if (currentData) {
      this.supplierForm.patchValue(currentData);
      this.statusLabel.set(currentData.isActive ? 'Ativo' : 'Inativo');
    } else {
      this.statusLabel.set('Ativo');
    }

    if (
      mode === FormMode.Detail ||
      (mode === FormMode.Update && currentData?.isActive === false)
    ) {
      this.supplierForm.disable();
    } else {
      this.supplierForm.enable();
      this.supplierForm.get('id')?.disable();
      this.supplierForm.get('isActive')?.disable();

      if (mode === FormMode.Create) {
        this.supplierForm.get('isActive')?.setValue(true);
      }
    }
  }

  protected isReadOnly = computed(() => {
    const mode = this.formMode();
    const data = this.supplierData();

    return (
      mode === FormMode.Detail ||
      (mode === FormMode.Update && data?.isActive === false)
    );
  });

  async searchCep(): Promise<void> {
    const addressGroup = this.supplierForm.get('address') as FormGroup;
    const success = await this.cepService.fillAddressByCep(
      addressGroup,
      this.toastService,
    );
    if (success) {
      setTimeout(() => document.getElementById('number')?.focus(), 50);
    }
  }

  validateCnpj(): void {
    const cnpjControl = this.supplierForm.get('cnpj');
    if (cnpjControl?.value && cnpjControl.invalid) {
      this.toastService.showError('O número de CNPJ informado é inválido.');
    }
  }

  async submitForm(): Promise<void> {
    const isFormValid = this.formHelperService.validateAndShowErrors(
      this.supplierForm,
      this.formLabels,
    );

    if (!isFormValid) {
      return;
    }

    const dialog = this.confirmDialog();
    if (!dialog) {
      this.onSave.emit(this.supplierForm.getRawValue());
      return;
    }

    const isCreate = this.formMode() === FormMode.Create;
    const title = isCreate ? 'Confirmar Cadastro' : 'Confirmar Alteração';
    const msg = isCreate
      ? 'Deseja realmente cadastrar este novo fornecedor?'
      : 'Deseja salvar as alterações feitas no registro deste fornecedor?';

    const confirmed = await firstValueFrom(dialog.show(msg, title));

    if (confirmed) {
      this.onSave.emit(this.supplierForm.getRawValue());
    }
  }
}
