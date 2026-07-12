import { Component, inject, input } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Subject } from 'rxjs';

export type ConfirmButtonSeverity =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warn'
  | 'danger'
  | 'contrast';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ConfirmDialogModule, ButtonModule],
  providers: [ConfirmationService],
  host: {
    class: 'block',
  },
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  private readonly confirmationService = inject(ConfirmationService);

  readonly header = input<string>('Confirmação');
  readonly message = input<string>('Tem certeza que deseja continuar?');
  readonly icon = input<string>('pi pi-exclamation-triangle');
  readonly acceptLabel = input<string>('Sim');
  readonly rejectLabel = input<string>('Não');
  readonly acceptIcon = input<string>('pi pi-check');
  readonly rejectIcon = input<string>('pi pi-times');

  readonly acceptSeverity = input<ConfirmButtonSeverity>('primary');
  readonly rejectSeverity = input<ConfirmButtonSeverity>('secondary');
  readonly acceptOutlined = input<boolean>(false);
  readonly rejectOutlined = input<boolean>(false);

  private confirmationSubject = new Subject<boolean>();

  public show(
    customMessage?: string,
    customHeader?: string,
    overrideAcceptSeverity?: ConfirmButtonSeverity,
  ): Subject<boolean> {
    this.confirmationSubject = new Subject<boolean>();

    this.confirmationService.confirm({
      message: customMessage || this.message(),
      header: customHeader || this.header(),
      icon: this.icon(),
      acceptLabel: this.acceptLabel(),
      rejectLabel: this.rejectLabel(),
      acceptIcon: this.acceptIcon(),
      rejectIcon: this.rejectIcon(),

      rejectButtonProps: {
        severity: this.rejectSeverity(),
        outlined: this.rejectOutlined(),
      },

      acceptButtonProps: {
        severity: overrideAcceptSeverity || this.acceptSeverity(),
        outlined: this.acceptOutlined(),
      },

      accept: () => {
        this.onAccept();
      },
      reject: () => {
        this.onReject();
      },
    });

    return this.confirmationSubject;
  }

  public onAccept(): void {
    if (!this.confirmationSubject.closed) {
      this.confirmationSubject.next(true);
      this.confirmationSubject.complete();
    }
    this.confirmationService.close();
  }

  public onReject(): void {
    if (!this.confirmationSubject.closed) {
      this.confirmationSubject.next(false);
      this.confirmationSubject.complete();
    }
    this.confirmationService.close();
  }
}
