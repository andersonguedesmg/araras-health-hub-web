import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { isValidCnpj, isValidCpf } from '../utils/cpf-cnpj.utils';

export function cnpjValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const cleanValue = control.value.replace(/\D/g, '');
    return isValidCnpj(cleanValue) ? null : { invalidCnpj: true };
  };
}

export function cpfValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const cleanValue = control.value.replace(/\D/g, '');
    return isValidCpf(cleanValue) ? null : { invalidCpf: true };
  };
}
