import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
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
        if (control.invalid) {
          invalidControls.push(control);
        } else if (control instanceof FormGroup) {
          invalidControls.push(...this.findInvalidControlsRecursive(control));
        }
      }
    }
    return invalidControls;
  }

  getFormControlName(control: AbstractControl, formLabels: { [key: string]: string; }): string {
    const parent = control.parent;
    if (parent instanceof FormGroup) {
      const formGroup = parent as FormGroup;
      for (const name in formGroup.controls) {
        if (control === formGroup.controls[name]) {
          return formLabels[name] || name.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
        }
      }
    }
    return '';
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
          address: response.logradouro,
          neighborhood: response.bairro,
          city: response.localidade,
          state: response.uf,
        });
        return true;
      }
    } catch (error) {
      toastService.showError(ToastMessages.CEP_CHECK_ERROR, ToastSummaries.ERROR); form.get('cep')?.enable();
      return false;
    } finally { }
  }

  private clearAddressFields(form: FormGroup): void {
    form.patchValue({
      address: '',
      neighborhood: '',
      city: '',
      state: '',
    });
  }

}
