import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
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

interface Destination {
  description: string;
  code: string;
}

@Component({
  selector: 'app-destination-user-form',
  imports: [
    BreadcrumbComponent,
    CardModule,
    ButtonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    Select,
    ToolbarModule,
  ],
  templateUrl: './destination-user-form.component.html',
  styleUrl: './destination-user-form.component.scss'
})
export class DestinationUserFormComponent implements OnInit {
  itemsBreadcrumb: MenuItem[] = [{ label: 'Clientes' }, { label: 'Cadastro' },];

  formGroup!: FormGroup;
  accessLevel: AccessLevel[] | undefined;
  isActive: IsActive[] | undefined;
  destination: Destination[] | undefined;

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

    this.destination = [
      { description: 'UBS Ênio Vitalli', code: '1' },
      { description: 'UPA Elisa Sbrissa Franchozza', code: '2' },
      { description: 'Farmácia de Alto Custo', code: '3' },
      { description: 'SAMU', code: '4' },
      { description: 'PSF Edmundo Ulson', code: '5' },
    ];

    this.formGroup = new FormGroup({
      id: new FormControl<number | null>(null),
      name: new FormControl<string | null>(null),
      password: new FormControl<number | null>(null),
      destination: new FormControl<string | null>(null),
      accessLevel: new FormControl<number | null>(null),
      isActive: new FormControl<number | null>(null),
    });
  }
}
