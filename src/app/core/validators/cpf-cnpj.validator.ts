import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { isValidCpf, isValidCnpj } from '../utils/cpf-cnpj.utils';

export function cnpjValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const valid = isValidCnpj(control.value);
    return valid ? null : { invalidCnpj: true };
  };
}

export function cpfValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const valid = isValidCpf(control.value);
    return valid ? null : { invalidCpf: true };
  };
}
