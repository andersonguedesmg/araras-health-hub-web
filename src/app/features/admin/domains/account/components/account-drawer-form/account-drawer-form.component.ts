import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  OnDestroy,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectLazyLoadEvent, SelectModule } from 'primeng/select';
import {
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  Subject,
  Subscription,
} from 'rxjs';
import { AuthService } from '../../../../../../core/services/auth.service';
import { FormHelperService } from '../../../../../../core/services/form-helper.service';
import { ConfirmDialogComponent } from '../../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DrawerComponent } from '../../../../../../shared/components/drawer/drawer.component';
import { FormMode } from '../../../../../../shared/enums/form-mode.enum';
import { Roles } from '../../../../../../shared/enums/roles.enum';
import { Scope } from '../../../../../../shared/enums/scope.enum';
import { SelectOptions } from '../../../../../../shared/interfaces/select-options';
import { ToastService } from '../../../../../../shared/services/toast/toast.service';
import { FacilityService } from '../../../facility/services/facility.service';
import { Account } from '../../interfaces/account';

@Component({
  selector: 'app-account-drawer-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DrawerComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './account-drawer-form.component.html',
  styleUrl: './account-drawer-form.component.scss',
})
export class AccountDrawerFormComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly formHelperService = inject(FormHelperService);
  private readonly facilityService = inject(FacilityService);
  private readonly toastService = inject(ToastService);
  private readonly confirmDialog =
    viewChild<ConfirmDialogComponent>('confirmDialog');

  readonly visible = model<boolean>(false);
  readonly formMode = input<FormMode>(FormMode.Create);
  readonly accountData = input<Account | undefined>(undefined);
  readonly onSave = output<Account>();

  protected readonly FormMode = FormMode;
  protected readonly accountForm: FormGroup;

  protected readonly facilityOptions = signal<SelectOptions<number>[]>([]);
  protected readonly isFacilitiesLoading = signal<boolean>(false);
  protected readonly isGlobalLoading = computed(() =>
    this.isFacilitiesLoading(),
  );
  protected readonly formSubmitted = signal<boolean>(false);
  protected readonly statusLabel = signal<string>('Ativo');

  protected readonly canEditRoleAndScope = this.authService.hasMasterPermission;

  protected readonly rolesOptions = [
    { label: 'Usuário', value: Roles.User },
    { label: 'Administrador', value: Roles.Admin },
    { label: 'Master', value: Roles.Master },
  ];

  protected readonly scopeOptions = [
    { label: 'Gerencial', value: Scope.Management },
    { label: 'Operacional', value: Scope.Operational },
  ];

  private currentFacilityPage = 1;
  private readonly facilityPageSize = 10;
  private facilitySearchTerm = '';
  private hasNextFacilityPage = true;
  private isFacilityRequestInProgress = false;
  private isInitializing = false;

  private readonly facilityFilterSubject = new Subject<string>();
  private facilityFilterSubscription?: Subscription;

  private readonly formLabels: Record<string, string> = {
    userName: 'Nome',
    password: 'Senha de Acesso',
    facilityId: 'Unidade de Saúde',
    role: 'Função / Perfil',
    scope: 'Escopo de Acesso',
  };

  protected readonly headerText = computed(() => {
    switch (this.formMode()) {
      case FormMode.Create:
        return 'Nova Conta';
      case FormMode.Update:
        return 'Editar Conta';
      case FormMode.Detail:
        return 'Detalhes da Conta';
      default:
        return 'Conta';
    }
  });

  protected readonly isReadOnly = computed(() => {
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

    this.registerFacilityFilterDebounce();

    effect(() => {
      const isVisible = this.visible();
      const data = this.accountData();
      const mode = this.formMode();

      if (isVisible) {
        this.initializeFacilityDropdownAndForm(data, mode);
      } else {
        this.isInitializing = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.facilityFilterSubscription?.unsubscribe();
  }

  private registerFacilityFilterDebounce(): void {
    this.facilityFilterSubscription = this.facilityFilterSubject
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe((searchTerm) => {
        this.facilitySearchTerm = searchTerm;
        this.resetAndReloadFacilityDropdown();
      });
  }

  private async initializeFacilityDropdownAndForm(
    data: Account | undefined,
    mode: FormMode,
  ): Promise<void> {
    if (this.isInitializing) return;
    this.isInitializing = true;

    this.currentFacilityPage = 1;
    this.hasNextFacilityPage = true;
    this.isFacilityRequestInProgress = false;
    this.facilityOptions.set([]);

    if (data?.facility?.id) {
      await this.ensureSelectedFacilityIsLoaded(
        data.facility.id,
        data.facility.name,
      );
    }

    await this.loadFirstFacilityPageComplement();

    this.syncFormState(data, mode);
  }

  private async resetAndReloadFacilityDropdown(): Promise<void> {
    this.currentFacilityPage = 1;
    this.hasNextFacilityPage = true;
    this.isFacilityRequestInProgress = false;

    const selectedId = this.accountForm.get('facilityId')?.value;
    const currentOptions = this.facilityOptions();
    const selectedOption = currentOptions.find(
      (opt) => opt.value === selectedId,
    );

    this.facilityOptions.set(selectedOption ? [selectedOption] : []);
    await this.loadNextFacilityPage();
  }

  private loadFirstFacilityPageComplement(): Promise<void> {
    if (this.isFacilityRequestInProgress) return Promise.resolve();

    this.isFacilityRequestInProgress = true;
    this.isFacilitiesLoading.set(true);

    const filterActive = this.formMode() === FormMode.Detail ? undefined : true;

    return new Promise((resolve) => {
      this.facilityService
        .getFacilityPagedOptions(
          1,
          this.facilityPageSize,
          this.facilitySearchTerm,
          filterActive,
        )
        .subscribe({
          next: (response) => {
            const incomingOptions = response.data || [];

            this.hasNextFacilityPage =
              response.hasNextPage ??
              incomingOptions.length === this.facilityPageSize;

            this.facilityOptions.update((existing) => {
              const existingIds = new Set(existing.map((item) => item.value));
              const filteredNew = incomingOptions.filter(
                (item) => !existingIds.has(item.value),
              );
              return [...existing, ...filteredNew];
            });

            this.currentFacilityPage = 2;
            this.isFacilityRequestInProgress = false;
            this.isFacilitiesLoading.set(false);
            resolve();
          },
          error: () => {
            this.isFacilityRequestInProgress = false;
            this.isFacilitiesLoading.set(false);
            resolve();
          },
        });
    });
  }

  private loadNextFacilityPage(): Promise<void> {
    if (this.isFacilityRequestInProgress || !this.hasNextFacilityPage) {
      return Promise.resolve();
    }

    this.isFacilityRequestInProgress = true;
    this.isFacilitiesLoading.set(true);

    const filterActive = this.formMode() === FormMode.Detail ? undefined : true;

    return new Promise((resolve) => {
      this.facilityService
        .getFacilityPagedOptions(
          this.currentFacilityPage,
          this.facilityPageSize,
          this.facilitySearchTerm,
          filterActive,
        )
        .subscribe({
          next: (response) => {
            const incomingOptions = response.data || [];

            this.hasNextFacilityPage =
              response.hasNextPage ??
              incomingOptions.length === this.facilityPageSize;

            this.facilityOptions.update((existing) => {
              const existingIds = new Set(existing.map((item) => item.value));
              const filteredNew = incomingOptions.filter(
                (item) => !existingIds.has(item.value),
              );
              return [...existing, ...filteredNew];
            });

            this.currentFacilityPage++;
            this.isFacilityRequestInProgress = false;
            this.isFacilitiesLoading.set(false);
            resolve();
          },
          error: () => {
            this.isFacilityRequestInProgress = false;
            this.isFacilitiesLoading.set(false);
            resolve();
          },
        });
    });
  }

  private ensureSelectedFacilityIsLoaded(
    selectedId: number,
    facilityName?: string,
  ): Promise<void> {
    const alreadyLoaded = this.facilityOptions().some(
      (item) => item.value === selectedId,
    );

    if (alreadyLoaded) {
      return Promise.resolve();
    }

    if (facilityName) {
      const matchedItem: SelectOptions<number> = {
        label: facilityName,
        value: selectedId,
      };
      this.facilityOptions.set([matchedItem]);
      return Promise.resolve();
    }

    this.isFacilitiesLoading.set(true);

    return new Promise((resolve) => {
      this.facilityService
        .getFacilityPagedOptions(1, 1, '', undefined)
        .subscribe({
          next: () => {
            this.isFacilitiesLoading.set(false);
            resolve();
          },
          error: () => {
            this.isFacilitiesLoading.set(false);
            resolve();
          },
        });
    });
  }

  protected onFacilityDropdownLazyLoad(event: SelectLazyLoadEvent): void {
    if (
      this.isFacilityRequestInProgress ||
      !this.hasNextFacilityPage ||
      this.isFacilitiesLoading()
    )
      return;

    const lastLoadedIndex = event.last ?? 0;
    const currentListLength = this.facilityOptions().length;

    if (lastLoadedIndex >= currentListLength - 3 || currentListLength === 0) {
      this.loadNextFacilityPage();
    }
  }

  protected onFacilityDropdownFilter(event: { filter: string }): void {
    this.facilityFilterSubject.next(event.filter || '');
  }

  private syncFormState(
    currentData: Account | undefined,
    mode: FormMode,
  ): void {
    this.accountForm.reset();
    this.formSubmitted.set(false);
    const passwordControl = this.accountForm.get('password');
    const facilityControl = this.accountForm.get('facilityId');
    const roleControl = this.accountForm.get('role');
    const scopeControl = this.accountForm.get('scope');

    if (currentData) {
      const patchValue = {
        id: currentData.id,
        userId: currentData.id,
        userName: currentData.userName,
        facilityId: currentData.facility?.id ?? null,
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
      } else if (mode === FormMode.Update) {
        passwordControl?.clearValidators();
        passwordControl?.disable();
        facilityControl?.disable();

        if (!this.canEditRoleAndScope()) {
          roleControl?.disable();
          scopeControl?.disable();
        } else {
          roleControl?.enable();
          scopeControl?.enable();
        }
      }
    }

    passwordControl?.updateValueAndValidity();
  }

  protected clearForm(): void {
    this.formSubmitted.set(false);
    this.toastService.clearAll();

    const data = this.accountData();
    const mode = this.formMode();

    if (mode === FormMode.Update && data) {
      this.accountForm.patchValue({
        id: data.id,
        userId: data.id,
        userName: '',
        password: '',
        facilityId: data.facility?.id ?? null,
        role: data.role,
        scope: data.scope,
        isActive: data.isActive,
      });

      this.accountForm.get('facilityId')?.disable();
      if (!this.canEditRoleAndScope()) {
        this.accountForm.get('role')?.disable();
        this.accountForm.get('scope')?.disable();
      }
    } else {
      this.accountForm.reset();
      this.accountForm.get('isActive')?.setValue(true);
      this.statusLabel.set('Ativo');
    }
  }

  protected async submitForm(): Promise<void> {
    this.formSubmitted.set(true);

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
