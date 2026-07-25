import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { Greetings } from '../../../shared/enums/greetings.enum';
import { ThemeService } from '../../../shared/services/theme/theme.service';
import { ToastService } from '../../../shared/services/toast/toast.service';
import { LoginRequest } from '../../interfaces/auth.interfaces';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    SpinnerComponent,
  ],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly themeService = inject(ThemeService);

  readonly isLoading = signal<boolean>(false);

  readonly loginForm = this.fb.nonNullable.group({
    userName: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.toastService.showError(
        'Por favor, preencha todos os campos obrigatórios.',
      );
      return;
    }

    const credentials: LoginRequest = this.loginForm.getRawValue();

    this.isLoading.set(true);

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading.set(false);

        if (response && response.data) {
          const greeting = this.getGreeting();

          this.toastService.showSuccess(
            response.message || 'Login efetuado com sucesso.',
            greeting,
          );

          this.router.navigate(['/']).then((navigated) => {
            if (!navigated) {
              console.warn(
                'A navegação para a Home foi rejeitada. Verifique suas Route Guards (CanActivate)!',
              );
            }
          });
        } else {
          this.toastService.handleApiError(response);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toastService.handleApiError(err);
      },
    });
  }

  private getGreeting(): string {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return Greetings.MORNING;
    if (hour >= 12 && hour < 18) return Greetings.AFTERNOON;
    return Greetings.EVENING;
  }
}
