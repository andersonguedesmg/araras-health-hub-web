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
import { SelectModule } from 'primeng/select';
import { firstValueFrom } from 'rxjs';
import { FormHelperService } from '../../../../core/services/form-helper.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
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
    ConfirmDialogComponent,
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './account-drawer-form.component.html',
  styleUrl: './account-drawer-form.component.scss',
})
export class AccountDrawerFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly formHelperService = inject(FormHelperService);
  private readonly dropdownDataService = inject(DropdownDataService);
  private readonly confirmDialog =
    viewChild<ConfirmDialogComponent>('confirmDialog');

  visible = model<boolean>(false);
  formMode = input<FormMode>(FormMode.Create);
  accountData = input<Account | undefined>(undefined);
  onSave = output<Account>();

  FormMode = FormMode;
  accountForm: FormGroup;

  facilityOptions = signal<{ label: string; value: number }[]>([]);
  isFacilitiesLoading = signal<boolean>(false);

  isGlobalLoading = computed(() => this.isFacilitiesLoading());
  protected statusLabel = signal<string>('Ativo');

  rolesOptions = [
    { label: 'Usuário', value: Roles.User },
    { label: 'Administrador', value: Roles.Admin },
    { label: 'Master', value: Roles.Master },
  ];

  scopeOptions = [
    { label: 'Gerencial', value: Scope.Management },
    { label: 'Operacional', value: Scope.Operational },
  ];

  private readonly formLabels: { [key: string]: string } = {
    userName: 'Nome',
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

  protected isReadOnly = computed(() => {
    const mode = this.formMode();
    const data = this.accountData();

    return (
      mode === FormMode.Detail ||
      (mode === FormMode.Update && data?.isActive === false)
    );
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
      this.isFacilitiesLoading.set(true);
      const response = await this.dropdownDataService.getFacilitiesOptions();
      if (response && Array.isArray(response)) {
        this.facilityOptions.set(response);
      } else if (
        response &&
        'data' in response &&
        Array.isArray((response as any).data)
      ) {
        this.facilityOptions.set((response as any).data);
      } else {
        this.facilityOptions.set([]);
      }
    } catch (error) {
      console.error('Erro ao buscar as opções de unidades de saúde:', error);
      this.facilityOptions.set([]);
    } finally {
      this.isFacilitiesLoading.set(false);
    }
  }

  private syncFormState(
    currentData: Account | undefined,
    mode: FormMode,
  ): void {
    this.accountForm.reset();
    const passwordControl = this.accountForm.get('password');

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
      this.statusLabel.set(currentData.isActive ? 'Ativo' : 'Inativo');
    } else {
      this.statusLabel.set('Ativo');
    }

    if (
      mode === FormMode.Detail ||
      (mode === FormMode.Update && currentData?.isActive === false)
    ) {
      this.accountForm.disable();
    } else {
      this.accountForm.enable();
      this.accountForm.get('id')?.disable();
      this.accountForm.get('isActive')?.disable();

      if (mode === FormMode.Create) {
        passwordControl?.setValidators([Validators.required]);
        this.accountForm.get('isActive')?.setValue(true);
      } else {
        passwordControl?.clearValidators();
        passwordControl?.disable();
      }
    }

    passwordControl?.updateValueAndValidity();
  }

  async submitForm(): Promise<void> {
    const isFormValid = this.formHelperService.validateAndShowErrors(
      this.accountForm,
      this.formLabels,
    );

    if (!isFormValid) {
      return;
    }

    const dialog = this.confirmDialog();
    if (!dialog) {
      this.emitPayload();
      return;
    }

    const isCreate = this.formMode() === FormMode.Create;
    const title = isCreate ? 'Confirmar Cadastro' : 'Confirmar Alteração';
    const msg = isCreate
      ? 'Deseja realmente cadastrar esta nova conta?'
      : 'Deseja salvar as alterações feitas no registro desta conta?';

    const confirmed = await firstValueFrom(dialog.show(msg, title));

    if (confirmed) {
      this.emitPayload();
    }
  }

  private emitPayload(): void {
    const payload = this.accountForm.getRawValue();

    if (this.formMode() !== FormMode.Create) {
      delete payload.password;
    }

    this.onSave.emit(payload);
  }
}
