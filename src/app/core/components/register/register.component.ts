import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { CommonModule } from '@angular/common';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastSeverities, ToastSummaries } from '../../../shared/constants/toast.constants';
import { ConfirmMessages, ToastMessages } from '../../../shared/constants/messages.constants';
import { SelectOptions } from '../../../shared/interfaces/select-options';
import { SelectModule } from 'primeng/select';
import { catchError, finalize, of, Subscription, switchMap } from 'rxjs';
import { HttpStatus } from '../../../shared/enums/http-status.enum';
import { DropdownDataService } from '../../../shared/services/dropdown-data.service';
import { AccountService } from '../../../features/account/services/account.service';

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
export class RegisterComponent implements OnInit, OnDestroy {
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(SpinnerComponent) spinnerComponent!: SpinnerComponent;
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  registerForm: FormGroup;
  formSubmitted = false;

  facilityOptions: SelectOptions<number>[] = [];
  rolesOptions: SelectOptions<string>[] = [];

  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private dropdownDataService: DropdownDataService,
  ) {
    this.registerForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
      facilityId: [null, Validators.required],
      role: [null, Validators.required],
      isActive: [true],
    });
  }

  ngOnInit(): void {
    this.loadFacilitiesOptions();
    this.rolesOptions = [
      { label: 'Usuário', value: 'User' },
      { label: 'Administrador', value: 'Admin' },
      { label: 'Master', value: 'Master' },
    ];
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  async loadFacilitiesOptions(): Promise<void> {
    try {
      this.facilityOptions = await this.dropdownDataService.getFacilitiesOptions();
    } catch (error: any) {
      if (error.message !== 'cancel') {
        this.handleApiError(error);
      }
    }
  }

  register(): void {
    this.formSubmitted = true;
    if (this.registerForm.invalid) {
      this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, ToastMessages.REQUIRED_FIELDS);
      return;
    }

    this.confirmDialog.message = ConfirmMessages.CREATE_ACCOUNT;
    this.confirmDialog.show();

    this.subscriptions.add(
      this.confirmDialog.confirmed.pipe(
        switchMap(() => {
          this.spinnerComponent.loading = true;
          const user = this.registerForm.value;
          return this.accountService.registerAccount(user);
        }),
        catchError((error) => {
          // Lidar com erros da API e do diálogo de confirmação cancelado
          this.spinnerComponent.loading = false;
          if (error.message === 'cancel') {
            this.toastComponent.showMessage(ToastSeverities.INFO, ToastSummaries.CANCELED, ToastMessages.CANCELED_REGISTRATION);
            return of(null); // Retorna um Observable nulo para parar o fluxo
          }
          this.handleApiError(error);
          return of(null);
        }),
        finalize(() => this.spinnerComponent.loading = false)
      ).subscribe(response => {
        if (response && (response.statusCode === HttpStatus.Ok || response.statusCode === HttpStatus.Created)) {
          this.toastComponent.showMessage(ToastSeverities.SUCCESS, ToastSummaries.SUCCESS, response.message);
          this.registerForm.reset({
            role: 'User',
            isActive: true,
            facilityId: null,
            userName: '',
            password: '',
          });
          this.formSubmitted = false;
        } else if (response) {
          this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, response.message);
        }
      })
    );
  }

  private handleApiError(error: any): void {
    const errorMessage = error?.error?.message || ToastMessages.UNEXPECTED_ERROR;
    this.toastComponent.showMessage(ToastSeverities.ERROR, ToastSummaries.ERROR, errorMessage);
  }
}
