import { CommonModule } from '@angular/common';
import {
  Component,
  contentChild,
  input,
  output,
  TemplateRef,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, TableModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent {
  protected dt = viewChild<Table>('dt');

  value = input<any[]>([]);
  totalRecords = input<number>(0);
  paginator = input<boolean>(true);
  lazy = input<boolean>(true);
  rows = input<number>(5);
  first = input<number>(0);
  rowsPerPageOptions = input<number[]>([5, 10, 25]);
  globalFilterFields = input<string[]>([]);
  dataKey = input<string>('id');
  loading = input<boolean>(false);
  colspan = input<number>(1);
  emptyMessage = input<string>('Nenhum registro encontrado.');

  protected captionTemplate = contentChild<TemplateRef<any>>('captionTemplate');
  protected headerTemplate = contentChild<TemplateRef<any>>('headerTemplate');
  protected bodyTemplate = contentChild<TemplateRef<any>>('bodyTemplate');
  protected footerTemplate = contentChild<TemplateRef<any>>('footerTemplate');
  protected emptyMessageTemplate = contentChild<TemplateRef<any>>(
    'emptyMessageTemplate',
  );

  onLazyLoad = output<TableLazyLoadEvent>();

  public filterGlobal(value: string, matchMode: string): void {
    this.dt()?.filterGlobal(value, matchMode);
  }

  public exportCSV(): void {
    this.dt()?.exportCSV();
  }
}
