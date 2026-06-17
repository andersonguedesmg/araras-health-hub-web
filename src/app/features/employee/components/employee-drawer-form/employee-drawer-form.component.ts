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
import { FormHelperService } from '../../../../core/services/form-helper.service';
import { cpfValidator } from '../../../../core/validators/cpf-cnpj.validator';
import { DrawerComponent } from '../../../../shared/components/drawer/drawer.component';
import { FormMode } from '../../../../shared/enums/form-mode.enum';
import { ToastService } from '../../../../shared/services/toast.service';
import { Employee } from '../../interfaces/employee';

@Component({
  selector: 'app-employee-drawer-form',
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
  templateUrl: './employee-drawer-form.component.html',
  styleUrl: './employee-drawer-form.component.scss',
})
export class EmployeeDrawerFormComponent {
  private fb = inject(FormBuilder);
  private formHelperService = inject(FormHelperService);
  private toastService = inject(ToastService);

  visible = model<boolean>(false);
  formMode = input<FormMode>(FormMode.Create);
  employeeData = input<Employee | undefined>(undefined);
  onSave = output<Employee>();

  FormMode = FormMode;
  employeeForm: FormGroup;
  isCpfValidating = signal<boolean>(false);

  isGlobalLoading = computed(() => this.isCpfValidating());

  statusOptions = [
    { label: 'Ativo', value: true },
    { label: 'Inativo', value: false },
  ];

  private readonly formLabels: { [key: string]: string } = {
    name: 'Nome Completo',
    cpf: 'CPF',
    function: 'Função / Cargo',
    phone: 'Telefone de Contato',
  };

  headerText = computed(() => {
    switch (this.formMode()) {
      case FormMode.Create:
        return 'Novo Funcionário';
      case FormMode.Update:
        return 'Editar Funcionário';
      case FormMode.Detail:
        return 'Detalhes do Funcionário';
    }
  });

  constructor() {
    this.employeeForm = this.fb.group({
      id: [{ value: null, disabled: true }],
      name: ['', Validators.required],
      cpf: ['', [Validators.required, cpfValidator()]],
      isActive: [{ value: true, disabled: true }],
      function: ['', Validators.required],
      phone: ['', Validators.required],
    });

    effect(() => {
      const isVisible = this.visible();
      const data = this.employeeData();
      const mode = this.formMode();

      if (isVisible) {
        setTimeout(() => this.syncFormState(data, mode), 0);
      }
    });
  }

  private syncFormState(
    currentData: Employee | undefined,
    mode: FormMode,
  ): void {
    this.employeeForm.reset();

    if (currentData) {
      this.employeeForm.patchValue(currentData);
    }

    if (mode === FormMode.Detail) {
      this.employeeForm.disable();
    } else {
      this.employeeForm.enable();
      if (mode === FormMode.Create) {
        this.employeeForm.get('isActive')?.setValue(true);
        this.employeeForm.get('isActive')?.disable();
      }
    }
  }

  validateCpf(): void {
    const cpfControl = this.employeeForm.get('cpf');
    if (cpfControl?.value && cpfControl.invalid) {
      this.toastService.showError('O número de CPF informado é inválido.');
    }
  }

  submitForm(): void {
    const isFormValid = this.formHelperService.validateAndShowErrors(
      this.employeeForm,
      this.formLabels,
    );

    if (isFormValid) {
      this.onSave.emit(this.employeeForm.getRawValue());
    }
  }
}
