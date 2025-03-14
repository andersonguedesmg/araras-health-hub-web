import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-confirm-dialog',
  imports: [ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
  @Input() header = 'Confirmação';
  @Input() message = 'Tem certeza que deseja continuar?';
  @Input() icon = 'pi pi-exclamation-triangle';
  @Input() acceptLabel = 'Sim';
  @Input() rejectLabel = 'Não';
  @Input() acceptIcon = 'pi pi-check';
  @Input() rejectIcon = 'pi pi-times';
  @Output() confirmed = new EventEmitter<void>();
  @Output() rejected = new EventEmitter<void>();

  constructor(private confirmationService: ConfirmationService) { }

  show(): void {
    this.confirmationService.confirm({
      message: this.message,
      header: this.header,
      icon: this.icon,
      accept: () => {
        this.accept();
      },
      reject: () => {
        this.reject();
      },
    });
  }

  accept(): void {
    this.confirmed.emit();
  }

  reject(): void {
    this.rejected.emit();
  }
}
