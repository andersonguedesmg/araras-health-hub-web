import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputMask } from 'primeng/inputmask';
import { PasswordModule } from 'primeng/password';
import { SelectButton } from 'primeng/selectbutton';
import { Select } from 'primeng/select';
import { ToolbarModule } from 'primeng/toolbar';

interface City {
  name: string;
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

    PasswordModule,

    ToolbarModule,
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit {
  itemsBreadcrumb: MenuItem[] = [{ label: 'Usuários' }, { label: 'Cadastro' },];

  cities: City[] | undefined;


  formGroup!: FormGroup;



  stateOptions: any[] = [{ label: 'One-Way', value: 'one-way' }, { label: 'Return', value: 'return' }];

  value: string = 'off';

  ngOnInit() {
    this.cities = [
      { name: 'New York', code: 'NY' },
      { name: 'Rome', code: 'RM' },
      { name: 'London', code: 'LDN' },
      { name: 'Istanbul', code: 'IST' },
      { name: 'Paris', code: 'PRS' }
    ];

    this.formGroup = new FormGroup({
      id: new FormControl<number | null>(null),
      name: new FormControl<string | null>(null),
      password: new FormControl<number | null>(null),
      function: new FormControl<string | null>(null),
      phone: new FormControl<string | null>(null),
      accessLevel: new FormControl<number | null>(null),
      isActive: new FormControl<number | null>(null),

      selectedCity: new FormControl<City | null>(null)
    });
  }
}
