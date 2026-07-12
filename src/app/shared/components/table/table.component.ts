import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  contentChild,
  input,
  output,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [NgTemplateOutlet, TableModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent {
  protected readonly dt = viewChild<Table>('dt');

  readonly value = input<unknown[]>([]);
  readonly totalRecords = input<number>(0);
  readonly paginator = input<boolean>(true);
  readonly lazy = input<boolean>(true);
  readonly rows = input<number>(5);
  readonly first = input<number>(0);
  readonly rowsPerPageOptions = input<number[]>([5, 10, 25]);
  readonly globalFilterFields = input<string[]>([]);
  readonly dataKey = input<string>('id');
  readonly loading = input<boolean>(false);
  readonly colspan = input<number>(1);
  readonly emptyMessage = input<string>('Nenhum registro encontrado.');

  protected readonly captionTemplate =
    contentChild<TemplateRef<unknown>>('captionTemplate');
  protected readonly headerTemplate =
    contentChild<TemplateRef<unknown>>('headerTemplate');
  protected readonly bodyTemplate =
    contentChild<TemplateRef<unknown>>('bodyTemplate');
  protected readonly footerTemplate =
    contentChild<TemplateRef<unknown>>('footerTemplate');
  protected readonly emptyMessageTemplate = contentChild<TemplateRef<unknown>>(
    'emptyMessageTemplate',
  );

  readonly onLazyLoad = output<TableLazyLoadEvent>();

  public filterGlobal(value: string, matchMode: string): void {
    this.dt()?.filterGlobal(value, matchMode);
  }
}
