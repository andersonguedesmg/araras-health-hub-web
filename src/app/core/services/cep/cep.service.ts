import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { firstValueFrom, Observable } from 'rxjs';
import { ToastService } from '../../../shared/services/toast/toast.service';

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CepService {
  private http = inject(HttpClient);
  private apiUrl = 'https://viacep.com.br/ws/';

  readonly isLoading = signal<boolean>(false);

  public getAddressByCep(cep: string): Observable<ViaCepResponse> {
    const cleanCep = cep.replace(/\D/g, '');
    return this.http.get<ViaCepResponse>(`${this.apiUrl}${cleanCep}/json/`);
  }

  async fillAddressByCep(
    addressGroup: FormGroup,
    toastService: ToastService,
  ): Promise<boolean> {
    const cepControl = addressGroup.get('cep');
    const cepValue = cepControl?.value?.replace(/\D/g, '');

    if (!cepValue || cepControl?.invalid) {
      return false;
    }

    this.isLoading.set(true);
    addressGroup.disable();

    try {
      const response = await firstValueFrom(this.getAddressByCep(cepValue));

      if (response.erro === 'true') {
        toastService.showError(
          'CEP não encontrado na base de dados dos Correios.',
        );

        addressGroup.patchValue({
          street: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: '',
        });

        cepControl?.setErrors({ cepNotFound: true });
        return false;
      }

      addressGroup.patchValue({
        street: response.logradouro || '',
        complement: response.complemento || '',
        neighborhood: response.bairro || '',
        city: response.localidade || '',
        state: response.uf || '',
      });

      return true;
    } catch (error) {
      toastService.showError(
        'Ocorreu um erro ao consultar o CEP. Tente novamente.',
      );
      return false;
    } finally {
      addressGroup.enable();
      this.isLoading.set(false);
    }
  }
}
