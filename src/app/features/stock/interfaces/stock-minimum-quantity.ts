export interface StockMinQuantity {
  id: number;
  productId: number;
  minQuantity: number;
  productName: string;
  productCode: string;
  productIsActive: boolean;
  currentQuantity: number;
}
