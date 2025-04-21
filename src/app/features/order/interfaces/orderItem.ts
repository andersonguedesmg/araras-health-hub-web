import { Product } from "../../product/interfaces/product";

export interface OrderItem {
  id: number;

  requestedQuantity: number;
  approvedQuantity: number;
  separatedQuantity: number;
  actualQuantity: string;

  productId: number;
  product: Product;
}
