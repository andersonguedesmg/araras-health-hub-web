import { OrderStatus } from "../enums/order-status.enum";
import { Severity } from "../enums/severity.enum";

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

export function getOrderSeverity(status: string): TagSeverity {
  switch (status) {
    case 'Pendente':
      return Severity.Danger as TagSeverity;
    case 'Aprovado':
      return Severity.Info as TagSeverity;
    case 'Separado':
      return Severity.Success as TagSeverity;
    case 'Finalizado':
      return Severity.Contrast as TagSeverity;
    default:
      return Severity.Warn as TagSeverity;
  }
}

export function getOrderStatus(status: string): OrderStatus {
  switch (status) {
    case 'Pendente':
      return OrderStatus.Pending;
    case 'Aprovado':
      return OrderStatus.Approved;
    case 'Separado':
      return OrderStatus.Separated;
    case 'Finalizado':
      return OrderStatus.Finalized;
    default:
      return OrderStatus.Unknown;
  }
}
