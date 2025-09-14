import { Product } from "../../product/interfaces/product";

export interface StockShippingItem {
  id: number;
  quantity: number;
  unitValue: number;
  totalValue: number;
  batch: string;
  expiryDate: Date;
  productId: number;
  product: Product;
}
