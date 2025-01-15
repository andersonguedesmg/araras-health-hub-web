import { Component, OnInit } from '@angular/core';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-product-list',
  imports: [BreadcrumbComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  itemsBreadcrumb: MenuItem[] = [{ label: 'Produtos' },];

  constructor() { }

  ngOnInit() { }
}
