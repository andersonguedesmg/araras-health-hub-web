import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-toast',
  imports: [ToastModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent {
  constructor(public messageService: MessageService) { }

  showMessage(severity: 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast', summary: string, detail: string): void {
    this.messageService.clear();
    this.messageService.add({
      severity: severity,
      summary: summary,
      detail: detail,
    });
  }
}
