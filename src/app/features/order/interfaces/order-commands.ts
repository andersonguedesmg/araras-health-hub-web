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
  productId: number;
  actualQuantity: number;
  separatedLots: SeparatedLot[];
}

export interface SeparateOrderCommand {
  orderId: number;
  separatedByEmployeeId: number;
  separatedByAccountId: number;
  orderItems: SeparateOrderItem[];
}

export interface SeparatedLot {
  batch: string;
  brand: string;
  quantity: number;
}

export interface FinalizeOrderCommand {
  orderId: number;
  finalizedByEmployeeId: number;
  finalizedByAccountId: number;
}
