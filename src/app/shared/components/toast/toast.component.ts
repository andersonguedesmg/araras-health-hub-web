import { Component, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [ToastModule],
  host: {
    class: 'block',
  },
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent {
  readonly messageService = inject(MessageService);
}
