import { inject, Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { ToastService } from '../../../shared/services/toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class FormHelperService {
  private toastService = inject(ToastService);

  /**
   * Varre o formulário recursivamente e retorna um array contendo apenas os
   * campos finais (FormControls) que estão inválidos.
   */
  getInvalidControls(form: FormGroup | AbstractControl): AbstractControl[] {
    const invalidControls: AbstractControl[] = [];

    if (form instanceof FormGroup) {
      for (const name in form.controls) {
        const control = form.controls[name];
        if (control instanceof FormGroup || control instanceof FormArray) {
          invalidControls.push(...this.getInvalidControls(control));
        } else if (control.invalid) {
          invalidControls.push(control);
        }
      }
    } else if (form instanceof FormArray) {
      form.controls.forEach((control) => {
        invalidControls.push(...this.getInvalidControls(control));
      });
    }

    return invalidControls;
  }

  /**
   * Marca todos os campos e sub-campos (FormGroups/FormArrays) como tocados
   * para disparar instantaneamente os feedbacks visuais de erro na tela.
   */
  markAllAsTouched(abstractControl: AbstractControl): void {
    if (
      abstractControl instanceof FormGroup ||
      abstractControl instanceof FormArray
    ) {
      Object.values(abstractControl.controls).forEach((control) => {
        control.markAsTouched();
        this.markAllAsTouched(control);
      });
    } else {
      abstractControl.markAsTouched();
    }
  }

  /**
   * Retorna o nome amigável de exibição do campo baseado no dicionário fornecido.
   * Caso não encontre mapeamento, converte a propriedade de camelCase para Pascal Case espaçado.
   */
  getControlLabel(
    control: AbstractControl,
    formLabels: { [key: string]: string },
  ): string {
    const controlPath = this.getControlPath(control);
    if (controlPath) {
      if (formLabels[controlPath]) return formLabels[controlPath];

      const parts = controlPath.split('.');
      const name = parts[parts.length - 1];
      return name
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase());
    }

    return '';
  }

  /**
   * Reconstrói recursivamente o caminho hierárquico do controle (path) dentro
   * da estrutura do formulário (ex: 'address.cep').
   */
  private getControlPath(control: AbstractControl): string | null {
    if (!control.parent) return null;
    const parent = control.parent as FormGroup | FormArray;
    let controlName: string | null = null;

    if (parent instanceof FormGroup) {
      controlName =
        Object.keys(parent.controls).find(
          (name) => control === parent.controls[name],
        ) || null;
    }

    if (!controlName) return null;
    const parentPath = this.getControlPath(parent);
    return parentPath ? `${parentPath}.${controlName}` : controlName;
  }

  /**
   * Avalia a validade do formulário. Caso seja inválido, exibe um alerta (Toast)
   * listando os campos pendentes e destaca visualmente os inputs incorretos na tela.
   */
  validateAndShowErrors(
    form: FormGroup,
    formLabels: { [key: string]: string },
  ): boolean {
    if (form.valid) {
      return true;
    }

    const invalidControls = this.getInvalidControls(form);
    const invalidFields = invalidControls.map((control) =>
      this.getControlLabel(control, formLabels),
    );

    const invalidFieldsMessage =
      invalidFields.length > 0
        ? `Por favor, preencha os seguintes campos obrigatórios: ${invalidFields.join(', ')}.`
        : 'Existem inconsistências ou campos vazios obrigatórios.';

    this.toastService.showError(invalidFieldsMessage, 'Campos Obrigatórios');
    this.markAllAsTouched(form);
    return false;
  }
}
