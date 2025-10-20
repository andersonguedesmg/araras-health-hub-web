import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { CommonModule } from '@angular/common';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmMessages, ToastMessages } from '../../../shared/constants/messages.constants';
import { SelectOptions } from '../../../shared/interfaces/select-options';
import { SelectModule } from 'primeng/select';
import { firstValueFrom, Subscription } from 'rxjs';
import { DropdownDataService } from '../../../shared/services/dropdown-data.service';
import { AccountService } from '../../../features/account/services/account.service';
import { BaseComponent } from '../base/base.component';
import { Scope, ScopeOptions } from '../../../shared/enums/scope.enum';
import { FormHelperService } from '../../services/form-helper.service';
import { MenuItem } from 'primeng/api';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    FormsModule,
    SelectModule,
    ToolbarModule,
    BreadcrumbComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent extends BaseComponent implements OnInit, OnDestroy {
  @ViewChild(SpinnerComponent) spinnerComponent!: SpinnerComponent;

  itemsBreadcrumb: MenuItem[] = [{ label: 'Administração' }, { label: 'Contas' }, { label: 'Registrar' }];
  title: string = 'Cadastro de Conta';

  registerForm: FormGroup;
  formSubmitted = false;

  facilityOptions: SelectOptions<number>[] = [];
  rolesOptions: SelectOptions<string>[] = [];
  scopeOptions = ScopeOptions;

  private formLabels: { [key: string]: string; } = {
    userName: 'Nome',
    password: 'Senha',
    facilityId: 'Unidade',
    role: 'Função',
    scope: 'Escopo',
  };

  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private dropdownDataService: DropdownDataService,
    private formHelperService: FormHelperService,
  ) {
    super();
    this.registerForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
      facilityId: [null, Validators.required],
      role: [null, Validators.required],
      scope: [null, Validators.required],
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
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async register(): Promise<void> {
    this.formSubmitted = true;

    if (!this.validateFormAndShowErrors(this.registerForm, this.formHelperService, this.formLabels)) {
      return;
    }

    const user = this.registerForm.getRawValue();
    const apiCall = firstValueFrom(this.accountService.registerAccount(user));

    await this.handleApiCall(apiCall, ConfirmMessages.CREATE_ACCOUNT, ToastMessages.SUCCESS_OPERATION);

    this.resetRegisterForm();
  }

  public resetRegisterForm(): void {
    this.registerForm.reset({
      role: null,
      isActive: true,
      facilityId: null,
      userName: '',
      password: '',
      scope: null,
    });
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
    this.formSubmitted = false;
  }
}
