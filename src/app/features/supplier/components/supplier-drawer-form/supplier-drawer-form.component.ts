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
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CepService } from '../../../../core/services/cep.service';
import { FormHelperService } from '../../../../core/services/form-helper.service';
import { cnpjValidator } from '../../../../core/validators/cpf-cnpj.validator';
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
    SelectModule,
    DrawerComponent,
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './supplier-drawer-form.component.html',
  styleUrl: './supplier-drawer-form.component.scss',
})
export class SupplierDrawerFormComponent {
  private fb = inject(FormBuilder);
  private formHelperService = inject(FormHelperService);
  protected cepService = inject(CepService);
  private toastService = inject(ToastService);

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

  statusOptions = [
    { label: 'Ativo', value: true },
    { label: 'Inativo', value: false },
  ];

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
    }

    if (mode === FormMode.Detail) {
      this.supplierForm.disable();
    } else {
      this.supplierForm.enable();
      if (mode === FormMode.Create) {
        this.supplierForm.get('isActive')?.setValue(true);
        this.supplierForm.get('isActive')?.disable();
      }
    }
  }

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

  submitForm(): void {
    const isFormValid = this.formHelperService.validateAndShowErrors(
      this.supplierForm,
      this.formLabels,
    );

    if (isFormValid) {
      this.onSave.emit(this.supplierForm.getRawValue());
    }
  }
}
