import { Component, OnInit } from '@angular/core';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-stock-list',
  imports: [BreadcrumbComponent],
  templateUrl: './stock-list.component.html',
  styleUrl: './stock-list.component.scss'
})
export class StockListComponent implements OnInit {
  itemsBreadcrumb: MenuItem[] = [{ label: 'Estoque' },];

  constructor() { }

  ngOnInit() { }
}
