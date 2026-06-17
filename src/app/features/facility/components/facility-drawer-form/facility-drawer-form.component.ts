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
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CepService } from '../../../../core/services/cep.service';
import { FormHelperService } from '../../../../core/services/form-helper.service';
import { DrawerComponent } from '../../../../shared/components/drawer/drawer.component';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ToastService } from '../../../../shared/services/toast.service';
import { Facility } from '../../interfaces/facility';

@Component({
  selector: 'app-facility-drawer-form',
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
  templateUrl: './facility-drawer-form.component.html',
  styleUrl: './facility-drawer-form.component.scss',
})
export class FacilityDrawerFormComponent {
  private fb = inject(FormBuilder);
  private formHelperService = inject(FormHelperService);
  protected cepService = inject(CepService);
  private toastService = inject(ToastService);

  visible = model<boolean>(false);
  formMode = input<FormMode>(FormMode.Create);
  facilityData = input<Facility | undefined>(undefined);
  onSave = output<Facility>();

  FormMode = FormMode;
  facilityForm: FormGroup;

  isGlobalLoading = computed(() => this.cepService.isLoading());

  statusOptions = [
    { label: 'Ativo', value: true },
    { label: 'Inativo', value: false },
  ];

  private readonly formLabels: { [key: string]: string } = {
    name: 'Nome da Unidade',
    cnes: 'CNES',
    'address.cep': 'CEP',
    'address.street': 'Endereço (Logradouro)',
    'address.number': 'Número',
    'address.neighborhood': 'Bairro',
    'address.city': 'Cidade',
    'address.state': 'UF',
    'contact.email': 'E-mail',
    'contact.phone': 'Telefone',
  };

  headerText = computed(() => {
    switch (this.formMode()) {
      case FormMode.Create:
        return 'Nova Unidade de Saúde';
      case FormMode.Update:
        return 'Editar Unidade de Saúde';
      case FormMode.Detail:
        return 'Detalhes da Unidade';
    }
  });

  constructor() {
    this.facilityForm = this.fb.group({
      id: [{ value: null, disabled: true }],
      name: ['', Validators.required],
      cnes: ['', Validators.required],
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
      const data = this.facilityData();
      const mode = this.formMode();

      if (isVisible) {
        setTimeout(() => this.syncFormState(data, mode), 0);
      }
    });
  }

  private syncFormState(
    currentData: Facility | undefined,
    mode: FormMode,
  ): void {
    this.facilityForm.reset();

    if (currentData) {
      this.facilityForm.patchValue(currentData);
    }

    if (mode === FormMode.Detail) {
      this.facilityForm.disable();
    } else {
      this.facilityForm.enable();
      if (mode === FormMode.Create) {
        this.facilityForm.get('isActive')?.setValue(true);
        this.facilityForm.get('isActive')?.disable();
      }
    }
  }

  async searchCep(): Promise<void> {
    const addressGroup = this.facilityForm.get('address') as FormGroup;
    const success = await this.cepService.fillAddressByCep(
      addressGroup,
      this.toastService,
    );
    if (success) {
      setTimeout(() => document.getElementById('number')?.focus(), 50);
    }
  }

  submitForm(): void {
    const isFormValid = this.formHelperService.validateAndShowErrors(
      this.facilityForm,
      this.formLabels,
    );

    if (isFormValid) {
      this.onSave.emit(this.facilityForm.getRawValue());
    }
  }
}
