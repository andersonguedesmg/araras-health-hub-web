import {
  Component,
  inject,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { Greetings } from '../../../shared/enums/greetings.enum';
import { ToastService } from '../../../shared/services/toast.service';
import { LoginRequest } from '../../interfaces/auth.interfaces';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ButtonModule, InputTextModule, SpinnerComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly credentials = signal<LoginRequest>({ userName: '', password: '' });
  readonly isLoading = signal<boolean>(false);

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  login(): void {
    const currentCreds = this.credentials();
    if (!currentCreds.userName || !currentCreds.password) {
      this.toastService.showError('Por favor, preencha todos os campos.');
      return;
    }

    this.isLoading.set(true);

    this.authService.login(currentCreds).subscribe({
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
