import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LoginRequest } from '../../interfaces/login-request';
import { AuthService } from '../../services/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ToastSeverities, ToastSummaries } from '../../../shared/constants/toast.constants';
import { Greetings } from '../../../shared/enums/greetings.enum';
import { Subscription } from 'rxjs';
import { BaseApiResponse } from '../../../shared/interfaces/base-api-response';
import { Account } from '../../interfaces/account';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    ButtonModule,
    ReactiveFormsModule,
    InputTextModule,
    ToastComponent,
    SpinnerComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(SpinnerComponent) spinnerComponent!: SpinnerComponent;
  credentials: LoginRequest = { userName: '', password: '' };

  private subscription: Subscription = new Subscription();

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.subscription.add(
      this.authService.isLoggedIn$.subscribe(isLoggedIn => {
        if (isLoggedIn) {
          this.router.navigate(['/']);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  login(): void {
    this.spinnerComponent.loading = true;

    this.authService.login(this.credentials).subscribe({
      next: (response: BaseApiResponse<Account>) => {
        this.spinnerComponent.loading = false;
        if (response.success) {
          const greeting = this.getGreeting();
          this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, greeting);
        } else {
          this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, response.message);
        }
      },
      error: (error) => {
        this.spinnerComponent.loading = false;
        this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, error.error?.message);
      }
    });
  }

  private getGreeting(): string {
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
