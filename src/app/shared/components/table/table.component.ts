import { CommonModule } from '@angular/common';
import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-table',
  imports: [
    CommonModule,
    TableModule,
    ToolbarModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    TagModule,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent {
  @ViewChild('dt') dt!: Table;

  @Input() value: any[] = [];
  @Input() totalRecords: number = 0;
  @Input() paginator: boolean = true;
  @Input() lazy: boolean = true;
  @Input() rows: number = 5;
  @Input() rowsPerPageOptions: number[] = [5, 10, 25];
  @Input() globalFilterFields: string[] = [];
  @Input() dataKey: string = 'id';
  @Input() loading: boolean = false;

  @ContentChild('captionTemplate', { static: false }) captionTemplate!: TemplateRef<any>;
  @ContentChild('headerTemplate', { static: false }) headerTemplate!: TemplateRef<any>;
  @ContentChild('bodyTemplate', { static: false }) bodyTemplate!: TemplateRef<any>;
  @ContentChild('footerTemplate', { static: false }) footerTemplate!: TemplateRef<any>;

  @Output() onLazyLoad = new EventEmitter<TableLazyLoadEvent>();

  filterGlobal(value: string, matchMode: string): void {
    this.dt?.filterGlobal(value, matchMode);
  }

  exportCSV(): void {
    this.dt?.exportCSV();
  }

  onLazyLoadEvent(event: TableLazyLoadEvent): void {
    this.onLazyLoad.emit(event);
  }
}
