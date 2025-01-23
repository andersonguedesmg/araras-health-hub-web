import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputMask } from 'primeng/inputmask';
import { PasswordModule } from 'primeng/password';
import { Select } from 'primeng/select';
import { ToolbarModule } from 'primeng/toolbar';

interface AccessLevel {
  description: string;
  code: string;
}

interface IsActive {
  description: string;
  code: string;
}

@Component({
  selector: 'app-user-form',
  imports: [
    BreadcrumbComponent,
    CardModule,
    ButtonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputMask,
    PasswordModule,
    Select,
    ToolbarModule,
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit {
  itemsBreadcrumb: MenuItem[] = [{ label: 'Administração' }, { label: 'Usuários' }, { label: 'Cadastro' },];

  formGroup!: FormGroup;
  accessLevel: AccessLevel[] | undefined;
  isActive: IsActive[] | undefined;

  ngOnInit() {
    this.accessLevel = [
      { description: 'Administrador', code: 'ADMIN' },
      // { description: 'Convidado', code: 'GUEST' },
      { description: 'Usuário', code: 'USER' },
    ];

    this.isActive = [
      { description: 'Ativo', code: 'ACTIVE' },
      { description: 'Inativo', code: 'INACTIVE' },
    ];

    this.formGroup = new FormGroup({
      id: new FormControl<number | null>(null),
      name: new FormControl<string | null>(null),
      password: new FormControl<number | null>(null),
      function: new FormControl<string | null>(null),
      phone: new FormControl<string | null>(null),
      accessLevel: new FormControl<number | null>(null),
      isActive: new FormControl<number | null>(null),
    });
  }
}
