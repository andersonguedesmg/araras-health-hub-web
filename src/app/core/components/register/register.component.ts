import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { CommonModule } from '@angular/common';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonModule,
    FormsModule,
    ToastComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(SpinnerComponent) spinnerComponent!: SpinnerComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  registerForm: FormGroup;
  formSubmitted = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router,) {
    this.registerForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
      destinationId: [0, Validators.required],
      isActive: [true],
    });
  }

  register(): void {
    this.formSubmitted = true;
    if (this.registerForm.valid) {
      const user = this.registerForm.value;
      this.authService.register(user).subscribe({
        next: () => {
          this.toastComponent.showMessage('success', 'Sucesso', 'Cadastro realizado com sucesso.');
        },
        error: (error) => {
          this.toastComponent.showMessage('error', 'Erro', 'Erro ao realizar cadastro.');
          console.error('Erro ao realizar cadastro:', error);
        },
      });
    } else {
      this.toastComponent.showMessage('error', 'Erro', 'Preencha todos os campos obrigatórios.');
    }
  }
}
