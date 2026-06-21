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
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormHelperService } from '../../../../core/services/form-helper.service';
import { DrawerComponent } from '../../../../shared/components/drawer/drawer.component';
import { Account } from '../../interfaces/account';

@Component({
  selector: 'app-account-password-drawer-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DrawerComponent,
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './account-password-drawer-form.component.html',
  styleUrl: './account-password-drawer-form.component.scss',
})
export class AccountPasswordDrawerFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly formHelperService = inject(FormHelperService);

  visible = model<boolean>(false);
  accountData = input<Account | undefined>(undefined);
  onSavePassword = output<{ userId: number; password: string }>();

  passwordForm: FormGroup;

  accountName = computed(() => this.accountData()?.userName || 'Usuário');

  private readonly formLabels: { [key: string]: string } = {
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
        this.passwordForm.reset();
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

  submitForm(): void {
    const isFormValid = this.formHelperService.validateAndShowErrors(
      this.passwordForm,
      this.formLabels,
    );

    const account = this.accountData();

    if (isFormValid && account) {
      this.onSavePassword.emit({
        userId: account.id,
        password: this.passwordForm.get('password')?.value,
      });
    }
  }
}
