import { Component, OnInit } from '@angular/core';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-order-list',
  imports: [BreadcrumbComponent],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss'
})
export class OrderListComponent implements OnInit {
  itemsBreadcrumb: MenuItem[] = [{ label: 'Pedidos' },];

  constructor() { }

  ngOnInit() { }
}
