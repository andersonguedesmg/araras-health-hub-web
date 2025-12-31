import { Component, Input } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Subject } from 'rxjs';

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

  private confirmationSubject = new Subject<boolean>();

  constructor(private confirmationService: ConfirmationService) { }

  show(): Subject<boolean> {
    this.confirmationSubject = new Subject<boolean>();

    this.confirmationService.confirm({
      message: this.message,
      header: this.header,
      icon: this.icon,
      accept: () => {
        this.confirmationSubject.next(true);
        this.confirmationSubject.complete();
      },
      reject: () => {
        this.confirmationSubject.error('cancel');
      },
    });

    return this.confirmationSubject;
  }
}
