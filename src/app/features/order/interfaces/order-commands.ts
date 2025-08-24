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

export interface FinalizeOrderCommand {
  orderId: number;
  finalizedByEmployeeId: number;
  finalizedByAccountId: number;
}
