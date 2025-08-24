// Comando para Aprovar Pedido
export interface ApproveOrderItem {
  orderItemId: number;
  approvedQuantity: number;
}

export interface ApproveOrderCommand {
  orderId: number;
  approvedByEmployeeId: number;
  approvedByAccountId: number;
  orderItems: ApproveOrderItem[];
}

// Comando para Separar Pedido
export interface SeparateOrderItem {
  orderItemId: number;
  actualQuantity: number;
}

export interface SeparateOrderCommand {
  orderId: number;
  separatedByEmployeeId: number;
  separatedByAccountId: number;
  orderItems: SeparateOrderItem[];
}

// Comando para Finalizar Pedido
export interface FinalizeOrderCommand {
  orderId: number;
  finalizedByEmployeeId: number;
  finalizedByAccountId: number;
}
