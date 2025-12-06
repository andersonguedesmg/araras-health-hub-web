export enum OrderStatus {
  PendingApproval = 'Pendente de Aprovação',
  ReadyForPicking = 'Pronto para Separação',
  PickingInProgress = 'Em Separação',
  ReadyForFinalization = 'Pronto para Envio/Finalização',
  Completed = 'Finalizado',
  Cancelled = 'Cancelado',
  Unknown = 'Desconhecido',
}
