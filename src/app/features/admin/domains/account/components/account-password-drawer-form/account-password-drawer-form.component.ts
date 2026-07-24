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
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { firstValueFrom } from 'rxjs';
import { FormHelperService } from '../../../../../../core/services/form-helper/form-helper.service';
import { ConfirmDialogComponent } from '../../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DrawerComponent } from '../../../../../../shared/components/drawer/drawer.component';
import { ToastService } from '../../../../../../shared/services/toast/toast.service';
import { Account } from '../../interfaces/account';

@Component({
  selector: 'app-account-password-drawer-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DrawerComponent,
    ConfirmDialogComponent,
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './account-password-drawer-form.component.html',
  styleUrl: './account-password-drawer-form.component.scss',
})
export class AccountPasswordDrawerFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly formHelperService = inject(FormHelperService);
  private readonly toastService = inject(ToastService);
  private readonly confirmDialog =
    viewChild<ConfirmDialogComponent>('confirmDialog');

  readonly visible = model<boolean>(false);
  readonly accountData = input<Account | undefined>(undefined);
  readonly onSavePassword = output<{ userId: number; password: string }>();

  protected readonly passwordForm: FormGroup;
  protected readonly isPasswordUpdating = signal<boolean>(false);
  protected readonly formSubmitted = signal<boolean>(false);

  protected readonly isGlobalLoading = computed(() =>
    this.isPasswordUpdating(),
  );
  protected readonly accountName = computed(
    () => this.accountData()?.userName || 'Usuário',
  );

  private readonly formLabels: Record<string, string> = {
    password: 'Nova Senha',
    confirmPassword: 'Confirmar Nova Senha',
  };

  constructor() {
    this.passwordForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );

    effect(() => {
      if (this.visible()) {
        this.clearForm();
      }
    });
  }

  private passwordMatchValidator(
    control: AbstractControl,
  ): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  protected clearForm(): void {
    this.formSubmitted.set(false);
    this.passwordForm.reset();
    this.toastService.clearAll();
  }

  protected async submitForm(): Promise<void> {
    this.formSubmitted.set(true);

    const isFormValid = this.formHelperService.validateAndShowErrors(
      this.passwordForm,
      this.formLabels,
    );

    const account = this.accountData();
    if (!isFormValid || !account) {
      return;
    }

    const dialog = this.confirmDialog();
    if (!dialog) {
      this.emitPayload(account.id);
      return;
    }

    const title = 'Confirmar Alteração';
    const msg = `Deseja realmente alterar a senha de acesso da conta de ${this.accountName()}?`;
    const confirmed = await firstValueFrom(dialog.show(msg, title));

    if (confirmed) {
      this.emitPayload(account.id);
    }
  }

  private emitPayload(userId: number): void {
    this.onSavePassword.emit({
      userId: userId,
      password: this.passwordForm.get('password')?.value,
    });
  }
}
