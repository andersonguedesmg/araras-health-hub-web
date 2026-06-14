import { CommonModule } from '@angular/common';
import { Component, input, model, output, ViewEncapsulation } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormMode } from '../../enums/form-mode.enum';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class DialogComponent {
  visible = model<boolean>(false);

  formMode = input<FormMode>(FormMode.Create);
  headerText = input<string>('');
  showSaveButton = input<boolean>(true);
  saveButtonLabel = input<string>('Salvar');
  cancelButtonLabel = input<string>('Cancelar');

  onSave = output<void>();
  onCancel = output<void>();

  protected FormMode = FormMode;

  protected handleCancel(): void {
    this.visible.set(false);
    this.onCancel.emit();
  }
}
