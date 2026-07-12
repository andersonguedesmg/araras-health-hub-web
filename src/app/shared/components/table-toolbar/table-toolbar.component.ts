import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-table-toolbar',
  standalone: true,
  imports: [
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    TooltipModule,
  ],
  host: {
    class: 'block w-full',
  },
  templateUrl: './table-toolbar.component.html',
  styleUrl: './table-toolbar.component.scss',
})
export class TableToolbarComponent {
  readonly searchPlaceholder = input<string>('Pesquisar...');
  readonly buttonIcon = input<string>('pi pi-plus');
  readonly buttonTooltip = input<string>('Novo Registro');
  readonly showActionButton = input<boolean>(true);

  readonly showPdfButton = input<boolean>(true);
  readonly pdfButtonTooltip = input<string>('Exportar para PDF');
  readonly pdfLoading = input<boolean>(false);

  readonly onSearch = output<string>();
  readonly onActionClick = output<void>();
  readonly onPdfClick = output<void>();

  protected handleSearch(event: Event): void {
    const element = event.target as HTMLInputElement;
    if (element) {
      this.onSearch.emit(element.value);
    }
  }
}
