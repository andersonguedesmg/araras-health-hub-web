import { Product } from "../../product/interfaces/product";

export interface Stock {
  id: number;
  productId: number;
  product: Product,
  quantity: number;
  batch: string;
}
