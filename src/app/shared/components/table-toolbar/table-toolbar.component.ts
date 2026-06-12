import { CommonModule } from '@angular/common';
import { Component, input, output, ViewEncapsulation } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-table-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    TooltipModule,
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './table-toolbar.component.html',
  styleUrl: './table-toolbar.component.scss',
})
export class TableToolbarComponent {
  searchPlaceholder = input<string>('Pesquisar...');
  buttonIcon = input<string>('pi pi-plus');
  buttonTooltip = input<string>('Novo Registro');
  showActionButton = input<boolean>(true);

  showPdfButton = input<boolean>(true);
  pdfButtonTooltip = input<string>('Exportar para PDF');
  pdfLoading = input<boolean>(false);

  onSearch = output<string>();
  onActionClick = output<void>();
  onPdfClick = output<void>();

  protected handleSearch(event: Event): void {
    const element = event.target as HTMLInputElement;
    if (element) {
      this.onSearch.emit(element.value);
    }
  }
}
