import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stockMovementType'
})
export class StockMovementTypePipe implements PipeTransform {
  transform(value: number): string {
    switch (value) {
      case 0:
        return 'Entrada';
      case 1:
        return 'Saída';
      case 3:
        return 'Ajuste';
      default:
        return 'Desconhecido';
    }
  }
}
