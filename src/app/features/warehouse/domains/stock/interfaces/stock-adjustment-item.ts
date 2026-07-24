export interface StockAdjustmentItem {
  id: number;
  productId: number;
  stockLotId: number;
  productName: string;
  quantity: number;
  batch: string;
  brand: string;
  unitValue: number;
  totalValue: number;
  expiryDate: Date;
}
