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
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DrawerComponent } from '../../../../shared/components/drawer/drawer.component';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ToastService } from '../../../../shared/services/toast.service';
import { Facility } from '../../interfaces/facility';

@Component({
  selector: 'app-facility-drawer-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputMaskModule,
    DrawerComponent,
    ConfirmDialogComponent,
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './facility-drawer-form.component.html',
  styleUrl: './facility-drawer-form.component.scss',
})
export class FacilityDrawerFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly formHelperService = inject(FormHelperService);
  private readonly cepService = inject(CepService);
  private readonly toastService = inject(ToastService);
  private readonly confirmDialog =
    viewChild<ConfirmDialogComponent>('confirmDialog');

  visible = model<boolean>(false);
  formMode = input<FormMode>(FormMode.Create);
  facilityData = input<Facility | undefined>(undefined);
  onSave = output<Facility>();

  FormMode = FormMode;
  facilityForm: FormGroup;
  isCepValidating = signal<boolean>(false);
  formSubmitted = signal<boolean>(false);
  statusLabel = signal<string>('Ativo');

  isGlobalLoading = computed(
    () => this.isCepValidating() || this.cepService.isLoading(),
  );

  private readonly formLabels: Record<string, string> = {
    name: 'Nome',
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
        return 'Detalhes da Unidade de Saúde';
      default:
        return 'Unidade de Saúde';
    }
  });

  isReadOnly = computed(() => {
    const mode = this.formMode();
    const data = this.facilityData();
    return (
      mode === FormMode.Detail ||
      (mode === FormMode.Update && data?.isActive === false)
    );
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
        state: ['', [Validators.required, Validators.maxLength(2)]],
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
        this.syncFormState(data, mode);
      }
    });
  }

  private syncFormState(
    currentData: Facility | undefined,
    mode: FormMode,
  ): void {
    this.facilityForm.reset();
    this.formSubmitted.set(false);

    if (currentData) {
      this.facilityForm.patchValue(currentData);
      this.statusLabel.set(currentData.isActive ? 'Ativo' : 'Inativo');
    } else {
      this.statusLabel.set('Ativo');
    }

    if (
      mode === FormMode.Detail ||
      (mode === FormMode.Update && currentData?.isActive === false)
    ) {
      this.facilityForm.disable();
    } else {
      this.facilityForm.enable();
      this.facilityForm.get('id')?.disable();
      this.facilityForm.get('isActive')?.disable();

      if (mode === FormMode.Create) {
        this.facilityForm.get('isActive')?.setValue(true);
      }
    }
  }

  async searchCep(): Promise<void> {
    const addressGroup = this.facilityForm.get('address') as FormGroup;
    const cepControl = addressGroup.get('cep');

    if (!cepControl?.value || cepControl.invalid) {
      if (cepControl?.value && cepControl.invalid) {
        this.toastService.showError('O número de CEP informado é inválido.');
      }
      return;
    }

    const success = await this.cepService.fillAddressByCep(
      addressGroup,
      this.toastService,
    );

    if (success) {
      setTimeout(() => {
        const numberInput =
          document.getElementsByName('number')[0] ||
          document.getElementById('number');
        numberInput?.focus();
      }, 50);
    }
  }

  clearForm(): void {
    this.formSubmitted.set(false);
    this.toastService.clearAll();

    const data = this.facilityData();
    const mode = this.formMode();

    if (mode === FormMode.Update && data) {
      this.facilityForm.patchValue({
        id: data.id,
        name: '',
        cnes: '',
        isActive: data.isActive,
        address: {
          cep: '',
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: '',
        },
        contact: {
          email: '',
          phone: '',
        },
      });
    } else {
      this.facilityForm.reset();
      this.facilityForm.get('isActive')?.setValue(true);
      this.statusLabel.set('Ativo');
    }
  }

  async submitForm(): Promise<void> {
    this.formSubmitted.set(true);

    const isFormValid = this.formHelperService.validateAndShowErrors(
      this.facilityForm,
      this.formLabels,
    );

    if (!isFormValid) {
      return;
    }

    const dialog = this.confirmDialog();
    if (!dialog) {
      this.onSave.emit(this.facilityForm.getRawValue());
      return;
    }

    const isCreate = this.formMode() === FormMode.Create;
    const title = isCreate ? 'Confirmar Cadastro' : 'Confirmar Alteração';
    const msg = isCreate
      ? 'Deseja realmente cadastrar esta nova unidade de saúde?'
      : 'Deseja salvar as alterações feitas no registro desta unidade de saúde?';
    const confirmed = await firstValueFrom(dialog.show(msg, title));

    if (confirmed) {
      this.onSave.emit(this.facilityForm.getRawValue());
    }
  }
}
