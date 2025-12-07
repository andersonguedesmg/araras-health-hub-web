import { Product } from "../../product/interfaces/product";
import { LotToSeparate } from "./lotToSeparate";

export interface OrderItem {
  id: number;

  requestedQuantity: number;
  approvedQuantity: number;
  separatedQuantity: number;
  actualQuantity: number;

  availableQuantity: number;
  productId: number;
  productName: string;
  product: Product;
  lotsToSeparate?: LotToSeparate[];
}
