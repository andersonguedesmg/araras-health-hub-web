import { Component, OnInit } from '@angular/core';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-destination-list',
  imports: [BreadcrumbComponent],
  providers: [],
  templateUrl: './destination-list.component.html',
  styleUrl: './destination-list.component.scss'
})
export class DestinationListComponent implements OnInit {
  itemsBreadcrumb: MenuItem[] = [{ label: 'Destinos' },];

  constructor() { }

  ngOnInit() { }
}
