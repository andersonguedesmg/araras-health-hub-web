import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  OnInit,
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
import { Roles } from '../../../../shared/enums/roles.enum';
import { Scope } from '../../../../shared/enums/scope.enum';
import { DropdownDataService } from '../../../../shared/services/dropdown-data.service';
import { Account } from '../../interfaces/account';

@Component({
  selector: 'app-account-drawer-form',
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
  templateUrl: './account-drawer-form.component.html',
  styleUrl: './account-drawer-form.component.scss',
})
export class AccountDrawerFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly formHelperService = inject(FormHelperService);
  private readonly dropdownDataService = inject(DropdownDataService);

  visible = model<boolean>(false);
  formMode = input<FormMode>(FormMode.Create);
  accountData = input<Account | undefined>(undefined);
  onSave = output<Account>();

  FormMode = FormMode;
  accountForm: FormGroup;
  facilityOptions = signal<{ label: string; value: number }[]>([]);

  rolesOptions = [
    { label: 'Usuário', value: Roles.User },
    { label: 'Administrador', value: Roles.Admin },
    { label: 'Master', value: Roles.Master },
  ];

  scopeOptions = [
    { label: 'Gerencial', value: Scope.Management },
    { label: 'Operacional', value: Scope.Operational },
  ];

  statusOptions = [
    { label: 'Ativo', value: true },
    { label: 'Inativo', value: false },
  ];

  private readonly formLabels: { [key: string]: string } = {
    userName: 'Nome de Usuário',
    password: 'Senha de Acesso',
    facilityId: 'Unidade de Saúde',
    role: 'Função / Perfil',
    scope: 'Escopo de Acesso',
  };

  headerText = computed(() => {
    switch (this.formMode()) {
      case FormMode.Create:
        return 'Nova Conta';
      case FormMode.Update:
        return 'Editar Conta';
      case FormMode.Detail:
        return 'Detalhes da Conta';
    }
  });

  constructor() {
    this.accountForm = this.fb.group({
      id: [{ value: null, disabled: true }],
      userId: [null],
      userName: ['', [Validators.required, Validators.maxLength(100)]],
      password: [''],
      facilityId: [null, Validators.required],
      role: [null, Validators.required],
      scope: [null, Validators.required],
      isActive: [{ value: true, disabled: true }],
    });

    effect(() => {
      const isVisible = this.visible();
      const data = this.accountData();
      const mode = this.formMode();

      if (isVisible) {
        setTimeout(() => this.syncFormState(data, mode), 0);
      }
    });
  }

  ngOnInit(): void {
    this.loadFacilities();
  }

  private async loadFacilities(): Promise<void> {
    try {
      const options = await this.dropdownDataService.getFacilitiesOptions();
      this.facilityOptions.set(options);
    } catch (error) {
      console.error('Erro ao buscar as opções de unidades de saúde:', error);
    }
  }

  private syncFormState(
    currentData: Account | undefined,
    mode: FormMode,
  ): void {
    this.accountForm.reset();
    const passwordControl = this.accountForm.get('password');

    if (mode === FormMode.Create) {
      passwordControl?.setValidators([Validators.required]);
      passwordControl?.enable();

      this.accountForm.get('isActive')?.setValue(true);
      this.accountForm.get('isActive')?.disable();
    } else {
      passwordControl?.clearValidators();
      passwordControl?.disable();

      if (currentData) {
        const patchValue = {
          id: currentData.id,
          userId: currentData.id,
          userName: currentData.userName,
          facilityId: currentData.facility?.id,
          role: currentData.role,
          scope: currentData.scope,
          isActive: currentData.isActive,
        };
        this.accountForm.patchValue(patchValue);
      }

      if (mode === FormMode.Detail) {
        this.accountForm.disable();
      } else {
        this.accountForm.enable();
        passwordControl?.disable();
      }
    }

    passwordControl?.updateValueAndValidity();
  }

  submitForm(): void {
    const isFormValid = this.formHelperService.validateAndShowErrors(
      this.accountForm,
      this.formLabels,
    );

    if (isFormValid) {
      const payload = this.accountForm.getRawValue();

      if (this.formMode() !== FormMode.Create) {
        delete payload.password;
      }

      this.onSave.emit(payload);
    }
  }
}
