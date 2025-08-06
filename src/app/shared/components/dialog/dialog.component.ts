import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FormMode } from '../../enums/form-mode.enum';

@Component({
  selector: 'app-dialog',
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class DialogComponent {
  @Input() visible: boolean = false;
  @Input() formMode: FormMode.Create | FormMode.Update | FormMode.Detail = FormMode.Create;
  @Input() headerText: string = '';
  @Input() showSaveButton: boolean = true;
  @Input() saveButtonLabel: string = 'Salvar';
  @Input() cancelButtonLabel: string = 'Cancelar';

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  FormMode = FormMode;

  hideDialog(): void {
    this.visibleChange.emit(false);
  }

  save(): void {
    this.onSave.emit();
  }

  cancel(): void {
    this.visibleChange.emit(false);
    this.onCancel.emit();
  }
}
