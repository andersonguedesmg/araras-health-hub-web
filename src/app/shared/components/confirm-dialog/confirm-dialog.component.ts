import { Component, input, ViewEncapsulation } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ConfirmDialogModule],
  providers: [ConfirmationService],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  header = input<string>('Confirmação');
  message = input<string>('Tem certeza que deseja continuar?');
  icon = input<string>('pi pi-exclamation-triangle');
  acceptLabel = input<string>('Sim');
  rejectLabel = input<string>('Não');
  acceptIcon = input<string>('pi pi-check');
  rejectIcon = input<string>('pi pi-times');

  private confirmationSubject = new Subject<boolean>();

  constructor(private confirmationService: ConfirmationService) {}

  public show(customMessage?: string, customHeader?: string): Subject<boolean> {
    this.confirmationSubject = new Subject<boolean>();

    this.confirmationService.confirm({
      message: customMessage || this.message(),
      header: customHeader || this.header(),
      icon: this.icon(),
      accept: () => {
        this.confirmationSubject.next(true);
        this.confirmationSubject.complete();
      },
      reject: () => {
        this.confirmationSubject.next(false);
        this.confirmationSubject.complete();
      },
    });

    return this.confirmationSubject;
  }
}
