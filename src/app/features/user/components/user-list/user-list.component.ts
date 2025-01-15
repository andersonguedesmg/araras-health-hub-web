import { Component, OnInit } from '@angular/core';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-user-list',
  imports: [BreadcrumbComponent],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {
  itemsBreadcrumb: MenuItem[] = [{ label: 'Usuários' },];

  constructor() { }

  ngOnInit() { }
}
