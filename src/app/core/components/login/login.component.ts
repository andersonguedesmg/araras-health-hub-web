import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LoginRequest } from '../../interfaces/loginRequest';
import { AuthService } from '../../services/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ToastSeverities, ToastSummaries } from '../../../shared/constants/toast.constants';
import { HttpStatus } from '../../../shared/enums/http-status.enum';
import { Greetings } from '../../../shared/enums/greetings.enum';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, FormsModule, ButtonModule, ToastComponent, SpinnerComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(SpinnerComponent) spinnerComponent!: SpinnerComponent;
  credentials: LoginRequest = { userName: '', password: '' };
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  async login(): Promise<void> {
    this.spinnerComponent.loading = true;
    try {
      const response = await this.authService.login(this.credentials);
      this.spinnerComponent.loading = false;
      if (response.statusCode === HttpStatus.Ok) {
        const greeting = this.getGreeting();
        this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, greeting);
        this.router.navigate(['/']);
      } else {
        this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, response.message);
      }
    } catch (error: any) {
      this.spinnerComponent.loading = false;
      this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, error.message);
    }
  }

  getGreeting(): string {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 6 && hour < 12) {
      return Greetings.MORNING;
    } else if (hour >= 12 && hour < 18) {
      return Greetings.AFTERNOON;
    } else {
      return Greetings.EVENING;
    }
  }
}
