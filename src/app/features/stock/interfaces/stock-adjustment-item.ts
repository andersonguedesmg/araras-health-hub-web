export interface StockAdjustmentItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  batch: string;
  unitValue: number;
  totalValue: number;
  expiryDate: Date;
}
