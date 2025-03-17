import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LoginRequest } from '../../interfaces/loginRequest';
import { LoginResponse } from '../../interfaces/loginResponse';
import { AuthService } from '../../services/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ToastSeverities, ToastSummaries } from '../../../shared/constants/toast.constants';
import { HttpStatus } from '../../../shared/enums/http-status.enum';

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

  login(): void {
    this.spinnerComponent.loading = true;
    this.authService.login(this.credentials).subscribe({
      next: (response: LoginResponse) => {
        this.spinnerComponent.loading = false;
        if (response.statusCode === HttpStatus.Ok) {
          this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, response.message);
          this.router.navigate(['/']);
        } else {
          this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, response.message);
        }
      }, error: (error) => {
        this.spinnerComponent.loading = false;
        this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, error);
      },
    });
  }
}
