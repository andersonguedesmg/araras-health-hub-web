import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { ToolbarModule } from 'primeng/toolbar';

interface IsActive {
  description: string;
  code: string;
}

@Component({
  selector: 'app-destination-form',
  imports: [
    BreadcrumbComponent,
    CardModule,
    ButtonModule,
    ReactiveFormsModule,
    InputTextModule,
    Select,
    ToolbarModule,
  ],
  templateUrl: './destination-form.component.html',
  styleUrl: './destination-form.component.scss'
})
export class DestinationFormComponent implements OnInit {
  itemsBreadcrumb: MenuItem[] = [{ label: 'Destinos' }, { label: 'Cadastro' },];

  formGroup!: FormGroup;
  isActive: IsActive[] | undefined;

  ngOnInit() {
    this.isActive = [
      { description: 'Ativo', code: 'ACTIVE' },
      { description: 'Inativo', code: 'INACTIVE' },
    ];

    this.formGroup = new FormGroup({
      id: new FormControl<number | null>(null),
      description: new FormControl<string | null>(null),
      cep: new FormControl<string | null>(null),
      address: new FormControl<string | null>(null),
      number: new FormControl<string | null>(null),
      neighborhood: new FormControl<string | null>(null),
      city: new FormControl<string | null>(null),
      email: new FormControl<string | null>(null),
      phone: new FormControl<string | null>(null),
      isActive: new FormControl<string | null>(null),
    });
  }
}
