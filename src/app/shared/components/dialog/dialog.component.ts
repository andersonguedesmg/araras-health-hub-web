import { CommonModule } from '@angular/common';
import { Component, computed, input, model, output, ViewEncapsulation } from '@angular/core';
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
  readonly visible = model<boolean>(false);

  readonly formMode = input<FormMode>(FormMode.Create);
  readonly headerText = input<string>('');
  readonly showSaveButton = input<boolean>(true);
  readonly saveButtonLabel = input<string>('Salvar');
  readonly cancelButtonLabel = input<string>('Cancelar');
  readonly dialogWidth = input<string>('max-w-2xl w-full');

  readonly saved = output<void>();
  readonly cancelled = output<void>();

  protected readonly FormMode = FormMode;

  protected readonly resolvedHeaderText = computed(() => {
    const customText = this.headerText();
    if (customText) {
      return customText;
    }

    switch (this.formMode()) {
      case FormMode.Create:
        return 'Novo Registro';
      case FormMode.Update:
        return 'Editar Registro';
      case FormMode.Detail:
        return 'Visualizar Detalhes';
      default:
        return 'Detalhes';
    }
  });

  protected readonly computedStyleClass = computed(() => {
    return `border-0 rounded-xl shadow-2xl overflow-hidden bg-surface-0 dark:bg-surface-900 mx-4 ${this.dialogWidth()}`;
  });

  protected handleCancel(): void {
    this.visible.set(false);
    this.cancelled.emit();
  }

  protected handleSave(): void {
    this.saved.emit();
  }
}
