import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LoginRequest } from '../../interfaces/LoginRequest';
import { LoginResponse } from '../../interfaces/loginResponse';
import { AuthService } from '../../services/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

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
        if (response.statusCode === 200) {
          this.toastComponent.showMessage('success', 'Sucesso', 'Login realizado com sucesso!');
          this.router.navigate(['/']);
        } else {
          this.toastComponent.showMessage('error', 'Erro', response.message);
        }
      }, error: (error) => {
        this.spinnerComponent.loading = false;
        this.toastComponent.showMessage('error', 'Erro', 'Erro ao realizar login.');
      },
    });
  }
}
