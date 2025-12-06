import { OrderStatus } from "../enums/order-status.enum";
import { Severity } from "../enums/severity.enum";

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

export function getOrderSeverity(status: string): TagSeverity {
  switch (status) {
    case 'Pendente de Aprovação':
      return Severity.Danger as TagSeverity;
    case 'Pronto para Separação':
      return Severity.Info as TagSeverity;
    case 'Pronto para Envio/Finalização':
      return Severity.Success as TagSeverity;
    case 'Finalizado':
      return Severity.Secondary as TagSeverity;
    case 'Cancelado':
      return Severity.Contrast as TagSeverity;
    default:
      return Severity.Warn as TagSeverity;
  }
}

export function getOrderStatus(status: string): OrderStatus {
  switch (status) {
    case 'Pendente de Aprovação':
      return OrderStatus.PendingApproval;
    case 'Pronto para Separação':
      return OrderStatus.ReadyForPicking;
    case 'Pronto para Envio/Finalização':
      return OrderStatus.ReadyForFinalization;
    case 'Finalizado':
      return OrderStatus.Completed;
    case 'Cancelado':
      return OrderStatus.Cancelled;
    default:
      return OrderStatus.Unknown;
  }
}

// [Description("Pendente de Aprovação")];
// PendingApproval = 1,

//   [Description("Pronto para Separação")];
// ReadyForPicking = 2,

//   [Description("Em Separação")];
// PickingInProgress = 3,

//   [Description("Pronto para Envio/Finalização")];
// ReadyForFinalization = 4,

//   [Description("Finalizado")];
// Completed = 5,

//   [Description("Cancelado")];
// Cancelled = 6;
