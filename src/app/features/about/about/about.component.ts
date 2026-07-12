import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';

export interface AppFeature {
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterModule, ButtonModule, BreadcrumbComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  host: {
    class: 'block w-full h-full overflow-hidden',
  },
})
export class AboutComponent {
  readonly itemsBreadcrumb = signal([{ label: 'Sobre', routerLink: '/sobre' }]);

  readonly features = signal<AppFeature[]>([
    {
      title: 'Gestão Centralizada e Lotes',
      description:
        'Supervisão integrada de saldos em tempo real por unidade, com controle estrito de lotes e datas de validade de insumos.',
      icon: 'pi pi-box',
    },
    {
      title: 'Custo Médio Automático',
      description:
        'Cálculo financeiro automatizado e atualização imediata dos custos operacionais a partir dos recebimentos de Notas Fiscais.',
      icon: 'pi pi-percentage',
    },
    {
      title: 'Expedição Estratégica (FEFO)',
      description:
        'Algoritmos inteligentes integrados ao fluxo de pedidos que forçam a saída prioritária dos itens com vencimento próximo.',
      icon: 'pi pi-sort-alt',
    },
    {
      title: 'Rastreabilidade Operacional',
      description:
        'Log detalhado de auditoria de movimentações e fluxos de estornos para total transparência gerencial e patrimonial.',
      icon: 'pi pi-shield',
    },
  ]);
}
