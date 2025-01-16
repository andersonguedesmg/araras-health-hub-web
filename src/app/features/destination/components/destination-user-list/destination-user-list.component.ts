import { Component, OnInit } from '@angular/core';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-destination-user-list',
  imports: [BreadcrumbComponent],
  templateUrl: './destination-user-list.component.html',
  styleUrl: './destination-user-list.component.scss'
})
export class DestinationUserListComponent implements OnInit {
  itemsBreadcrumb: MenuItem[] = [{ label: 'Clientes' },];

  constructor() { }

  ngOnInit() { }
}
