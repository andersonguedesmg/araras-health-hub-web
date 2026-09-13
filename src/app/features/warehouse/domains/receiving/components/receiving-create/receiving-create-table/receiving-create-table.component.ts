import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { TableComponent } from '../../../../../../../shared/components/table/table.component';
import { ReceivingItemRequest } from '../../../interfaces/receiving';

@Component({
  selector: 'app-receiving-create-table',
  standalone: true,
  imports: [ButtonModule, TagModule, TooltipModule, CurrencyPipe, DatePipe, NgClass, TableComponent],
  templateUrl: './receiving-create-table.component.html',
  styleUrl: './receiving-create-table.component.scss',
})
export class ReceivingCreateTableComponent {
  readonly items = input<ReceivingItemRequest[]>([]);
  readonly declaredTotalValue = input<number>(0);
  readonly calculatedTotalValue = input<number>(0);
  readonly loading = input<boolean>(false);
  readonly rows = input<number>(10);
  readonly first = input<number>(0);

  readonly addItem = output<void>();
  readonly editItem = output<{ item: ReceivingItemRequest; index: number }>();
  readonly removeItem = output<number>();

  protected readonly totalItemsCount = computed(() => this.items().length);

  protected readonly isTotalMatching = computed(() => {
    const declared = this.declaredTotalValue();
    const calculated = this.calculatedTotalValue();

    if (declared <= 0) return true;
    return Math.abs(declared - calculated) < 0.01;
  });

  protected handleAddItem(): void {
    this.addItem.emit();
  }

  protected handleEditItem(item: ReceivingItemRequest, index: number): void {
    this.editItem.emit({ item, index });
  }

  protected handleRemoveItem(index: number): void {
    this.removeItem.emit(index);
  }

  protected isNearExpiry(expiryDate: string | Date): boolean {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(today.getMonth() + 6);

    return expiry <= sixMonthsFromNow;
  }
}
