import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginRequest } from '../../interfaces/LoginRequest';
import { LoginResponse } from '../../interfaces/loginResponse';
import { AuthService } from '../../services/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, FormsModule, ButtonModule,],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  credentials: LoginRequest = { userName: '', password: '' };
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  login(): void {
    this.authService.login(this.credentials).subscribe({
      next: (response: LoginResponse) => {
        if (response.statusCode === 200) {
          this.router.navigate(['/']);
        } else {
          this.errorMessage = response.message;
        }
      }, error: (error) => {
        this.errorMessage = 'Erro ao realizar login.';
        console.error('Erro no login:', error);
      },
    });
  }
}
