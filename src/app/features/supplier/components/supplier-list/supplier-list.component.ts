import { Component, OnInit } from '@angular/core';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-supplier-list',
  imports: [BreadcrumbComponent],
  templateUrl: './supplier-list.component.html',
  styleUrl: './supplier-list.component.scss'
})
export class SupplierListComponent implements OnInit {
  itemsBreadcrumb: MenuItem[] = [{ label: 'Fornecedores' },];

  constructor() { }

  ngOnInit() { }
}
