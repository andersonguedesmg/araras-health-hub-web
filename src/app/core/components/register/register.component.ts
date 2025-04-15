import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { CommonModule } from '@angular/common';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../services/auth.service';
import { ToastSeverities, ToastSummaries } from '../../../shared/constants/toast.constants';
import { ConfirmMessages, ToastMessages } from '../../../shared/constants/messages.constants';
import { SelectOptions } from '../../../shared/interfaces/select-options';
import { ApiResponse } from '../../../shared/interfaces/apiResponse';
import { FacilityService } from '../../../features/facility/services/facility.service';
import { SelectModule } from 'primeng/select';
import { firstValueFrom } from 'rxjs';
import { HttpStatus } from '../../../shared/enums/http-status.enum';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    FormsModule,
    SelectModule,
    ToastComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(SpinnerComponent) spinnerComponent!: SpinnerComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  registerForm: FormGroup;
  formSubmitted = false;

  facilityOptions: SelectOptions<number>[] = [];
  rolesOptions: SelectOptions<string>[] = [];

  constructor(private fb: FormBuilder, private authService: AuthService, private facilityService: FacilityService,) {
    this.registerForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
      facilityId: [0, Validators.required],
      role: ['', Validators.required],
      isActive: [true],
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadFacilitiesNames();

    this.rolesOptions = [
      { label: 'Usuário', value: 'User' },
      { label: 'Administrador', value: 'Admin' },
      { label: 'Master', value: 'Master' },
    ];
  }

  async register(): Promise<void> {
    this.formSubmitted = true;
    if (this.registerForm.valid) {
      this.confirmDialog.message = ConfirmMessages.CREATE_ACCOUNT;
      this.confirmDialog.show();
      try {
        await firstValueFrom(this.confirmDialog.confirmed);
        this.spinnerComponent.loading = true;
        const user = this.registerForm.value;
        const response = await this.authService.register(user);
        this.spinnerComponent.loading = false;
        if (response && (response.statusCode === HttpStatus.Ok || response.statusCode === HttpStatus.Created)) {
          this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, response.message);
          this.registerForm.reset({
            username: '',
            email: '',
            password: '',
            role: 'User',
            isActive: true,
          });
          this.formSubmitted = false;
        } else if (response) {
          this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, response.message);
        }
      } catch (error: any) {
        this.spinnerComponent.loading = false;
        if (error && error.error && error.error.message) {
          this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, error.error.message);
        } else {
          this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, ToastMessages.UNEXPECTED_ERROR);
        }

        try {
          await firstValueFrom(this.confirmDialog.rejected);
        } catch (rejectError) {
          this.toastComponent.showMessage(ToastSeverities.INFO, ToastSummaries.CANCELED, ToastMessages.CANCELED_REGISTRATION);
        }
      }
    } else {
      this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, ToastMessages.REQUIRED_FIELDS);
    }
  }

  async loadFacilitiesNames(): Promise<void> {
    try {
      const response: ApiResponse<any[]> = await this.facilityService.getAllFacilitiesNames();
      if (response && response.data) {
        this.facilityOptions = response.data.map((facility) => ({
          label: facility.name,
          value: facility.id,
        }));
      }
    } catch (error) {
      console.error(ToastMessages.ERROR_LOADING_NAMES, error);
    }
  }
}
