import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { CepService } from './cep.service';
import { firstValueFrom } from 'rxjs';
import { ToastSummaries } from '../../shared/constants/toast.constants';
import { ToastMessages } from '../../shared/constants/messages.constants';
import { ToastService } from '../../shared/services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class FormHelperService {

  constructor(
    private cepService: CepService,
  ) { }

  findInvalidControlsRecursive(form: FormGroup | AbstractControl): AbstractControl[] {
    const invalidControls: AbstractControl[] = [];
    if (form instanceof FormGroup) {
      for (const name in form.controls) {
        const control = form.controls[name];

        if (control instanceof FormGroup || control instanceof FormArray) {
          invalidControls.push(...this.findInvalidControlsRecursive(control));
        } else if (control.invalid) {
          invalidControls.push(control);
        }
      }
    } else if (form instanceof FormArray) {
      form.controls.forEach(control => {
        invalidControls.push(...this.findInvalidControlsRecursive(control));
      });
    }
    return invalidControls;
  }

  markAllControlsAsTouched(abstractControl: AbstractControl): void {
    if (abstractControl instanceof FormGroup) {
      Object.values(abstractControl.controls).forEach(control => {
        control.markAsTouched();
        if (control instanceof FormGroup || control instanceof FormArray) {
          this.markAllControlsAsTouched(control);
        }
      });
    } else if (abstractControl instanceof FormArray) {
      abstractControl.controls.forEach(control => {
        control.markAsTouched();
        if (control instanceof FormGroup || control instanceof FormArray) {
          this.markAllControlsAsTouched(control);
        }
      });
    }
  }

  getFormControlName(control: AbstractControl, formLabels: { [key: string]: string; }): string {
    const controlPath = this.getFormControlPath(control);

    if (controlPath) {
      if (formLabels[controlPath]) {
        return formLabels[controlPath];
      }

      const parts = controlPath.split('.');
      const name = parts[parts.length - 1];

      return name.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
    }

    return '';
  }

  private getFormControlPath(control: AbstractControl): string | null {
    if (!control.parent) {
      return null;
    }

    const parent = control.parent as FormGroup | FormArray;
    let controlName: string | null = null;

    if (parent instanceof FormGroup) {
      controlName = Object.keys(parent.controls).find(name => control === parent.controls[name]) || null;
    }

    if (!controlName) {
      return null;
    }

    const parentPath = this.getFormControlPath(parent);

    if (parentPath) {
      return `${parentPath}.${controlName}`;
    }

    return controlName;
  }

  async bindAddressByCep(form: FormGroup, toastService: ToastService): Promise<boolean> {
    const cepControl = form.get('cep');
    const cepValue = cepControl?.value?.replace(/\D/g, '');

    if (!cepValue || cepControl?.invalid) {
      return false;
    }

    form.disable();
    this.clearAddressFields(form);

    try {
      const response = await firstValueFrom(this.cepService.getAddressByCep(cepValue));
      if (response.erro === 'true') {
        toastService.showError(ToastMessages.CEP_NOT_FOUND, ToastSummaries.INFO);
        form.get('cep')?.enable();
        document.getElementById('cep')?.focus();
        return false;
      } else {
        form.patchValue({
          street: response.logradouro,
          complement: response.complemento || '',
          neighborhood: response.bairro,
          city: response.localidade,
          state: response.uf,
        });
        return true;
      }
    } catch (error) {
      toastService.showError(ToastMessages.CEP_CHECK_ERROR, ToastSummaries.ERROR);
      form.get('cep')?.enable();
      return false;
    } finally {
      form.enable();
    }
  }

  private clearAddressFields(form: FormGroup): void {
    form.patchValue({
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
    });
  }
}
